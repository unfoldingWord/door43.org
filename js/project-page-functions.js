// console.log("project-page-functions.js version 10w"); // Helps identify if you have an older cached page or the latest
var projectPageLoaded = false;
var myRepoName, myRepoOwner, myResourceType;
var myCommitId, myCommitType, myCommitHash;
var nav_height, header_height;
var API_prefix = ['dev.door43.org', 'localhost', '127.0.0.1'].indexOf(windows.location.hostname) >= 0 ? "dev-" : "";

var _StatHat = _StatHat || [];
_StatHat.push(["_setUser", "NzMzIAPKpWipEWR8_hWIhqlgmew~"]);
(function () {
  var sh = document.createElement("script");
  sh.type = "text/javascript";
  sh.async = true;
  sh.src = "//www.stathat.com/javascripts/api.js";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(sh, s);
})();

$(document).ready(function () {
  onProjectPageLoaded();
});

/**
 * Called to initialize the project page
 */
function onProjectPageLoaded() {
  if (projectPageLoaded) return;
  projectPageLoaded = true;

  onProjectPageChange();

  $("#starred-icon").click(function () {
    if ($(this).hasClass("starred")) {
      $(this).removeClass("starred");
      $(this).find("i").removeClass("fa-star").addClass("fa-star-o");
    } else {
      $(this).addClass("starred");
      $(this).find("i").removeClass("fa-star-o").addClass("fa-star");
    }
  });

  var filename = window.location.href.split("?")[0].split("/").pop();
  // NOTE: left-sidebar doesn't exist for new template, RJH Sep2019
  $("#left-sidebar")
    .find('#page-nav option[value="' + filename + '"]')
    .attr("selected", "selected");

  $.getJSON("build_log.json", function (myLog) {
    // NOTE: Only the older template has Revisions in the left sidebar
    //       We use the length of this variable (zero/non-zero) to detect the template type
    //          i.e., Revision in left sidebar (old template) or in button (newer template)
    $revisions = $("#left-sidebar").find("#revisions");

    build_log = myLog;

    processBuildLogJson();
    addPDFDownload();
    checkPdfStatus();

    $.getJSON("../project.json", function (project) {
      processProjectJson(project); // Updates the revision list
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
    .always(function () {
      setDcsHref(window.location);
    }); // End getJSON

  $(document)
    .on("scroll", function () {
      onDocumentScroll(window);
    })
    .trigger("scroll");

  /* set up scrollspy */
  var $body = $("body");
  $body.scrollspy({ target: ".content-nav", offset: nav_height });
  // Offset in the above for some reason doesn't work, so we fix it this way with a little hack:
  var data = $body.data("bs.scrollspy");
  if (data) {
    data.options.offset = nav_height + 100;
    $body.data("bs.scrollspy", data);
    $body.scrollspy("refresh");
  }

  /* smooth scrolling to sections with room for navbar */
  $("#right-sidebar-nav").addClass("content-nav"); // ensure it has this class
  var $contentNav = $(".content-nav");
  $contentNav.find("li a[href^='#']").on("click", function (e) {
    // prevent default anchor click behavior
    e.preventDefault();
    // store hash
    var hash = this.hash;
    var hashLocation = $(hash).offset().top - nav_height - header_height - 5;
    // animate
    $("html, body").animate(
      {
        scrollTop: hashLocation,
      },
      300,
      function () {
        // when done, add hash to url
        // (default click behaviour)
        window.location.hash = hash;
      }
    );
  });

  /* Scroll to current section if URL has hash */
  if (window.location.hash) {
    var hash = window.location.hash;
    var $link = $contentNav.find("li a[href='" + hash + "']");
    $link.trigger("click");
  }

  $(window).on("scroll resize", function () {
    // RJH Aug2019 $('#left-sidebar-nav, #right-sidebar-nav').css('bottom', getVisibleHeight('footer'));
    $("#right-sidebar-nav").css("bottom", getVisibleHeight("footer"));
  });

  setPageViews($("#num-of-views"), window.location.href, 1);

  var $footer = $("[property='dct:title']");
  updateFooter($footer, $("title"));

  if (get_window_width() <= 990) {
    setupMobileContentNavigation();
  }
  $(window).resize(onWindowResize());
}

function processProjectJson(project) {
  // if ($revisions.length) { // old template with Revisions in left-sidebar
  //     console.log("processProjectJson() with revisions IN LEFT-SIDEBAR");
  // } else { // newer template with Versions in drop-down -- RJH Aug2019
  if (!$revisions.length) {
    // not old template with Revisions in left-sidebar
    // console.log("processProjectJson() with versions IN DROP-DOWN");
    // Disable the drop-down button if there's only one commit
    if (project.commits.length == 1) {
      $("#versions_menu_button").prop("disabled", true);
      // $('#versions_menu_button .glyphicon').hide();
      $("#versions_menu_button .caret").hide();
    } // Assuming no need to ever unhide these, i.e., project file can't change dynamically
    $versionsMenuList = $("#versions_menu ul");
    if (!$versionsMenuList.length)
      console.log("Unable to find versions menu list!");
  }

  // For both the old-style revisions list on the left, and the new-style drop-down button:
  // Assemble a list of up to 10 commits with intelligent dates or times
  //  and makes into live links except for the current one.
  var todaysDate = new Date();
  todaysDate.setHours(0, 0, 0, 0);
  var thisYear = todaysDate.getFullYear();
  var counter = 1;
  $.each(project.commits.reverse(), function (index, commit) {
    var commitDateTime = new Date(commit.created_at);
    var commitDate = new Date(commit.created_at);
    commitDate.setHours(0, 0, 0, 0);
    try {
      // moment library was not included in older templates
      cdtMoment = moment(commitDateTime);
      // Use time for today's commits, else date (trying to keep the string reasonably short)
      var dateTimeStr =
        commitDate.getTime() == todaysDate.getTime()
          ? // undefined below should mean use browser's locale (but it seems only to detect user language, not locate)
            // Only display the time if it's today
            cdtMoment.format("LT")
          : commitDate.getFullYear() == thisYear
          ? // Only display the date & month if it's this same year
            cdtMoment.format("ll").replace(", 2019", "") // TODO: Find a better way to do this
          : // Display the date & month & year for previous years
            cdtMoment.format("ll");
    } catch (err) {
      // Gives a ReferenceError if moment library is not available
      console.log("Falling back to JS Dates -- limited local time display!");
      var dateTimeStr =
        commitDate.getTime() == todaysDate.getTime()
          ? // undefined below should mean use browser's locale (but it seems only to detect user language, not locate)
            // Only display the time if it's today
            commitDateTime.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "numeric",
              timeZone: "UTC",
            })
          : commitDate.getFullYear() == thisYear
          ? // Only display the date & month if it's this same year
            commitDateTime.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })
          : // Display the date & month & year for previous years
            commitDateTime.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            });
    }
    var displayStr = commit.id + " (" + dateTimeStr + ")";
    var iconHtml = getCommitConversionStatusIcon(commit.status);

    // We still have to handle both the old and new template styles
    if ($revisions.length) {
      // old template with Revisions in left-sidebar
      if (commit.id !== myCommitId)
        // liven revision links other than the current one
        displayStr =
          '<a href="../' +
          commit.id +
          '/index.html" onclick="_StatHat.push(["_trackCount", "pQvhLnxZPaYA0slgLsCR7CBPM2NB", 1.0]);">' +
          displayStr +
          "</a>";
      var display = counter > 10 ? 'style="display: none"' : "";
      $revisions.append(
        "<tr " +
          display +
          "><td>" +
          displayStr +
          "</td><td>" +
          iconHtml +
          "</td></tr>"
      );
    } else {
      // newer template with Versions in left-sidebar
      if (commit.id == myCommitId) {
        if ("commit_hash" in commit && commit.commit_hash)
          displayStr =
            '<div><span title="' +
            commit.commit_hash +
            '">' +
            displayStr +
            "</span>" +
            iconHtml +
            "</div>";
        else displayStr = "<div>" + displayStr + iconHtml + "</div>";
      } else {
        // liven revision links other than the current one
        if ("commit_hash" in commit && commit.commit_hash)
          displayStr =
            '<a title="' +
            commit.commit_hash +
            '" href="../' +
            commit.id +
            '/index.html" onclick="_StatHat.push(["_trackCount", "pQvhLnxZPaYA0slgLsCR7CBPM2NB", 1.0]);">' +
            displayStr +
            iconHtml +
            "</a>";
        else
          displayStr =
            '<a href="../' +
            commit.id +
            '/index.html" onclick="_StatHat.push(["_trackCount", "pQvhLnxZPaYA0slgLsCR7CBPM2NB", 1.0]);">' +
            displayStr +
            iconHtml +
            "</a>";
      }
      $versionsMenuList.append("<li>" + displayStr + "</li>");
    }

    if (counter++ > 10) return false; // i.e., break -- only display first 10 entries in the dropdown
  }); // end each

  // if ($revisions.length && counter > 10)
  // $revisions.append('<tr id="view_more_tr"><td colspan="2" class="borderless"><a href="javascript:showTenMore();">View More...</a></tr>');
}

