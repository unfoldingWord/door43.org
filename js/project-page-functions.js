var myCommitId, myRepoName, myOwner, nav_height, header_height;
var projectPageLoaded = false;
var _StatHat = _StatHat || [];
_StatHat.push(['_setUser', 'NzMzIAPKpWipEWR8_hWIhqlgmew~']);
(function() {
  var sh = document.createElement('script'); sh.type = 'text/javascript';
  sh.async = true;
  sh.src = '//www.stathat.com/javascripts/api.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(sh, s);
})();

$(document).ready(function(){
    onProjectPageLoaded();
});

/**
 * Called to initialize the project page
 */
function onProjectPageLoaded() {
  if(projectPageLoaded)
    return;
  projectPageLoaded = true;

  onProjectPageChange();

  $('#starred-icon').click(function () {
    if ($(this).hasClass('starred')) {
      $(this).removeClass('starred');
      $(this).find('i').removeClass('fa-star').addClass('fa-star-o');
    }
    else {
      $(this).addClass('starred');
      $(this).find('i').removeClass('fa-star-o').addClass('fa-star');
    }
  });

  var filename = window.location.href.split('?')[0].split('/').pop();
  $('#left-sidebar').find('#page-nav option[value="' + filename + '"]').attr('selected', 'selected');

  $.getJSON("build_log.json", function (myLog) {
    var $revisions = $('#left-sidebar').find('#revisions');
    processBuildLogJson(myLog, $('#download_menu_button'), $('#build-status-icon'), $('#last-updated'), $revisions);

    $.getJSON("../project.json", function (project) {
        processProjectJson(project, $revisions);
    })
      .done(function () {
        console.log("processed project.json");
      })
      .fail(function () {
        console.log("error reading project.json");
      }); // End getJSON
  })
    .done(function () {
      console.log("processed my own build_log.json");
    })
    .fail(function () {
      console.log("error reading my own build_log.json");
    })
    .always(function() {
      setDcsHref(window.location)
    }); // End getJSON

  $(document).on('scroll', function () {
    onDocumentScroll(window);
  }).trigger('scroll');

  /* set up scrollspy */
  var $body = $('body');
  $body.scrollspy({'target': '.content-nav', 'offset':nav_height});
  // Offset in the above for some reason doesn't work, so we fix it this way with a little hack:
  var data = $body.data('bs.scrollspy');
  if (data) {
      data.options.offset = nav_height+100;
      $body.data('bs.scrollspy', data);
      $body.scrollspy('refresh');
  }

  /* smooth scrolling to sections with room for navbar */
  $('#right-sidebar-nav').addClass('content-nav'); // ensure it has this class
  var $contentNav = $(".content-nav");
  $contentNav.find("li a[href^='#']").on('click', function (e) {
    // prevent default anchor click behavior
    e.preventDefault();
    // store hash
    var hash = this.hash;
    var hashLocation = $(hash).offset().top - nav_height - header_height - 5;
    // animate
    $('html, body').animate({
      scrollTop: hashLocation
    }, 300, function () {
      // when done, add hash to url
      // (default click behaviour)
      window.location.hash = hash;
    });
  });

  /* Scroll to current section if URL has hash */
  if (window.location.hash) {
    var hash = window.location.hash;
    var $link = $contentNav.find("li a[href='" + hash + "']");
    $link.trigger('click');
  }

  $(window).on('scroll resize', function () {
    $('#left-sidebar-nav, #right-sidebar-nav').css('bottom', getVisibleHeight('footer'));
  });

  setPageViews($('#num-of-views'),window.location.href,1);

  var $footer = $("[property='dct:title']");
  updateFooter($footer, $("title"));

    if(get_window_width() <= 990) {
        setupMobileContentNavigation();
    }
    $(window).resize(onWindowResize());
}

function processProjectJson(project, $revisions) {
    var counter = 1;
    $.each(project.commits.reverse(), function (index, commit) {
        var date = new Date(commit.created_at);
        var options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZone: "UTC"
        };

        var display = (counter++ > 10) ? 'style="display: none"' : '';
        var iconHtml = getCommitConversionStatusIcon(commit.status);
        var dateStr = date.toLocaleString("en-US", options);

        if (commit.id !== myCommitId) {
            dateStr = '<a href="../' + commit.id + '/index.html" onclick="_StatHat.push(["_trackCount", "pQvhLnxZPaYA0slgLsCR7CBPM2NB", 1.0]);">' + dateStr + '</a>';
        }

        $revisions.append('<tr ' + display + '><td>' + dateStr + '</td><td>' + iconHtml + '</td></tr>');
    }); // End each

    if (counter > 10)
        $revisions.append('<tr id="view_more_tr"><td colspan="2" class="borderless"><a href="javascript:showTenMore();">View More...</a></tr>');
}

