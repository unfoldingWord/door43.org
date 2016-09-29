/**
 * Javascript for project commit pages to update the status and build the left sidebar
 */

$(document).ready(function(){
  $.getJSON( "build_log.json", function(myLog) {
    var myCommitId = myLog.commit_id.substring(0, 10);
    $('#last-updated').html("Updated "+timeSince(new Date(myLog.created_at))+" ago");
    $('#build-status-icon i').attr("class", "fa "+getStatusIcon(myLog.status));

    console.log("Building sidebar for "+myCommitId);

    $('#left-sidebar #revisions').empty()

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

        statusIcon = getStatusIcon(commit.status)

        var html = '<tr><td>';
        if(commit.id == myCommitId){
          html += '<b>'+dateStr+'</b>';
        }
        else
          html += '<a href="../' + commit.id + '/index.html">' + dateStr + '</a>';
        html += '</td><td><i class="fa '+statusIcon+'"></i></td></tr>';
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