function processBuildLogJson() {
  // Save some useful variables globally
  myRepoOwner = build_log.repo_owner_username;
  if (myRepoOwner == null)
    // couldn't find it -- try something different
    myRepoOwner = build_log.repo_owner; // deprecated name still on older builds
  myRepoName = build_log.repo_name;
  myResourceType = build_log.resource_type;

  myCommitId = build_log.commit_id; // tag name or branch name
  myCommitType = build_log.commit_type; // 'defaultBranch', 'branch', 'tag', or 'unknown'
  try {
    myCommitHash = build_log.commit_hash; // 10-hex-digit hash
  } catch (e) {
    console.log("No commit hash: " + e);
    myCommitHash = null;
  }

  var $lastUpdated = $('#last-updated');
  $lastUpdated.html(
    "Updated " + timeSince(new Date(build_log.created_at)) + " ago"
  );

  saveDownloadFilesLink();
  setDownloadButtonState();
  updateDownloadItems();
  updateConversionStatusOnPage();

  if ($revisions.length) {
    // old template with Revisions in left-sidebar
    $revisions.empty();
  } else {
    // newer template with Versions in drop-down -- RJH Aug2019
    $("#versions_menu ul").empty();
    // Set the text of our new button to show the current version name, i.e., branch/tag name
    // $('#versions_menu_button .hide-on-pinned').text(myCommitId);
  }
}

