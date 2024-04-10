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

function processPageViewSuccessResponse(data) {
    var response = { };
    if (data.hasOwnProperty('ErrorMessage')) {
        response['error'] = 'Error: ' + data['ErrorMessage'];
    }
    else if (data.hasOwnProperty('view_count')) {
        var viewCount = data['view_count'];
        var message = viewCount + ' view';
        if (viewCount > 1) {
            message += 's';
        }
        response['message'] = message;
    } else {
        response['error'] = 'Error: illegal response';
    }
    return response;
}

function getAndUpdatePageViews(span, pageCountUrl, pageUrl, increment) {
    // // THE BELOW WAS DISABLED BY richmahn ON 2024-04-10 - DEPRECATED

    // var params = {
    //     path: pageUrl,
    //     increment: increment
    // };

    // $.ajax({
    //     url: pageCountUrl,
    //     type: 'GET',
    //     cache: "false",
    //     data: params,
    //     dataType: 'jsonp',
    //     success: function (data, status) {
    //         var response = processPageViewSuccessResponse(data);
    //         if (span && response.hasOwnProperty('message')) {
    //             span.html(response['message']);
    //         }
    //         if (response.hasOwnProperty('error')) {
    //             console.log(response['error'], data);
    //         }
    //         return response;
    //     },
    //     error: function (jqXHR, textStatus, errorThrown) {
    //         const error = 'Error: ' + textStatus + '\n' + errorThrown;
    //         console.log(error);
    //         return error;
    //     }
    // });
    return false;
}

function beginsWith(pageUrl, match) {
    const pos = pageUrl.indexOf(match);
    return pos === 0;
}

function getSiteFromPage(pageUrl) {
    var prefix = '';
    try {
        var parts = pageUrl.split('//');
        if (parts.length > 1) {
            var netloc = parts[1];
            if (beginsWith(netloc, 'dev') || beginsWith(netloc, 'test') || beginsWith(netloc, 'localhost') || beginsWith(netloc, '127.0.0.1')) {
                prefix = 'dev-';
            }
        }
    } catch (e) {
        console.log("Exception on page URL '" + pageUrl + "': " + e);
    }
    return prefix;
}

function getAndUpdateLanguagePageViews(span, pageUrl, increment) {
    var url = getLanguagePageViewUrl(pageUrl);
    return getAndUpdatePageViews(span, url, pageUrl, increment);
}

function getLanguagePageViewUrl(pageUrl) {
    var prefix = getSiteFromPage(pageUrl);
    return 'https://' + prefix + 'api.door43.org/language_view_count';
}
