/**
 * An array of book data from the Bible pasages
 *
 * @type {Array}
 */
var bookData = [];
/**
 * An array of chapter data from the Bible pasages
 *
 * @type {Array}
 */
var chapterData = [];
jQuery(document).ready(function($) {
  /**
   * Handle the bible pieces
   */
  if ($('#sidebar-selector-content').length > 0) {
    $('#sidebar-selector-content').affix({
      offset: {
        top: 250
      }
    });
    /**
     * Setup the book selector
     */
    $('[data-sidebar-value]').each(function(index, el) {
      var data = {
        label: $(el).data('sidebar-label'),
        val: $(el).data('sidebar-value')
      };
      if (typeof $(el).data('sidebar-parent-value') !== 'undefined') {
        data.parent = $(el).data('sidebar-parent-value');
        chapterData.push(data);
      } else {
        bookData.push(data);
      }
    });
    var $bookSelector = $('select#bible-books');
    for (var i = 0; i < bookData.length; i++) {
      var book = bookData[i];
      var selected = '';
      if (i === 0) {
        selected = ' selected="selected"';
      }
      $bookSelector.append('<option value="' + book.val + '"' + selected + '>' + book.label + '</option>');
    }
    $bookSelector.on('change', function(event) {
      event.preventDefault();
      var selectedBook = $(this).find(":selected").val();
      scrollToPosition('#'+selectedBook);
      addChapters(selectedBook);
    });
    $('select#bible-chapters').on('change', function(event) {
      event.preventDefault();
      var selectedChapter = $(this).find(":selected").val();
      scrollToPosition('#'+selectedChapter);
    });
    addChapters(bookData[0].val);
  }
});
/**
 * Add the chapters to their selector based on the given book
 *
 * @param  {String} selectedBook The selected book
 * @access public
 */
function addChapters(selectedBook) {
  var $chapterSelector = $('select#bible-chapters');
  $chapterSelector.html('');
  var firstChapter = false;
  for (var i = 0; i < chapterData.length; i++) {
    var chapter = chapterData[i];
    var selected = '';
    if (chapter.parent === selectedBook) {
      if (firstChapter === false) {
        selected = ' selected="selected"';
        firstChapter = true;
      }
      $chapterSelector.append('<option value="' + chapter.val + '"' + selected + '>' + chapter.label + '</option>');
    }
  }
};
/**
 * Scroll to the given element
 *
 * @param  {String} hash The hash to scroll to
 * @return {Void}
 * @access public
 */
function scrollToPosition(hash) {
  $('html, body').animate({
    scrollTop: $(hash).offset().top - 60
  }, 300,
  function() {
    window.location.hash = hash;
  });
};