function updateConversionStatusOnPage() {
  var $buildStatusIcon = $("#build-status-icon");
  $buildStatusIcon.find("i").attr("class", "fa " + faSpinnerClass); // default to spinner
  setOverallConversionStatus(build_log.status);

  if (build_log.warnings.length) {
    var modal_html =
      "<ul><li>" + build_log.warnings.join("</li><li>") + "</li></ul>";
    $buildStatusIcon
      .on("click", function () {
        _StatHat.push(["_trackCount", "PgNkqAnDE37z2tStLTSmTyBLb2Zo", 1.0]);
        showWarningModal(modal_html);
      })
      .attr("title", "Click to see warnings");
    $buildStatusIcon.addClass("warning-button");
  }
}

function showWarningModal(modal_body) {
  var html =
    '<div id="warning-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">' +
    '  <div class="modal-dialog">' +
    '    <div class="modal-content">' +
    '      <div class="modal-header">' +
    '        <a class="close" data-dismiss="modal">×</a>' +
    '        <div class="warning-circle"><i class="fa fa-exclamation"></i></div>' +
    '        <h3 class="warning-header">Warning!</h3>' +
    "      </div>" +
    '      <div id="warnings-list" class="modal-body">' +
    modal_body +
    "      </div>" +
    '      <div class="modal-footer">' +
    '        <a href="mailto:help@door43.org' +
    "?subject=" +
    encodeURIComponent("Build Warning: " + myRepoOwner + "/" + myRepoName) +
    "&body=" +
    encodeURIComponent(
      "Type your question here\n\nSee the failure at " +
        window.location.href +
        "\n\n"
    ) +
    '" class="btn btn-secondary raised">Ask the Help Desk</a>' +
    '        <span class="btn btn-primary raised" data-dismiss="modal">Ok, Got it!</span>' +
    '        <span id="warning-print" class="btn btn-secondary raised right" onclick="printWarnings()">Print</a>' +
    "      </div>" +
    "    </div>" +
    "  </div>" +
    "</div>";

  $("body").append(html);
  $("#warning-modal")
    .modal()
    .modal("show")
    .on("hidden.bs.modal", function () {
      $(this).remove();
    });
}

