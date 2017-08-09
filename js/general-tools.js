/**
 * General functions for generating icons, dates, etc.
 */
function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

eConvStatus = {
    IN_PROGRESS : 1,
    SUCCESS : 2,
    WARNING : 3,
    ERROR: 4
};

GTimageSizes = {
    "error-long-large.png" : [101, 37],
    "success-long-large.png" : [121, 37],
    "warning-long-large.png" : [129, 37],
    "error-long-small.png" : [57, 21],
    "success-long-small.png" : [68, 21],
    "warning-long-small.png" : [72, 21],

    "error-short-large.png" : [36, 36],
    "success-short-large.png" : [35, 36],
    "warning-short-large.png" : [36, 35],
    "error-short-small.png" : [14, 14],
    "success-short-small.png" : [14, 14],
    "warning-short-small.png" : [14, 14]
};

var faSpinnerClass = 'fa-spinner fa-spin';
const StatusImagesUrl = "https://cdn.door43.org/assets/img/icons/";

function lookupSizeForImage(imageName) {
    if(GTimageSizes.hasOwnProperty(imageName)) {
        return GTimageSizes[imageName];
    }
    return null;
}

function setOverallConversionStatus(status) {
    var iconType = getDisplayIconType(status);
    var iconHtml;
    if (iconType != eConvStatus.IN_PROGRESS) {
        iconHtml = getConversionStatusIconHtml(iconType, status, true, true);
        $('#build-status-icon').html(iconHtml); // replace default spinner
    }
    return iconHtml;
}

function getCommitConversionStatusIcon(status) {
    var iconType = getDisplayIconType(status);
    var html = getConversionStatusIconHtml(iconType, status, false, false);
    return html;
}

function getDisplayIconType(status) {
    switch(status){
        case 'requested':
        case 'started': return eConvStatus.IN_PROGRESS;
        case 'success': return eConvStatus.SUCCESS;
        case 'warnings': return eConvStatus.WARNING;
        case 'critical':
        case 'failed':
        default: return eConvStatus.ERROR;
    }
}

function getConversionStatusIconHtml(iconType, title, longWidth, largeHeight) {
    if(iconType == eConvStatus.IN_PROGRESS) {
        return '<i class="fa ' + faSpinnerClass + '" title="' + title + '"></i>';
    }

    var icon = getNewStatusIcon(iconType, longWidth, largeHeight);
    if(icon) {
        var sizeStr = getImageDimensions(icon);
        var html = '<img src="' + StatusImagesUrl + icon + '" alt="' + title + '"' + sizeStr + '>';
        return html;
    }

    return "";
}

function getImageDimensions(icon) {
    var sizeStr = "";
    var size = lookupSizeForImage(icon);
    if((size) && (size.length == 2)) {
        sizeStr = ' height="' + size[1] + '" width="' + size[0] + '"';
    }
    return sizeStr;
}

function getNewStatusIcon(status, longWidth, largeHeight) {
    switch(status){
        case eConvStatus.SUCCESS:
            return buildImageUrl('success', longWidth, largeHeight);
        case eConvStatus.WARNING:
            return buildImageUrl('warning', longWidth, largeHeight);
        case eConvStatus.ERROR:
        default:
            return buildImageUrl('error', longWidth, largeHeight);
    }
}

function buildImageUrl(prefix, longWidth, largeHeight) {
    var suffix = largeHeight ? "-large.png" : "-small.png";
    var middle = longWidth ? "-long" : "-short";
    var path = prefix + middle + suffix;
    return path;
}

// not all browsers support string.startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

var conversion_start_time = new Date(); // default to current time
var recent_build_log = null;
var CONVERSION_TIMED_OUT = false; // global fail status

function checkAgainForBuildCompletion() {
    if((new Date() - conversion_start_time) > 600000) { // maximum 10 minutes of checking
        showBuildStatusAsTimedOut($('#build-status-icon'));
    } else {
        setTimeout(checkConversionStatus, 10000); // wait 10 second before checking
    }
}

function showBuildStatusAsTimedOut($buildStatusIcon) {
    console.log("conversion wait timeout");
    if (!recent_build_log) {
        recent_build_log = {
            status: "failed",
            created_at: conversion_start_time
        };
    }
    CONVERSION_TIMED_OUT = true;
    try {
        updateConversionStatusOnPage($buildStatusIcon, recent_build_log);
    } catch(e) {
        console.log("failed to set page status: " + e);
    }
}

function checkConversionStatus() {
    $.getJSON("build_log.json", function (myLog) {
        var iconType = eConvStatus.IN_PROGRESS;
        if(myLog) {
            recent_build_log = myLog;
            iconType = getDisplayIconType(myLog.status);
        }
        if (iconType !== eConvStatus.IN_PROGRESS) {
            console.log("conversion completed");
            window.location.reload(true); // conversion finished, reload page
        } else {
            try {
                conversion_start_time = new Date(myLog.created_at);
            } catch(e) {
                console.log("failed to get conversion start time: " + e);
            }
            checkAgainForBuildCompletion();
        }
    })
    .fail(function () {
        console.log("error reading my own build_log.json, retry in 10 seconds");
        checkAgainForBuildCompletion();
    }); // End getJSON
}

function checkForConversionRequested($conversion_requested) {
    if($conversion_requested && ($conversion_requested.length)) {
        console.log("conversion in process");
        $.getScript('/js/project-page-functions.js', function() {
            checkConversionStatus();
        }); // make sure page functions loaded
    }
}

checkForConversionRequested($('h1.conversion-requested'));
