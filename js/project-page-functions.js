var myCommitId, myRepoName, myOwner, margin_top;
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
    myCommitId = myLog.commit_id.substring(0, 10);
    myOwner = myLog.repo_owner;
    myRepoName = myLog.repo_name;
    $('#last-updated').html("Updated " + timeSince(new Date(myLog.created_at)) + " ago");

    saveDownloadLink(myLog);

    var $buildStatusIcon = $('#build-status-icon');
    $buildStatusIcon.find('i').attr("class", "fa " + faSpinnerClass); // default to spinner
    setOverallConversionStatus(myLog.status);
    if (myLog.errors.length > 0)
      $buildStatusIcon.attr("title", myLog.errors.join("\n"));
    else if (myLog.warnings.length > 0)
      $buildStatusIcon.attr("title", myLog.warnings.join("\n"));
    else if (myLog.message)
      $buildStatusIcon.attr("title", myLog.message);

    console.log("Building sidebar for " + myCommitId);

    var $revisions = $('#left-sidebar').find('#revisions');

    $revisions.empty();

    $.getJSON("../project.json", function (project) {
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

const DEFAULT_DOWNLOAD_LOCATION = "https://s3-us-west-2.amazonaws.com/tx-webhook-client/preconvert/";
var source_download = null;

/**
 * get URL for download
 * @param [pageUrl] if not set will use page href
 * @returns {*}
 */
function getDownloadUrl(pageUrl) {
    if(pageUrl == undefined) {
        pageUrl=window.location.href
    }

    if(source_download) { // if found in build_log.json
        return source_download;
    }

    var parts = pageUrl.split("/");
    var commit = parts[6];
    var download = DEFAULT_DOWNLOAD_LOCATION + commit + ".zip";
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