function processBuildLogJson(myLog, $downloadMenuButton, $buildStatusIcon, $lastUpdated, $revisions) {
    myCommitId = myLog.commit_id.substring(0, 10);
    myOwner = myLog.repo_owner;
    myRepoName = myLog.repo_name;
    $lastUpdated.html("Updated " + timeSince(new Date(myLog.created_at)) + " ago");

    saveDownloadLink(myLog);
    setDownloadButtonState($downloadMenuButton);
    updateTextForDownloadItem(myLog.input_format);
    updateConversionStatusOnPage($buildStatusIcon, myLog);
    $revisions.empty();
}

function updateConversionStatusOnPage($buildStatusIcon, myLog) {
    if(CONVERSION_TIMED_OUT) {
        myLog.status = "failed";
        if(!myLog.errors) {
            myLog.errors = [];
        }
        const errorMsg = "Conversion Timed Out!\nStarted " + timeSince(new Date(myLog.created_at)) + " ago";
        myLog.errors.unshift(errorMsg);
        console.log(errorMsg);
        $('h1.conversion-requested').text("ERROR: Conversion timed out!");
    }

    $buildStatusIcon.find('i').attr("class", "fa " + faSpinnerClass); // default to spinner
    setOverallConversionStatus(myLog.status);

    if(myLog.warnings.length) {
        var modal_html = '<ul><li>' + myLog.warnings.join("</li><li>") + '</li></ul>';
        $buildStatusIcon.on('click', function () {
            _StatHat.push(["_trackCount", "PgNkqAnDE37z2tStLTSmTyBLb2Zo", 1.0]);
            showWarningModal(modal_html);
        }).attr('title', 'Click to see warnings');
    }
}

