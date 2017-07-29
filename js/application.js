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
function changeMissingTextForLanguageCode(lang_code, subPath) {
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
            appendLineItem($ul, "Try searching for " + search_link + ".");
            appendLineItem($ul, "<a href=\"javascript: history.go(-1)\">Go Back</a> to previous page.");
            var old_link = buildAnchor("http://dw.door43.org/" + subPath, "old door43.org site");
            appendLineItem($ul, "View this page on the " + old_link + ".");
            appendLineItem($ul, "<a href=\"/en/contact\">Contact Us</a> to let us know");
        }
    }
}

function getSubPath(href) {
    return href.split('/').splice(3).join('/');
}

/**
 * parse href for language code and validate it.  If valid return it otherwise return null
 * @param href
 * @return {string}
 */
function getValidLanguageCode(href) {
    const parts = href.split('/');
    var lang_code = decodeURI(parts[3]).toLowerCase();
    const langCodeRegEx = /^[a-z]{2,3}(-[a-z0-9]{2,4})?$/; // e.g. ab, abc, pt-br, es-419, sr-latn
    var matched = langCodeRegEx.test(lang_code); // validate lang_code
    if (!matched) {
        const extendedlangCodeRegEx = /^[a-z]{2,3}(-x-[a-z0-9]+)?$/; // e.g. abc-x-abcdefg
        matched = extendedlangCodeRegEx.test(lang_code); // validate extended lang_code
        if (!matched) {
            const extendedlangCodeRegEx2 = /^(-x-[a-z0-9\p{Ll}]+){1}$/; // e.g. -x-abcdefg
            matched = extendedlangCodeRegEx2.test(lang_code); // validate extended lang_code
            if (!matched) {
                const specialCase = "kmv-x-patuá"; // since javascript regex may not support unicode extension, we will support this specially
                if (lang_code !== specialCase) {
                    lang_code = null; // Validation failed
                }
            }
        }
    }
    return lang_code;
}

/**
 * if href is 404 page and a language page, return language code else return null
 * @param href
 * @param $links - links in header
 * @return {string}
 */
function checkForUndefinedLanguagePage(href, $links) {
    var found404 = false;
    $.each($links, function (index, $link) {
        var pos = $link.href.indexOf('/404.html');
        if (pos >= 0) {
            found404 = true;
        }
    });
    if (found404) { // further check for valid language code
        return getValidLanguageCode(href);
    }
    return null;
}

/**
 * if href if 404 page and a language page, update displayed text with more options
 * @param href
 * @param $links - links in header
 */
function updateTextOnUndefinedLanguagePage(href, $links) {
    var lang_code = checkForUndefinedLanguagePage(href, $links);
    if (lang_code) {
        var subPath = getSubPath(href);
        changeMissingTextForLanguageCode(lang_code, subPath);
        $.getScript('/js/project-page-functions.js', function() {
            setLanguagePageViews(null,href,1);
        })
    }
}