var printLoaded = false;

function printWarnings() {
  const $warnings = $("#warnings-list");
  const title = "Conversion Warnings";
  if (printLoaded) {
    printWarningsSub($warnings, title);
  } else {
    $.getScript("/js/jQuery.print.js", function () {
      printLoaded = true;
      printWarningsSub($warnings, title);
    });
  }
  _StatHat.push(["_trackCount", "JgojEAJCMPqTlYGKK-PgPSBJOTFi", 1.0]);
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
      console.log("Printing done", arguments);
    }),
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
  var $pinned = $document.find("#pinned-header");

  if (get_window_width() > 990) {
    if (scroll_top > 1) {
      if (!$pinned.hasClass("pin-to-top")) {
        $pinned.addClass("pin-to-top").css("top", nav_height + "px");
        $(".page-content").css("margin-top", nav_height + header_height + "px");
        onProjectPageChange();
      }
    } else {
      if ($pinned.hasClass("pin-to-top")) {
        $pinned.removeClass("pin-to-top").css("top", "");
        $(".page-content").css("margin-top", 0);
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
  if (visibleBottom - visibleTop > 0) return visibleBottom - visibleTop;
  else return 0;
}

/* RJH removed Aug2019
noinspection JSUnusedGlobalSymbols
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
*/

function printAll() {
  // Called when the "Print" button is clicked on
  _StatHat.push(["_trackCount", "5o8ZBSJ6yPfmZ28HhXZPaSBNYzRU", 1.0]);
  var id = myRepoOwner + "/" + myRepoName + "/" + myCommitId;
  var api_domain = "api.door43.org";
  $.ajax({
    url: "https://" + API_prefix + api_domain + "/tx/print?id=" + id,
    success: function (data) {
      // response body is url to printed HTML
      if (!data.startsWith("http")) {
        // TODO(ethantkoenig): this is an ugly hack
        data = "https://" + data;
      }
      console.log("URL for printed HTML: " + data);
      window.open(data, "_blank");
    },
    crossDomain: true,
  });
}

/**
 * Gets the link back to DCS for the current page
 * @param pathname The value from window.location.pathname
 */
function getDcsLink(pathname) {
  // split the URL into its parts
  var path_parts = pathname.split("/");
  path_parts = path_parts.filter(function (s) {
    return s !== "";
  });

  // length must be at least 3
  if (path_parts.length < 3) return "";

  // the first part should be 'u'
  if (path_parts[0] !== "u") return "";

  // the second and third parts are what we need
  return "https://git.door43.org/" + path_parts[1] + "/" + path_parts[2];
}

/**
 * Sets the href of the link to DCS
 * @param location Should pass window.location to this function
 */
function setDcsHref(location) {
  var href;

  if (myRepoName && myRepoOwner)
    href = "https://git.door43.org/" + myRepoOwner + "/" + myRepoName;
  else href = getDcsLink(location.pathname);

  $("#see-on-dcs").attr("href", href);
}

/**
 * get commitID for download
 * @param [commitID] if not set will try to use myCommitId and then try to extract from pageUrl
 * @param [pageUrl] if not set will use page href
 * @returns commitID
 */
function getCommid(pageUrl) {
  if (myCommitId) {
    // if found in build_log.json
    commitID = myCommitId;
  } else {
    commitID = extractCommitFromUrl(pageUrl);
  }

  return commitID;
}

function updateDownloadItems() {
  // Update the download menu
  // Set the download (compressed) files option to show USFM or MARKDOWN
  setDownloadFilesMenuItem();
}

function addPDFDownload() {
  var $downloadMenu = $("#download_menu ul");
  if ($downloadMenu) {
    $downloadMenu.append(
      '<li><a type="submit" onclick="userWantsPDF()" id="pdf-link"><span id="menu_source_item" class="glyphicon glyphicon-file"></span>PDF (ZIP)</a></li>'
    );
  } else {
    console.log("addOptionalPDFDownload ERROR: Unable to find download menu");
  }
}

function setDownloadFilesMenuItem() {
  // Set the download (compressed) files option to show USFM or MARKDOWN
  var $downloadMenuItem = $("#download_menu_source_item"); // quickest way
  if (!$downloadMenuItem.length) {
    // if not found on older pages, try to drill down in menu
    //$downloadMenuItem = $("#download_menu ul li span");
    // The above puts the text inside the glyphicon span !!!
    $downloadMenuItem = $("#download_menu ul li a");
    if (!$downloadMenuItem.length) {
      // if still not found, return null
      console.log("Unable to find download menu item");
      // return null;
    }
  }
  if ($downloadMenuItem.length) {
    var downloadItemText = getTextForSourceDownloadItem();
    $downloadMenuItem.append(" " + downloadItemText);
  }
  // return $downloadMenuItem;
}

/**
 * get text to show based on input_format - markdown for md, and USFM otherwise
 * @return {string}
 */
function getTextForSourceDownloadItem() {
  var downloadItemText = build_log.input_format === "md" ? "Markdown" : "USFM";
  return downloadItemText;
}

function getCheckDownloadsUrl(commitID, pageUrl) {
  // var prefix = getSiteFromPage(pageUrl);
  return (
    "https://" +
    API_prefix +
    "api.door43.org/check_download?commit_id=" +
    commitID
  );
}

function setDownloadButtonState() {
  pageUrl = window.location.href;
  var commitID_ = getCommid(pageUrl);
  var url = getCheckDownloadsUrl(commitID_, pageUrl);

  var $button = $("#download_menu_button");

  if ($button) {
    $button.prop("disabled", true);
  }
  $.ajax({
    url: url,
    type: "GET",
    cache: "false",
    dataType: "jsonp",
    success: function (data, status) {
      if (data.download_exists) {
        if ($button) {
          $button.prop("disabled", false);
        }
      }
      return data;
    },
    error: function (jqXHR, textStatus, errorThrown) {
      const error = "Error: " + textStatus + "\n" + errorThrown;
      console.log(error);
      return error;
    },
  });
}

const DEFAULT_DOWNLOAD_FILES_LOCATION =
  "https://s3-us-west-2.amazonaws.com/tx-webhook-client/preconvert/";
var source_download_url = null;

/**
 * parse page url to get commit key
 * @param pageUrl
 * @return {{pageUrl: *, commit: *}}
 */
function extractCommitFromUrl(pageUrl) {
  if (pageUrl === undefined) {
    pageUrl = window.location.href;
  }

  var parts = pageUrl.split("/");
  var commitID = parts[6];
  return commitID;
}

/**
 * get URL for (compressed) files download
 * @param [pageUrl] if not set will use page href
 * @returns {*}
 */
function getDownloadUrl(pageUrl) {
  // This is the function responding to a user click on download USFM/Markdown
  //  and it must return a URL to go in window.open(getDownloadUrl())
  _StatHat.push(["_trackCount", "eBQk6-wY9ziv3D77-qhJuiBYM3Z2", 1.0]);
  if (source_download_url) {
    // if found earlier in build_log.json
    return source_download_url;
  }
  var commitID = extractCommitFromUrl(pageUrl);
  var downloadURL = DEFAULT_DOWNLOAD_FILES_LOCATION + commitID + ".zip";
  return downloadURL;
}

function getS3Url(url) {
  // Looks for PDF at the given url -- doesn't work well coz of CloudFront caching
  //  so look at S3 URL instead
  // console.log("doesPDFexist()");
  if (! url) {
      return null;
  }
  if (url.startsWith('https://dev.door43.org') || url.indexOf('localhost') > 0) {
    return url;
  }
  url = url.replace(
    "https://",
    "https://s3-us-west-2.amazonaws.com/"
  );
  try {
    var req = new XMLHttpRequest();
    req.open("HEAD", url, false); // Gets headers only
    // Synchronous request coz it should be quick
    req.send(); // Hopefully it's fast
    if (req.status == 200) {
      // seems that the PDF is already there
      // console.log("  Yes, a correctly named PDF already exists -- returning true");
      return url;
    } else {
      // console.log("  Seems that the PDF doesn't exist: status = " + req.status);
      return null;
    }
  } catch (err) {
    console.log("  In getS3Url() catch block with: " + err);
  }
  // console.log("  Returning empty url at end!")
  return null;
}

/**
 * set download files link from build log
 */
function saveDownloadFilesLink() {
  try {
    source_download_url = build_log.source;
    if (source_download_url) {
      return;
    }
  } catch (e) {}
  source_download_url = null;
}

function getPageViewUrl(pageUrl) {
  var prefix = getSiteFromPage(pageUrl);
  return "https://" + prefix + "api.door43.org/page_view_count";
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

function onProjectPageChange() {
  nav_height = $(".navbar").outerHeight(true);
  header_height = $("#pinned-header").outerHeight(true);
  /* Set/update the affix offset for left, right and content (if mobile) */
  // RJH Aug2019 $('#left-sidebar-nav, #right-sidebar-nav').affix({
  $("#right-sidebar-nav")
    .affix({
      offset: {
        top: nav_height + header_height - 100,
      },
    })
    .css("top", nav_height + header_height + "px");
  $("#content-header")
    .affix({
      offset: {
        top: nav_height,
      },
    })
    .css("top", nav_height + "px");
}

function setupMobileContentNavigation() {
  var content_header = $('<div id="content-header"></div>')
    .affix({
      offset: {
        top: nav_height,
      },
    })
    .css("top", nav_height + "px");

  var header = $("#content > h1:first");
  header.appendTo(content_header);

  var toggle_button = $('<a id="mobile-content-nav-toggle" href="#"></a>');
  toggle_button.appendTo(header);

  var content_nav = $("#right-sidebar-nav");
  content_nav
    .removeClass("hidden-sm hidden-xs")
    .attr("id", "mobile-content-nav");
  content_nav.hide();
  content_nav.appendTo(content_header);

  var content = $("#content");
  content.wrapInner('<div id="content-body"></div>');

  content_header.prependTo(content);

  toggle_button.click(function () {
    toggleMobileContentNav();
  });
  $("#mobile-content-nav a").click(function () {
    if (!$(this).hasClass("accordion-toggle")) closeMobileContentNav();
  });

  onProjectPageChange();
}

function teardownMobileContentNavigation() {
  var content = $("#content");
  var content_header = $("#content-header");

  $("#mobile-content-nav-toggle").remove();
  var header = content_header.find("h1:first");
  header.appendTo(content);

  var content_nav = $("#mobile-content-nav");
  content_nav.addClass("hidden-sm hidden-xs").attr("id", "right-sidebar-nav");
  content_nav.show();
  content_nav.prependTo($("#right-sidebar"));
  content_header.remove();

  var content_body = $("#content-body");
  content_body.children().appendTo(content);
  content_body.remove();
}

function toggleMobileContentNav() {
  if ($("#mobile-content-nav").is(":visible")) {
    closeMobileContentNav();
  } else {
    openMobileContentNav();
  }
}

function openMobileContentNav() {
  $("#mobile-content-nav").slideDown();
  $("#content-header").css("bottom", 0);
  $("#mobile-content-nav-toggle").addClass("expanded");
}

function closeMobileContentNav() {
  $("#mobile-content-nav").slideUp();
  $("#content-header").css("bottom", "");
  $("#mobile-content-nav-toggle").removeClass("expanded");
}

function get_window_width() {
  return $(window).width();
}

function onWindowResize() {
  onProjectPageChange();

  if (get_window_width() <= 990) {
    if (!$("#mobile-content-nav").length) setupMobileContentNavigation();
  } else {
    if ($("#mobile-content-nav").length) teardownMobileContentNavigation();
  }
}

var conversion_start_time = new Date(); // default to current time
var pdf_conversion_start_time = new Date(); // default to current time
var build_log = null;
var pdf_build_log = null;

/*** PDF CONVERSION WATCH FUNCTIONS ***/

var pdfURL = null;
var pdfResults = '';
var pdfRequested = false;
const MAX_PDF_BUILD_SECONDS = 600; // 1 hour

function userWantsPDF() {
  // This is the function responding to a user click on download PDF button
  //  and it must handle everything including the window.open() when conversion is done and/or displaying a status alert.

  console.log("userWantsPDF()")
  // _StatHat.push(["_trackCount", "eBQk6-wY9ziv3D77-qhJuiBYM3Z2", 1.0]);
  if ($('#pdf-link').hasClass('no-pdf')) {
    // The PDF button has a "n/a" class meaning the current build doesn't havea  PDF associated with it and will need to be
    // triggered with another commit or a test build
    alert("Sorry, seems we don't know about any PDF to download! Please make another commit to the repo or a trigger a test webhook event to trigger a build.");
  } else {
    // if expected URL formed earlier
    if (pdfURL) {
      console.log("Seems a PDF url exists");
      window.open(pdfURL);
      if (pdfResults) {
          alert(pdfResults)
      } else if (pdfRequested) {
        window.focus();
        alert("The PDF is now ready for download.");
        pdfRequested = false;
      }
      return;
    } else if (pdfResults) {
        alert(pdfResults);
    } else {
        if (! pdfRequested) {
          alert("PDF conversion in progress. Stay on this page and you will be alerted when the process is finished.")
          pdfRequested = true;
        }
        setTimeout(userWantsPDF, 10000)
    }
  }
}

function checkPdfStatus() {
  console.log('checkPdfStatus()');

  $.getJSON("pdf_build_log.json", function (pdfLog) {
    pdf_build_log = pdfLog;
    var iconType = getDisplayIconType(pdfLog.status);
    if (pdf_build_log['commit_hash'] != build_log['commit_hash']) {
      console.log("build_log.json and pdf_build_log.json commit_hash's don't match!");
      pdfResults = "Please reload this page as the version of PDF on file does not match this revision."
    } else if (iconType === eConvStatus.ERROR) {
      console.log("pdf conversion error");
      pdfResults = "The PDF build failed: " + pdf_build_log.message
    } else if (iconType !== eConvStatus.IN_PROGRESS) {
      console.log("pdf conversion completed");
      $('#pdf-link').removeClass('disabled');
      pdfURL = getS3Url(pdfLog.pdf_url);
      if (iconType === eConvStatus.WARNING) {
        pdfResults = "PDF generated: " + pdf_build_log.message
      }
    }
  }).fail(function () {
    console.log("error reading pdf_build_log.json, not there yet");
  }).always(function () {
    // Now handle if we should call this function again in 10 seconds or not
    if (! pdfURL) {
      // console.log("Check if waiting time is up yet?");
      var pdfBuildStart;
      if (pdf_build_log) {
          pdfBuildStart = new Date(pdf_build_log.created_at);
      } else {
          pdfBuildStart = new Date(build_log.created_at);
      }
      currentTime = new Date();
      var elapsedSeconds = Math.round((currentTime - pdfBuildStart) / 1000);
      console.log("elapsedSeconds: " + elapsedSeconds)
      if (elapsedSeconds > MAX_PDF_BUILD_SECONDS) {
          console.log("Seems we timed out after " + elapsedSeconds + " seconds!");
          pdfResults = "The PDF creation process never comleted after an hour and didn't report an error. Please have the repo's owner trigger another build.";
      } else {
          console.log("error reading pdf_build_log.json, retry in 10 seconds");
          setTimeout(checkPdfStatus, 10000); // wait 10 second before checking
      }
    }
  });
}

/*** END PDF CONVERSION WATCH FUNCTIONS ***/