function showWarningModal(modal_body){
    var html =  '<div id="warning-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">'+
            '  <div class="modal-dialog">'+
            '    <div class="modal-content">'+
            '      <div class="modal-header">'+
            '        <a class="close" data-dismiss="modal">×</a>'+
            '        <div class="warning-circle"><i class="fa fa-exclamation"></i></div>'+
            '        <h3 class="warning-header">Warning!</h3>'+
            '      </div>'+
            '      <div id="warnings-list" class="modal-body">'+
            modal_body +
            '      </div>'+
            '      <div class="modal-footer">'+
            '        <a href="mailto:help@door43.org'+
            '?subject='+encodeURIComponent('Build Warning: '+myOwner+'/'+myRepoName)+
            '&body='+encodeURIComponent("Type your question here\n\nSee the failure at "+window.location.href+"\n\n")+
            '" class="btn btn-secondary raised">Ask the Help Desk</a>'+
            '        <span class="btn btn-primary raised" data-dismiss="modal">Ok, Got it!</span>'+
            '        <span class="btn btn-secondary raised" onclick="printWarnings()">Print</a>'+
            '      </div>'+
            '    </div>'+
            '  </div>'+
            '</div>';

    $('body').append(html);
    $("#warning-modal").modal().modal('show').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

var printLoaded = false;

function printWarnings() {
    const $warnings = $("#warnings-list");
    const title = "Conversion Warnings";
    if(printLoaded) {
        printWarningsSub($warnings, title);
    } else {
        $.getScript('/js/jQuery.print.js', function () {
            printLoaded = true;
            printWarningsSub($warnings, title);
        });
    }
}

function printWarningsSub($warnings, title) {
    $warnings.print({
        //Use Global styles
        globalStyles: false,
        //Add link with attrbute media=print
        mediaPrint: false,
        //Custom stylesheet
        stylesheet: "http://fonts.googleapis.com/css?family=Inconsolata",
        //Print in a hidden iframe
        iframe: true,
        //Don't print this
        noPrintSelector: ".avoid-this",
        //Add this at top
        prepend: title,
        //Log to console when printing is done via a deffered callback
        deferred: $.Deferred().done(function () {
            console.log('Printing done', arguments);
        })
    });
}

/**
 * Called when the document scroll event fires.
 *
 * NOTE: the window object is passed as a parameter so the function is testable. Because of the
 *       asynchronous nature of javascript, the unit test finishes before the onScroll event fires.
 *
 * @param theWindow
 */
function onDocumentScroll(theWindow) {
    var $document = $(theWindow.document);
    var scroll_top = theWindow.scrollY;
    var $pinned = $document.find('#pinned-header');

    if (get_window_width() > 990) {
        if (scroll_top > 1) {
            if (!$pinned.hasClass('pin-to-top')) {
                $pinned.addClass('pin-to-top').css('top', nav_height + 'px');
                $('.page-content').css('margin-top', (nav_height + header_height) + 'px');
                onProjectPageChange();
            }
        } else {
            if ($pinned.hasClass('pin-to-top')) {
                $pinned.removeClass('pin-to-top').css('top', '');
                $('.page-content').css('margin-top', 0);
                onProjectPageChange();
            }
        }
    }
}

function getVisibleHeight(selector) {
  var $el = $(selector),
    scrollTop = $(this).scrollTop(),
    scrollBot = scrollTop + $(this).height();
  var $el_offset = $el.offset();
  var elTop = $el_offset ? $el_offset.top : 0;
  var elBottom = elTop + $el.outerHeight(),
    visibleTop = elTop < scrollTop ? scrollTop : elTop,
    visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
  if ((visibleBottom - visibleTop) > 0)
    return visibleBottom - visibleTop;
  else
    return 0;
}

//noinspection JSUnusedGlobalSymbols
function showTenMore(){
  _StatHat.push(["_trackCount", "wShy-AE8rCXbQkCJepSvfSA3eUVzaw~~", 1.0]);
  var $revisions = $('#left-sidebar').find('#revisions');
  var counter = 0;

  // get the rows still hidden
  var hiddenRows = $revisions.find('tr').filter(function() {
    var $this = $(this);
    return $this.css('display') === 'none';
  });

  // show the next batch of rows
  while (counter < 10 && counter < hiddenRows.length) {
    hiddenRows[counter].style.display = '';
    counter++;
  }

  // if all rows are now visible, hide the View More link
  if (counter >= hiddenRows.length) {
    $revisions.find('#view_more_tr').css('display', 'none');
  }
}

function printAll(){
  _StatHat.push(["_trackCount", "5o8ZBSJ6yPfmZ28HhXZPaSBNYzRU", 1.0]);
  var id = myOwner+"/"+myRepoName+"/"+myCommitId;
  var api_domain = "api.door43.org";
  var api_prefix = "";
  switch(window.location.hostname){
    case "dev.door43.org":
      api_prefix = "dev-";
      break;
    case "test-door43.org.s3-website-us-west-2.amazonaws.com":
      api_prefix = "test-";
      break;
  }
  window.open("https://"+api_prefix+api_domain+"/tx/print?id="+id,'_blank');
}

/**
 * Gets the link back to DCS for the current page
 * @param pathname The value from window.location.pathname
 */
function getDcsLink(pathname) {

  // split the URL into its parts
  var path_parts = pathname.split('/');
  path_parts = path_parts.filter(function(s) {
    return s !== '';
  });

  // length must be at least 3
  if (path_parts.length < 3)
    return '';

  // the first part should be 'u'
  if (path_parts[0] !== 'u')
    return '';

  // the second and third parts are what we need
  return 'https://git.door43.org/' + path_parts[1] + '/' + path_parts[2];
}

/**
 * Sets the href of the link to DCS
 * @param location Should pass window.location to this function
 */
function setDcsHref(location) {

  var href;

  if (myRepoName && myOwner)
    href = 'https://git.door43.org/' + myOwner + '/' + myRepoName;
  else
    href = getDcsLink(location.pathname);

  $('#see-on-dcs').attr('href', href);
}

/**
 * get commitID for download
 * @param [commitID] if not set will try to use myCommitId and then try to extract from pageUrl
 * @param [pageUrl] if not set will use page href
 * @returns commitID
 */
function getCommid(commitID, pageUrl) {
    if(!commitID) { // if found in build_log.json
        if (myCommitId) { // if found in build_log.json
            commitID = myCommitId;
        } else {
            commitID = extractCommitFromUrl(pageUrl);
        }
    }

    return commitID;
}

/**
 * update download menu item with appropriate text based on input_format - markdown for md, and USFM otherwise
 * @param inputFormat
 */
function updateTextForDownloadItem(inputFormat) {
    var $downloadMenuItem = getSpanForDownloadMenuItem();
    if ($downloadMenuItem) {
        var downloadItemText = getTextForDownloadItem(inputFormat);
        $downloadMenuItem.html(downloadItemText);
    }
}

/**
 * get span that has text for download menu item
 * @return {*} jQuery item or null if not found
 */
function getSpanForDownloadMenuItem() {
    var $downloadMenuItem = $('#download_menu_source_item'); // quickest way
    if (! $downloadMenuItem.length) { // if not found on older pages, try to drill down in menu
        $downloadMenuItem = $("#download_menu ul li span");
        if (! $downloadMenuItem.length) { // if still not found, return null
            return null;
        }
    }
    return $downloadMenuItem;
}

/**
 * get text to show based on input_format - markdown for md, and USFM otherwise
 * @param inputFormat
 * @return {string}
 */
function getTextForDownloadItem(inputFormat) {
    var downloadItemText = (inputFormat === 'md') ? "Markdown" : 'USFM';
    return downloadItemText;
}

function getCheckDownloadsUrl(commitID, pageUrl) {
    var prefix = getSiteFromPage(pageUrl);
    return 'https://' + prefix + 'api.door43.org/check_download?commit_id=' + commitID;
}

function setDownloadButtonState($button, commitID, pageUrl) {
    if (pageUrl === undefined) {
        pageUrl = window.location.href
    }
    var commitID_ = getCommid(commitID, pageUrl);
    var url = getCheckDownloadsUrl(commitID_, pageUrl);

    if($button) {
        $button.prop('disabled', true)
    }
    $.ajax({
        url: url,
        type: 'GET',
        cache: "false",
        dataType: 'jsonp',
        success: function (data, status) {
                if(data.download_exists) {
                    if($button) {
                        $button.prop('disabled', false)
                    }
                }
                return data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            const error = 'Error: ' + textStatus + '\n' + errorThrown;
            console.log(error);
            return error;
        }
    });
}

const DEFAULT_DOWNLOAD_LOCATION = "https://s3-us-west-2.amazonaws.com/tx-webhook-client/preconvert/";
var source_download = null;

/**
 * parse page url to get commit key
 * @param pageUrl
 * @return {{pageUrl: *, commit: *}}
 */
function extractCommitFromUrl(pageUrl) {
    if (pageUrl === undefined) {
        pageUrl = window.location.href
    }

    var parts = pageUrl.split("/");
    var commitID = parts[6];
    return commitID;
}

/**
 * get URL for download
 * @param [pageUrl] if not set will use page href
 * @returns {*}
 */
function getDownloadUrl(pageUrl) {
    _StatHat.push(["_trackCount", "eBQk6-wY9ziv3D77-qhJuiBYM3Z2", 1.0]);
    if(source_download) { // if found in build_log.json
        return source_download;
    }
    var commitID = extractCommitFromUrl(pageUrl);
    var download = DEFAULT_DOWNLOAD_LOCATION + commitID + ".zip";
    return download;
}

/**
 * get download link from build log
 * @param myLog
 */
function saveDownloadLink(myLog) {
    try {
        source_download = myLog.source;
        if(source_download) {
            return;
        }
    } catch(e) {
    }
    source_download = null;
}

function getPageViewUrl(pageUrl) {
    var prefix = getSiteFromPage(pageUrl);
    return 'https://' + prefix + 'api.door43.org/page_view_count';
}

function setPageViews(span, pageUrl, increment) {
    var url = getPageViewUrl(pageUrl);
    return getAndUpdatePageViews(span, url, pageUrl, increment);
}

/**
 * if 'HEADING' was left in footer, need to replace it with page title text
 * @param $footer
 * @param $title
 */
function updateFooter($footer, $title) {
    if ($footer && $footer.length) {
        var footerText = $footer[0].innerHTML;
        if ($title && $title.length) {
            var matchText = "{{ HEADING }}";
            var pos = footerText.indexOf(matchText);
            if (pos >= 0) {
                var replaceText = $title[0].innerText;
                var newText = footerText.replace(matchText, replaceText);
                $footer.html(newText);
            }
        }
    }
}

function onProjectPageChange(){
    nav_height = $('.navbar').outerHeight(true);
    header_height = $('#pinned-header').outerHeight(true);
    /* Set/update the affix offset for left, right and content (if mobile) */
    $('#left-sidebar-nav, #right-sidebar-nav').affix({
        offset: {
            top: nav_height + header_height - 100
        }
    }).css('top', (nav_height + header_height)+'px');
    $('#content-header').affix({
        offset: {
            top: nav_height
        }
    }).css('top', nav_height+'px');
}

function setupMobileContentNavigation() {
    var content_header = $('<div id="content-header"></div>').affix({
        offset: {
            top: nav_height
        }
    }).css('top', nav_height+'px');

    var header = $('#content > h1:first');
    header.appendTo(content_header);

    var toggle_button = $('<a id="mobile-content-nav-toggle" href="#"></a>');
    toggle_button.appendTo(header);

    var content_nav = $('#right-sidebar-nav');
    content_nav.removeClass('hidden-sm hidden-xs').attr('id', 'mobile-content-nav');
    content_nav.hide();
    content_nav.appendTo(content_header);

    var content = $('#content');
    content.wrapInner('<div id="content-body"></div>');

    content_header.prependTo(content);

    toggle_button.click(function () {
        toggleMobileContentNav();
    });
    $('#mobile-content-nav a').click(function () {
        if (!$(this).hasClass('accordion-toggle'))
            closeMobileContentNav();
    });

    onProjectPageChange();
}

function teardownMobileContentNavigation() {
    var content = $('#content');
    var content_header = $('#content-header');

    $('#mobile-content-nav-toggle').remove();
    var header = content_header.find('h1:first');
    header.appendTo(content);

    var content_nav = $('#mobile-content-nav');
    content_nav.addClass('hidden-sm hidden-xs').attr('id', 'right-sidebar-nav');
    content_nav.show();
    content_nav.prependTo($('#right-sidebar'));
    content_header.remove();

    var content_body = $('#content-body');
    content_body.children().appendTo(content);
    content_body.remove();
}

function toggleMobileContentNav(){
    if($('#mobile-content-nav').is(':visible')) {
        closeMobileContentNav();
    } else {
        openMobileContentNav();
    }
}

function openMobileContentNav(){
    $('#mobile-content-nav').slideDown();
    $('#content-header').css('bottom', 0);
    $('#mobile-content-nav-toggle').addClass('expanded');
}

function closeMobileContentNav(){
    $('#mobile-content-nav').slideUp();
    $('#content-header').css('bottom', '');
    $('#mobile-content-nav-toggle').removeClass('expanded');
}

function get_window_width(){
    return $(window).width();
}

function onWindowResize() {
    onProjectPageChange();

    if (get_window_width() <= 990) {
        if (!$('#mobile-content-nav').length)
            setupMobileContentNavigation();
    }
    else {
        if ($('#mobile-content-nav').length)
            teardownMobileContentNavigation();
    }
}

var conversion_start_time = new Date(); // default to current time
var recent_build_log = null;
var CONVERSION_TIMED_OUT = false; // global fail status
const MAX_CHECKING_INTERVAL = 600000; // maximum 10 minutes of checking

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

function checkAgainForBuildCompletion() {
    if((new Date() - conversion_start_time) > MAX_CHECKING_INTERVAL) {
        showBuildStatusAsTimedOut($('#build-status-icon'));
    } else {
        setTimeout(checkConversionStatus, 10000); // wait 10 second before checking
    }
}

function reloadPage() {
    window.location.reload(true); // conversion finished, reload page
}

function checkConversionStatus() {
    $.getJSON("build_log.json", function (myLog) {
        var iconType = eConvStatus.ERROR;
        if(myLog) {
            recent_build_log = myLog;
            iconType = getDisplayIconType(myLog.status);
        }
        if (iconType === eConvStatus.ERROR) {
            console.log("conversion error");
        } else if (iconType !== eConvStatus.IN_PROGRESS) {
            console.log("conversion completed");
            reloadPage();
        } else {
            conversion_start_time = new Date(myLog.created_at);
            checkAgainForBuildCompletion();
        }
    })
    .fail(function () {
        console.log("error reading build_log.json, retry in 10 seconds");
        checkAgainForBuildCompletion();
    }); // End getJSON
}

function checkForConversionRequested($conversion_requested) {
    if($conversion_requested && ($conversion_requested.length)) {
        console.log("conversion in process");
        checkConversionStatus();
    }
}

checkForConversionRequested($('h1.conversion-requested'));
