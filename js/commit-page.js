/**
 * Javascript for project commit pages to update the status and build the left sidebar
 */

$(document).ready(function(){
  $('#starred-icon').click(function(){
    if($(this).hasClass('starred')){
        $(this).removeClass('starred');
        $(this).find('i').removeClass('fa-star').addClass('fa-star-o');
    }
    else {
        $(this).addClass('starred');
        $(this).find('i').removeClass('fa-star-o').addClass('fa-star');
    }
  });

  var filename = window.location.href.split('?')[0].split('/').pop();
  $('#left-sidebar #page-nav option[value="'+filename+'"]').attr('selected','selected');

  $.getJSON( "build_log.json", function(myLog) {
    var myCommitId = myLog.commit_id.substring(0, 10);
    $('#last-updated').html("Updated "+timeSince(new Date(myLog.created_at))+" ago");
    $('#build-status-icon i').attr("class", "fa "+ faSpinnerClass); // default to spinner
    setOverallConversionStatus(myLog.status);
    if(myLog.errors.length > 0)
        $('#build-status-icon').attr("title", myLog.errors.join("\n"));
    else if(myLog.warnings.length > 0)
        $('#build-status-icon').attr("title", myLog.warnings.join("\n"));
    else if(myLog.message)
        $('#build-status-icon').attr("title", myLog.message);

    console.log("Building sidebar for "+myCommitId);

    $('#left-sidebar #revisions').empty();

    $.getJSON("../project.json", function (project) {
      $.each(project.commits.reverse(), function (index, commit) {
        date = new Date(commit.created_at);
        var options = {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZone: "UTC"
        };
        dateStr = date.toLocaleString("en-US", options);

        var html = '<tr><td>';
        if(commit.id == myCommitId){
          html += '<b>'+dateStr+'</b>';
        }
        else {
          html += '<a href="../' + commit.id + '/index.html">' + dateStr + '</a>';
        }

        var iconHtml = getCommitConversionStatusIcon(commit.status);
        html += '</td><td>' + iconHtml + '</td></tr>';
        $('#left-sidebar #revisions').append(html);
      }); // End each
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
});

