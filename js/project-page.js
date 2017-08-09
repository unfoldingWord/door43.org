/**
 * Javascript for project commit pages to update the status and build the left sidebar
 */

$(document).ready(function () {
  // doing it this way so the code is testable and also is backward compatible
  $.getScript('/js/project-page-functions.js', function() {
    onProjectPageLoaded();
  })
});
