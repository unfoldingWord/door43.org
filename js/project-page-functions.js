var myCommitId, myRepoName, myOwner, margin_top;

$(document).ready(function () {
    onProjectPageLoaded();
});

/**
 * Called to initialize the project page
 */
function onProjectPageLoaded() {

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

  // pin the header below the menu rather than scroll out of view
  margin_top = parseInt($('#pinned-header').css('margin-top'));

  $(document).on('scroll', function () {
    onDocumentScroll(window);
  });

  /* set up scrollspy */
  var navHeight = $('.navbar').outerHeight(true);
  $('#sidebar-nav, #revisions-div').affix({
    offset: {
      top: navHeight + margin_top
    }
  });
  var $body = $('body');
  $body.scrollspy({'target': '#right-sidebar-nav', 'offset':navHeight});
  // Offset in the above for some reason doesn't work, so we fix it this way with a little hack:
  var data = $body.data('bs.scrollspy');
  if (data) {
      data.options.offset = navHeight+100;
      $body.data('bs.scrollspy', data);
      $body.scrollspy('refresh');
  }
  /* smooth scrolling to sections with room for navbar */
  var $rightSidebarNav = $("#right-sidebar-nav");
  $rightSidebarNav.find("li a[href^='#']").on('click', function (e) {
    // prevent default anchor click behavior
    e.preventDefault();
    // store hash
    var hash = this.hash;
    // animate
    $('html, body').animate({
      scrollTop: $(hash).offset().top - navHeight - 5
    }, 300, function () {
      // when done, add hash to url
      // (default click behaviour)
      window.location.hash = hash;
    });
  });

  /* Scroll to current section if URL has hash */
  if (window.location.hash) {
    $rightSidebarNav.find("li a[href='#" + window.location.hash + "']").trigger('click');
  }

  $(window).on('scroll resize', function () {
    $('#sidebar-nav, #revisions-div').css('bottom', getVisibleHeight('footer'));
  });

  setPageViews($('#num-of-views'),window.location.href,1);

  var $footer = $("[property='dct:title']");
  updateFooter($footer, $("title"));
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
            dateStr = '<a href="../' + commit.id + '/index.html">' + dateStr + '</a>';
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

    $buildStatusIcon.find('i').attr("class", "fa " + faSpinnerClass); // default to spinner
    setOverallConversionStatus(myLog.status);

    if(myLog.warnings.length) {
        var modal_html = '<ul><li>'+myLog.warnings.join("</li><li>")+'</li></ul>';
        $buildStatusIcon.on('click', function () {
            showWarningModal(modal_html);
        }).attr('title', 'Click to see warnings');
    }

    $revisions.empty();
}

function showWarningModal(modal_body){
    html =  '<div id="warning-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">'+
            '  <div class="modal-dialog">'+
            '    <div class="modal-content">'+
            '      <div class="modal-header">'+
            '        <a class="close" data-dismiss="modal">×</a>'+
            '        <div class="warning-circle"><i class="fa fa-exclamation"></i></div>'+
            '        <h3 class="warning-header">Warning!</h3>'+
            '      </div>'+
            '      <div class="modal-body">'+
            modal_body +
            '      </div>'+
            '      <div class="modal-footer">'+
            '        <a href="mailto:help@door43.org'+
            '?subject='+encodeURIComponent('Build Warning: '+myOwner+'/'+myRepoName)+
            '&body='+encodeURIComponent("Type your question here\n\nSee the failure at "+window.location.href+"\n\n")+
            '" class="btn btn-secondary raised">Ask the Help Desk</a>'+
            '        <span class="btn btn-primary raised" data-dismiss="modal">Ok, Got it!</span>'+
            '      </div>'+
            '    </div>'+
            '  </div>'+
            '</div>';

    $('body').append(html);
    $("#warning-modal").modal().modal('show').on('hidden.bs.modal', function() {
        $(this).remove();
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
  var $outer = $document.find('#outer-content');
  var $pinned = $document.find('#pinned-header');

  if (scroll_top > margin_top - 10) {
    $pinned.addClass('pin-to-top');
    $('#sidebar-nav, #revisions-div').addClass('pin-to-top');

    if ($outer.css('marginTop') !== '240px')
      $outer.css('marginTop', '240px');
  }
  else {
    $pinned.removeClass('pin-to-top');
    $('#sidebar-nav, #revisions-div').removeClass('pin-to-top');

    if ($outer.css('marginTop') !== '0px')
      $outer.css('marginTop', '0px');
  }
}

function getVisibleHeight(selector) {
  var $el = $(selector),
    scrollTop = $(this).scrollTop(),
    scrollBot = scrollTop + $(this).height(),
    elTop = $el.offset().top,
    elBottom = elTop + $el.outerHeight(),
    visibleTop = elTop < scrollTop ? scrollTop : elTop,
    visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
  if ((visibleBottom - visibleTop) > 0)
    return visibleBottom - visibleTop;
  else
    return 0;
}

//noinspection JSUnusedGlobalSymbols
function showTenMore(){

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
    downloadable = false;
    $.ajax({
        url: url,
        type: 'GET',
        cache: "false",
        dataType: 'jsonp',
        success: function (data, status) {
                console.log(data);
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
            if (beginsWith(netloc, 'dev')) {
                prefix = 'dev-';
            } else if (beginsWith(netloc, 'test') || beginsWith(netloc, 'localhost') || beginsWith(netloc, '127.0.0.1')) {
                prefix = 'test-';
            }
        }
    } catch (e) {
        console.log("Exception on page URL '" + pageUrl + "': " + e);
    }
    return prefix;
}

function getLanguagePageViewUrl(pageUrl) {
    var prefix = getSiteFromPage(pageUrl);
    return 'https://' + prefix + 'api.door43.org/language_view_count';
}

function getPageViewUrl(pageUrl) {
    var prefix = getSiteFromPage(pageUrl);
    return 'https://' + prefix + 'api.door43.org/page_view_count';
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
    var params = {
        path: pageUrl,
        increment: increment
    };

    $.ajax({
        url: pageCountUrl,
        type: 'GET',
        cache: "false",
        data: params,
        dataType: 'jsonp',
        success: function (data, status) {
            var response = processPageViewSuccessResponse(data);
            if (span && response.hasOwnProperty('message')) {
                span.html(response['message']);
            }
            if (response.hasOwnProperty('error')) {
                console.log(response['error'], data);
            }
            return response;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            const error = 'Error: ' + textStatus + '\n' + errorThrown;
            console.log(error);
            return error;
        }
    });
    return false;
}

function setPageViews(span, pageUrl, increment) {
    var url = getPageViewUrl(pageUrl);
    return getAndUpdatePageViews(span, url, pageUrl, increment);
}

function setLanguagePageViews(span, pageUrl, increment) {
    var url = getLanguagePageViewUrl(pageUrl);
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
