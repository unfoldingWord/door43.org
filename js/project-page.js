/**
 * Javascript for project commit pages to update the status and build the left sidebar
 */

$().ready(function () {
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
    var myCommitId = myLog.commit_id.substring(0, 10);
    $('#last-updated').html("Updated " + timeSince(new Date(myLog.created_at)) + " ago");

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
    }); // End getJSON

  // pin the header below the menu rather than scroll out of view
  var $pinned = $('#pinned-header');
  // var $menu = $($('nav.navbar-fixed-top')[0]);
  var margin_top = parseInt($pinned.css('margin-top'));

  $(document).on('scroll', function () {
    var scroll_top = $(window).scrollTop();

    if (scroll_top > margin_top - 10) {
      $pinned.addClass('pin-to-top');
      $('#sidebar-nav, #revisions-div').addClass('pin-to-top');
    }
    else {
      $pinned.removeClass('pin-to-top');
      $('#sidebar-nav, #revisions-div').removeClass('pin-to-top');
    }
  });

  /* set up scrollspy */
  var navHeight = 122;
  $('#sidebar-nav, #revisions-div').affix({
    offset: {
      top: navHeight
    }
  });
  $('body').scrollspy({target: '#right-sidebar-nav', offset: navHeight});
  $('body').scrollspy({target: '#left-sidebar-nav', offset: navHeight});
  /* smooth scrolling to sections with room for navbar */
  var $rightSidebarNav = $("#right-sidebar-nav");
  $rightSidebarNav.find("li a[href^='#']").on('click', function (e) {
    // prevent default anchor click behavior
    e.preventDefault();
    // store hash
    var hash = this.hash;
    // animate
    $('html, body').animate({
      scrollTop: $(hash).offset().top - navHeight
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
});

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
