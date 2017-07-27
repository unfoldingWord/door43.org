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
  updateTextOnUndefinedLanguagePage(window.location.href, $('head link'));

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

function appendLineItem($ul, text) {
    $ul.append("<li>" + text + "</li>");
}

function buildAnchor(href, text) {
    return "<a href=\"" + href + "\">" + text + "</a>";
}

/**
 * for missing language page update options on page
 * @param lang_code
 * @param subPath
 */
function changeMissingtextForLanguageCode(lang_code, subPath) {
    var $div = $('.content-container .page-content div');
    if ($div.length) {
        var script_text = "";
        var $original_script = $div.find('script');
        $.each($original_script, function (index, $script) {
            if (!script_text && $script.textContent) { // get first non-empty script
                script_text = $script.outerHTML;
            }
        });

        $div.empty();
        if (script_text) {
            $div.html(script_text);
        }
        $div.append("<ul>");
        var $ul = $div.find('ul');
        if ($ul.length) {
            var search_link = buildAnchor("/en?lc=" + lang_code, "'" + lang_code + "' content");
            appendLineItem($ul, "Try searching for <a href=\"/en/contact\">" + search_link + "</a>.");
            appendLineItem($ul, "<a href=\"javascript: history.go(-1)\">Go Back</a> to previous page.");
            var old_link = buildAnchor("http://dw.door43.org/" + subPath, "old door43.org site");
            appendLineItem($ul, "View this page on the " + old_link + ".");
            appendLineItem($ul, "<a href=\"/en/contact\">Contact Us</a> to let us know");
        }
    }
}

/**
 * if href is 404 page and a language page, return language code and path part of href
 * @param href
 * @return {{lang_code: *, subPath: *}}
 */
function checkForUndefinedLanguagePage(href, $links) {
    var lang_code = null;
    var subPath = null;
    var foundlanguage404 = false;
    $.each($links, function (index, $link) {
        var pos = $link.href.indexOf('/404.html');
        if (pos >= 0) {
            foundlanguage404 = true;
        }
    });
    if (foundlanguage404) { // further check for valid language code
        var parts = href.split('/');
        lang_code = parts[3];
        var lang_code_parts = lang_code.split('-');
        var lang_code_prefix = lang_code_parts[0];
        if ((lang_code_prefix.length < 2) || (lang_code_prefix.length > 3)) {
            lang_code = null;
        } else {
            subPath = parts.splice(3).join('/');

            if (lang_code_parts.length >= 2) { // if there is an extension, check that
                var lang_code_extension = lang_code_parts.slice(1).join('-');
                if (lang_code_extension.length < 1) {
                    lang_code = null;
                }
            }
        }
    }
    return {lang_code: lang_code, subPath: subPath};
}

/**
 * if href if 404 page and a language page, update displayed text with more options
 * @param href
 */
function updateTextOnUndefinedLanguagePage(href, $links) {
    var __ret = checkForUndefinedLanguagePage(href, $links);
    var lang_code = __ret.lang_code;
    var subPath = __ret.subPath;
    if (lang_code) {
        changeMissingtextForLanguageCode(lang_code, subPath);
    }
}

