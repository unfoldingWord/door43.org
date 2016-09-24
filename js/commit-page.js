/**
 * Javascript for project commit pages to update the status and build the left sidebar
 */

$(document).ready(function(){
  var url_parts = window.location.href.split('?')[0].split('/');
  var parent_url = url_parts.slice(0,-2).join('/');
  var myCommitId = url_parts.slice(-1);

  var request;
  if(window.XMLHttpRequest)
    request = new XMLHttpRequest();
  else
    request = new ActiveXObject("Microsoft.XMLHTTP");

  $.getJSON( "build_log.json", function(myLog) {
    console.log("Building sidebar for "+myCommitId);

    $('#left-sidebar').html('<div><h1>Revisions</h1><table width="100%" id="revisions"></table></div>');

    $.getJSON("../project.json", function (project) {
      $.each(project.commits.reverse(), function (index, commit) {
        request.open('GET', parent_url+"/"+commit.id+"/01.html", false);
        request.send();
        if (request.status === 404) {
           return true;
        }

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

        if(commit.id == myCommitId){
          $('#last-updated').html("Update "+timeSince(date)+" ago");
          $('#build-status-icon i').attr("class", "fa "+statusIcon);
        }

        var html = '<tr><td>';
        if(commit.id == myCommitId){
          html += '<b>'+dateStr+'</b>';
        }
        else
          html += '<a href="../' + commit.id + '/index.html">' + dateStr + '</a>';
        html += '</td><td><i class="fa '+statusIcon+'"></i></td></tr>';
        $('#revisions').append(html);
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

