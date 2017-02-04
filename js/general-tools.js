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
}

var faSpinnerClass = 'fa-spinner fa-spin';
const StatusImagesUrl = "https://cdn.door43.org/assets/img/icons/";

function setOverallConversionStatus(status) {
    var iconType = getDisplayIconType(status);
    if (iconType != eConvStatus.IN_PROGRESS) {
        iconHtml = getConversionStatusIconHtml(iconType, status, true, true);
        $('#build-status-icon').html(iconHtml); // replace default spinner
    }
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

function getConversionStatusIconHtml(iconType, title, longWidth, largeSize) {
    var url = null;
    if(iconType == eConvStatus.IN_PROGRESS) {
        return '<i class="fa ' + faSpinnerClass + '" title="' + title + '"></i>';
    }

    url = getNewStatusIcon(status, longWidth,largeSize);
    if(url) {
        var html = '<img src="' + url + '" alt="'+title+'" >';
        return html;
    }

    return "";
}

function getNewStatusIcon(status, longWidth,largeSize) {
    var suffix = largeSize ? "-large.png" : "-small.png";
    var middle = longWidth ? "-long" : "-short";
    switch(status){

        case eConvStatus.SUCCESS:
            return buildImageUrl('success', middle, suffix);
        case eConvStatus.WARNING:
            return buildImageUrl('warning', middle, suffix);
        case eConvStatus.ERROR:
        default:
            return buildImageUrl('error', middle, suffix);
    }
}

function buildImageUrl(prefix, middle, suffix) {
    var path = StatusImagesUrl + prefix + middle + suffix;
    return path;
}

