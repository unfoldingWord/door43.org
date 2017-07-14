const SECTION_TYPE_POPULAR = 1;
const SECTION_TYPE_RECENT = 2;

const DEFAULT_PAGE_MINIMUM_VIEWS = 10; // For default page, needs to have this many views
const DEFAULT_PAGE_NUMBER_DAYS_FOR_RECENT = 30; // For default page, needs to have this many views
const MAX_NUMBER_OF_ITEMS = 2000;  // Maximum items that will be queried from DynamoDB at one time

var baseUrl = "..";
var popularResults = [];
var recentResults = [];

/**
 * Class for all search criteria
 *
 * @constructor
 */
function SearchCriteria() {
    /**
     * @var matchLimit - limit the number of matches to return. This is not an exact limit, but has to do with responses
     *                          being returned a page at a time.  Once number of entries gets to or is above this count
     *                          then no more pages will be fetched.
     * @var languages - array of language code strings or null for any language
     * @var full_text - text to find in any field (if not null)
     * @var user_name - text to find in user_name (if not null)
     * @var repo_name - text to find in repo_name (if not null)
     * @var resID - text to match in resource_id (if not null)
     * @var resType - text to match in resource_type (if not null)
     * @var title - text to find in title (if not null)
     * @var time - text to find in time (if not null)
     * @var manifest - text to find in manifest (if not null)
     * @var minViews - Minimum number of views needed (if not 0 or null)
     * @var daysForRecent - Number of days before today that a project's last update has to be to not require minViews
     * @var returnedFields - comma delimited list of fields to return.  If null it will default to
     *                              all fields
     */
    this.matchLimit = MAX_NUMBER_OF_ITEMS;
    this.languages = null;
    this.full_text = null;
    this.repo_name = null;
    this.user_name = null;
    this.resID = null;
    this.resType = null;
    this.title = null;
    this.time = null;
    this.manifest = null;
    this.minViews = 0;
    this.daysForRecent = null;
}

/**
 * Return a formatted string.
 *
 * Replaces {0}, {1} ... {n} with the corresponding elements of the args array.
 * @param {String} format The format string
 * @param {String[]} args The list of replacements
 * @returns {String}
 */
function simpleFormat(format, args) {
  return format.replace(/{(\d+)}/g, function (match, index) {
    return (typeof args[index] !== 'undefined') ? args[index] : match;
  });
}

/**
 * Creates a single item
 *
 * @param params
 * @param key
 * @returns {*}
 */
function getSingleItem(params, key) {
    var value = params[key];
    if(value && (value instanceof Array)) {
        return value[0]; // if multiple, use first
    }
    return value;
}

/**
 * Creates an array item
 *
 * @param params
 * @param key
 * @returns {*}
 */
function getArrayItem(params, key) {
    var value = params[key];
    if ((value && !(value instanceof Array))) {
        return [value]; // if single, put in array
    }
    return value;
}

/**
 * Update the results stored in memory and shows them.
 *
 * @param err
 * @param entries
 */
function updateResults(err, entries) {
    if (!err) {
        popularResults = _.sortBy(entries, 'views').reverse();
        recentResults = _.sortBy(entries, 'last_updated').reverse();
        // Calling showSearchResults() without specifying a section means we want both emptied and newly populated
        showSearchResults();
    } else {
        var message = getMessageString(err, entries, "Search");
        alert(message);
    }
}

/**
 * Searches for the selected search keys in the url
 *
 * @param searchUrl - The term or phrase to search for
 */
function searchProjects(searchUrl) {
    searchUrl = (typeof searchUrl === 'undefined') ? window.location.href : searchUrl;
    var resultFields = "repo_name, user_name, title, lang_code, manifest, last_updated, views";
    var criteria = getSearchCriteriaFromUrl(searchUrl);
    if(_.isEqual(criteria, new SearchCriteria())){
        // Nothing was set in the criteria, so is the default page, setting minViews and daysFoRecent
        criteria.minViews = DEFAULT_PAGE_MINIMUM_VIEWS;
        criteria.daysForRecent = DEFAULT_PAGE_NUMBER_DAYS_FOR_RECENT
    }
    return searchManifestTable(criteria, updateResults);
}

/**
 * Gets the search criteria from the URL and returns it in an object
 * 
 * @param searchUrl
 * @returns SearchCriteria
 */
function getSearchCriteriaFromUrl(searchUrl){
    var criteria = new SearchCriteria();

    if(! searchUrl)
        return criteria;

    var parts = searchUrl.split('?');
    var urlParts = parts[0].split('/');
    var remove = (urlParts[urlParts.length - 1] === '') ? 2 : 1;
    urlParts = urlParts.slice(0, urlParts.length - remove);
    baseUrl = urlParts.join('/');

    if (parts.length < 2)
        return criteria;

    var params = extractUrlParams(parts[1]);
    criteria.full_text = getSingleItem(params, 'q');
    criteria.repo_name = getSingleItem(params, 'repo');
    criteria.user_name = getSingleItem(params, 'user');
    criteria.resID = getSingleItem(params, 'resource');
    criteria.resType = getSingleItem(params, 'type');
    criteria.title = getSingleItem(params, 'title');
    criteria.time = getSingleItem(params, 'time');
    criteria.manifest = getSingleItem(params, 'manifest');
    criteria.languages = getArrayItem(params, 'lc');
    return criteria;
}

/**
 * Repopulates the search field and language filters from the URL parameters
 *
 * @param searchUrl
 */
function populateSearchFieldFromUrl(searchUrl) {
    searchUrl = (typeof searchUrl === 'undefined') ? window.location.href : searchUrl;
    var criteria = getSearchCriteriaFromUrl(searchUrl);
    if(_.isEqual(criteria, new SearchCriteria()))
        return; // Nothing to populate so returning;
    var searchFieldArr = [];
    if (criteria.full_text) searchFieldArr.push(criteria.full_text);
    // if (criteria.repo_name) searchFieldArr.push('repo:'+criteria.repo_name);
    // if (criteria.user_name) searchFieldArr.push('user:'+criteria.user_name);
    // if (criteria.resID) searchFieldArr.push('resource:'+criteria.resID);
    // if (criteria.resType) searchFieldArr.push('type:'+criteria.resType);
    // if (criteria.title) searchFieldArr.push('title:'+criteria.title);
    // if (criteria.time) searchFieldArr.push('time:'+criteria.time);
    // if (criteria.manifest) searchFieldArr.push('manifest:'+criteria.manifest);
    $('#search-for').val(searchFieldArr.join(' '));
    if (criteria.languages) {
        $.each(criteria.languages, function (index) {
            var lc = criteria.languages[index];
            addLanguageFilter({'lc': lc, 'ln': lc, 'ang': lc});
        });
    }
}

/**
 * Gets the parameters from a URL
 *
 * @param search_string
 * @returns {{}}
 */
function extractUrlParams(search_string) {
    function parse(params, pairs) {
        var pair = pairs[0];
        var parts = pair.split('=');
        var key = decodeURIComponent(parts[0]);
        var value = decodeURIComponent(parts.slice(1).join('='));

        // Handle multiple parameters of the same name
        if (typeof params[key] === "undefined") {
            params[key] = value;
        } else {
            params[key] = [].concat(params[key], value);
        }

        return pairs.length === 1 ? params : parse(params, pairs.slice(1));
    }

    // Get rid of leading ?
    return search_string.length === 0 ? {} : parse({}, search_string.split('&'));
}

/**
 * Adds an array of project entries from the DB to the display of a given section
 *
 * @param $div
 * @param section_type
 * @param recent
 * @param template
 * @param moreLink
 */
function addEntriesToDiv($div, section_type, recent, template, moreLink) {
    $div.find('.more-container').remove();
    for (var i = 0, len = recent.length; i < len; i++) {
        showThisItem(recent[i], $div, template);
    }
    if(moreLink) {
        showMoreLink($div, section_type);
    }
}

/**
 * Given a fibonacci number, it gets the next one in the series
 *
 * @param last - the last fibonacci number in the series
 * @returns {number} - The next fibonacci number in the series
 */
function getNextFibonacci(last) {
    var n1 = 1;
    var n2 = 1;
    var fib = n1;
    while(fib <= last) {
        fib = n1 + n2;
        n1 = n2;
        n2 = fib;
    }
    return fib;
}

/**
 * Shows more results for the given section
 *
 * @param sectionToShow
 */
function showSearchResults(sectionToShow) {
    // load the template
    var template = $('#listing-template').html();

    var $popular_div = $('#popular-div .search-listing');
    var $recent_div = $('#recent-div .search-listing');

    var indexFrom, numberToAdd, indexTo, moreLink;

    if (typeof sectionToShow === 'undefined') {
        $popular_div.empty();
        $recent_div.empty();
    }

    if (!sectionToShow || sectionToShow === SECTION_TYPE_POPULAR) {
        if(! popularResults.length) {
            $popular_div.html('<div class="no-results">No results.</div>');
        }
        else {
            // display popular
            indexFrom = $popular_div.find('.listing-container').length;
            numberToAdd = getNextFibonacci(indexFrom);
            numberToAdd = (numberToAdd > 21 ? 21 : (numberToAdd < 5 ? 5 : numberToAdd));
            indexTo = indexFrom + numberToAdd;
            moreLink = true;
            if (indexTo >= popularResults.length) {
                moreLink = false;
                indexTo = popularResults.length - 1;
            }
            addEntriesToDiv($popular_div, SECTION_TYPE_POPULAR, popularResults.slice(indexFrom, indexTo), template, moreLink);
        }
    }

    if (!sectionToShow || sectionToShow === SECTION_TYPE_RECENT) {
        if(! recentResults.length) {
            $recent_div.html('<div class="no-results">No results.</div>');
        } else {
            // display recent
            indexFrom = $recent_div.find('.listing-container').length;
            numberToAdd = getNextFibonacci(indexFrom);
            numberToAdd = (numberToAdd > 21 ? 21 : (numberToAdd < 5 ? 5 : numberToAdd));
            indexTo = indexFrom + numberToAdd;
            moreLink = true;
            if (indexTo >= recentResults.length) {
                moreLink = false;
                indexTo = recentResults.length - 1;
            }
            addEntriesToDiv($recent_div, SECTION_TYPE_RECENT, recentResults.slice(indexFrom, indexTo), template, moreLink);
        }
    }
}

/**
 * Extract sub item with fallback on error
 *
 * @param item
 * @param keys
 * @param defaultValue - default value to return on error (otherwise will return "" on error)
 * @return {string}
 */
function getSubItem(item, keys, defaultValue) {
    var retValue = defaultValue || "";
    try {
        keys.forEach(function (key) {
            item = item[key];
            if(key === "manifest") {
                item = JSON.parse(item);
            }
        });
        retValue = item;
    } catch (e) { }
    return retValue;
}

/**
 * Appends item to the specified div
 *
 * @param {Object} item
 * @param {Object} $div A jquery object
 * @param {String} template The HTML template for the new item
 */
function showThisItem(item, $div, template) {
    var $template = $(template);
    var today = moment.utc().startOf('day');
    var title = getSubItem(item, ['title']);
    $template.find('.title-span').html(title);
    var authorFormat = l10n['author'];
    var author = getSubItem(item, ['user_name']);
    $template.find('.author-div').html(simpleFormat(authorFormat, [author]));
    $template.find('.language-title-span').html(l10n['language']);
    var langAndCodeFormat = l10n['language_with_code'];
    var langName = getSubItem(item, ['manifest', 'dublin_core', 'language', 'title']);
    var langCode = getSubItem(item, ['lang_code']);
    $template.find('.language-code-div').html(simpleFormat(langAndCodeFormat, [langName, langCode]));
    var views = getSubItem(item, ['views']);
    $template.find('.views-span').html(views);
    var lastUpdated = getSubItem(item, ['last_updated'], '1970-01-01');
    $template.find('.updated-span').html(getDateDiff(lastUpdated, today));

    var url = baseUrl + '/u/' + author + "/" + getSubItem(item, ['repo_name']);
    $template.find('a').attr('href', url);

    $div.append($template);
}

/**
 * Gets the amount of time from now to a given date
 *
 * @param published_date
 * @param {Object} today A moment object representing today
 * @returns {string}
 */
function getDateDiff(published_date, today) {

  // calculate the difference in days
  var published = moment(published_date);
  var days = today.diff(published, 'days');

  if (days < 1)
    return l10n['updated_today'];

  var idx;

  if (days < 7) {
    idx = (days > l10n['day'].length - 1 ? l10n['day'].length - 1 : days);
    return simpleFormat(l10n['updated_days'], [days, l10n['day'][idx]]);
  }

  // calculate the difference in weeks
  var weeks = today.diff(published, 'weeks');

  if (weeks < 5) {
    idx = (weeks > l10n['week'].length - 1 ? l10n['week'].length - 1 : weeks);
    return simpleFormat(l10n['updated_weeks'], [weeks, l10n['week'][idx]]);
  }

  // calculate the difference in months
  var months = today.diff(published, 'months');
  idx = (months > l10n['month'].length - 1 ? l10n['month'].length - 1 : months);
  return simpleFormat(l10n['updated_months'], [months, l10n['month'][idx]]);
}

/**
 * Displays the more link for a given section
 *
 * @param $div
 * @param section_type
 */
function showMoreLink($div, section_type) {
  var $template = $($('#more-template').html());
  $template.find('a').click(function(){
      showSearchResults(section_type);
      // prevent default
      return false;
  });
  $div.append($template);
}

/**
 * Scrolls to the Results section
 *
 * @param scroll_to_id
 * @returns {boolean}
 */
function scrollToResults(scroll_to_id) {
  var item_top = $('#' + scroll_to_id).offset().top;
  window.scrollTo(0, item_top - 130);
  // prevent default
  return false;
}

/**************************** language selector ****************************/
var languageSelectorTimer;
var languageSearchResults = {};

/**
 * Initialize the language selector
 */
function setupLanguageSelector() {
  var $searchFor = $('#search-for');

  $searchFor.on('keyup', function (event, testEvent) {
    if(typeof testEvent!== 'undefined'){
      event = testEvent;
    }
    languageSelectorKeyUp(event);
  });

  $('body').on('click', '.lc-filter, .remove-lc.x', function(event){
    removeLanguageFilter(event.target);
  });
}

/**
 * Handles KeyUp event in the search field to see if it is a language code and present the user with autocomplete
 *
 * @param event
 */
function languageSelectorKeyUp(event) {
  // the Enter key press must be handled by the plugin
  if (event.which === 13) return;

  // if the timer is currently running, reset it
  if (languageSelectorTimer) {
    clearTimeout(languageSelectorTimer);
  }

  var $textBox = $(event.target);
  var term = extractLastSearchTerm().toLowerCase().substr(0,4);

  // clear the list
  if($textBox.autocomplete('instance')) {
    $textBox.autocomplete('option', 'source', []);
  }

  if($textBox.val().length < 2) {
    return;
  }

  if(typeof languageSearchResults[term] === 'undefined') {
    if (typeof event['unitTest'] === 'undefined') {
      languageSelectorTimer = setTimeout(getLanguageListItems, 500, $textBox);
    }
  } else{
    getLanguageListItems($textBox);
  }
}

/**
 * Process the languages to make the autocomplete drop-drown
 *
 * @param {Object} $textBox
 * @param results
 * @param {function} [callback]
 */
function processLanguages($textBox, results, callback) {
  var languages = [];
  var lastSearchTerm = extractLastSearchTerm();
  if(!lastSearchTerm) return;
  var textVal = lastSearchTerm.toLowerCase();

  for (var i = 0; i < results.length; i++) {
    var langData = results[i];
    if ((textVal.length > 2) || (langData['lc'].toLowerCase().startsWith(textVal))) {
      langData['value'] = langData['ln'] + (langData['ang'] && langData['ang'] !== langData['ln'] ? ' - ' + langData['ang']:'') + ' (' + langData['lc'] +')';
      langData['label'] = langData['value'] + ' ' + langData['lr'];
      languages.push(langData);
    }
  }

  if (! $textBox.hasClass('ui-autocomplete-input')) {
    $textBox.autocomplete({
      minLength: 0,
      select: function(event, ui){
        removeLastSearchTerm();
        addLanguageFilter(ui.item);
        return false;
      }
    }).autocomplete('instance')._renderItem = function( ul, item ) {
      return $('<li style="font-size: 0.9em;">')
        .append(item['ln'] + (item['ang'] && item['ang'] !== item['ln'] ? ' - ' + item['ang'] : '') + ' (' + item['lc'] + ')<br><span style="font-size: 0.9em;">Region: ' + item['lr'] + '</span>')
        .appendTo(ul);
    };
  }

  $textBox.autocomplete('option', 'source', languages.sort(function(a, b) { return sortLanguages(a, b, textVal); }));
  $textBox.autocomplete('search', textVal);

  if (typeof callback === 'function') {
    callback(languages);
  }
}

/**
 * Sorts the languages for best results first
 *
 * @param langA
 * @param langB
 * @param text
 * @returns {number}
 */
function sortLanguages(langA, langB, text) {
  // SORT THE LIST:
  // 4. exact language code match
  // 3. language code starts-with match
  // 2. language description starts-with
  // 1. language description contains
  // 0. sort the rest alphabetically

  var valA = 0, valB = 0;
  text = text.toLowerCase();
  var langA_code = langA['lc'].toLowerCase();
  var langB_code = langB['lc'].toLowerCase();

  // look for exact language code match
  if (langA_code === text) valA = 4;
  if (langB_code === text) valB = 4;

  // look for language code starts-with match
  if ((valA === 0) && langA_code.startsWith(text)) valA = 3;
  if ((valB === 0) && langB_code.startsWith(text)) valB = 3;

  // look for language description starts-with
  var langA_name = langA['ln'].toLowerCase();
  var langB_name = langB['ln'].toLowerCase();
  if ((valA === 0) && langA_name.startsWith(text)) valA = 2;
  if ((valB === 0) && langB_name.startsWith(text)) valB = 2;

  // look for language description contains
  var regex = new RegExp('.+' + text + '.*', 'i');
  if ((valA === 0) && (regex.test(langA_name))) valA = 1;
  if ((valB === 0) && (regex.test(langB_name))) valB = 1;

  var compare = valB - valA;
  if (compare !== 0) return compare;

  // if none of the above applies, try to sort alphabetically
  return langA_name.localeCompare(langB_name);
}

/**
 * Gets the list of language items from https://door43.org:9096
 *
 * @param {Object} $textBox
 * @param {function|Spy} [callback]  Optional. Initially added for unit testing
 */
function getLanguageListItems($textBox, callback) {
  // reset the timer flag
  languageSelectorTimer = 0;
  var term = extractLastSearchTerm().toLowerCase().substr(0, 4);
  if(typeof languageSearchResults[term] !== 'undefined'){
    processLanguages($textBox, languageSearchResults[term], callback);
  } else {
    var request = {type: 'GET', url: 'https://door43.org:9096/?q=' + encodeURIComponent(term)};
    $.ajax(request).done(function (data) {
      if (!data.results) return;
      languageSearchResults[term] = data.results;
      processLanguages($textBox, data.results, callback);
    });
  }
}

/**
 * For adding keys to a message
 *
 * @param entry
 * @param key
 * @param line
 * @returns {*}
 */
function addKey(entry, key, line) {
    if (entry[key]) {
        line += ", " + key + "=" + entry[key];
    }
    return line;
}

/**
 * Displays error messages
 *
 * @param err
 * @param entries
 * @param search_for
 * @returns {string}
 */
function getMessageString(err, entries, search_for) {
    var message = "Search error";
    if (err) {
        console.log("Error: " + err);
    } else {
        if (entries.length === 0) {
            message = "No matches found for: '" + search_for + "'";
        } else {
            var summary = "";
            var count = 0;
            entries.forEach(function (entry) {
                var line = "entry " + (++count) + ": '" + entry.title + "', " + entry.repo_name + "/" + entry.user_name;
                line = addKey(entry, 'lang_code', line);
                line = addKey(entry, 'views', line);
                line = addKey(entry, 'last_updated', line);
                summary += line + "\n";
            });
            message = count + " Matches found for '" + search_for + "':\n" + summary;
        }
    }
    return message;
}

function updateUrl(newUrl) {
    history.pushState(null, null, newUrl);
}

function updateUrlWithSearchParams(url, langCodes, fullTextSearch) {
    url = (typeof url === 'undefined' ? window.location.href : url);
    langCodes = (typeof langCodes === 'undefined' ? getLanguageCodesToFilter() : langCodes);
    fullTextSearch = (typeof fullTextSearch === 'undefined' ? $('#search-for').val() : fullTextSearch);

    var searchStr = "";
    if (langCodes && langCodes.length > 0) {
        searchStr = "lc=" + langCodes.join("&lc=");
    }
    if(fullTextSearch) {
        if(searchStr) {
            searchStr += "&";
        }
        searchStr += "q=" + fullTextSearch;
    }
    var parts = url.split('?');
    var newUrl = parts[0] + "?" + encodeURI(searchStr);
    updateUrl(newUrl);
    return newUrl;
}

function splitSearchTerms(val) {
  if(typeof val !== 'undefined')
    return val.split( /\s+/ );
  else
    return [];
}

function extractLastSearchTerm() {
  var $searchFor = $('#search-for');
  var terms = splitSearchTerms($searchFor.val());
  if(terms.length > 0)
    return terms.pop();
}

function removeLastSearchTerm(){
  var $searchFor = $('#search-for');
  var terms = $searchFor.val().split(' ');
  terms.pop();
  $searchFor.val(terms.join(' '));
}

function addLanguageFilter(item){
  var lc = item['lc'];
  var title = item['ln'] + (item['ang'] && item['ang'] !== item['ln'] ? ' - ' + item['ang'] : '') + ' (' + lc + ')';
  if(! $('#lc-filter-'+lc).length) {
    var $lc_filter = $('<span id="lc-filter-'+lc+'" class="lc-filter" title="'+title+'">'+lc+'<span class="remove-lc-x">x</span></span>');
    $lc_filter.data('lc', lc);
    $lc_filter.insertBefore($('#search-for'));
  }
}

function removeLanguageFilter(element){
  $element = $(element);
  if($element.hasClass('lc-filter'))
    $element.remove();
  else if($element.hasClass('remove-lc-x'))
    $element.parent().remove();
}

function getLanguageCodesToFilter(){
  var lcs = [];
  $('.lc-filter').each(function(){
    lcs.push($(this).data('lc'));
  });
  return lcs;
}

$(document).ready(function () {
    setupLanguageSelector();
    populateSearchFieldFromUrl();
    searchProjects();

    $('#search-td').on('click', function () {
        updateUrlWithSearchParams();
        searchProjects();
    });

    $('#browse-td').on('click', function () {
        // TODO: put actual browse code here.
        alert('Browse code goes here.');
    });
});

function searchContinue(docClient, params, retData, matchLimit, callback) {
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            callback(err, retData);
        } else {
            if('Items' in data) {
                retData = retData.concat(data.Items);
            }
            var itemCount = retData.length;
            if((itemCount >= matchLimit) || !('LastEvaluatedKey' in data)) {
                callback(err, retData);
            } else { // more in list that we need to get
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                searchContinue(docClient, params, retData, matchLimit, callback);
            }
        }
    }
}

function appendFilter(filterExpression, rule, orTogether) {
    const concat = orTogether ? " OR " : " AND ";

    if(!filterExpression) {
        filterExpression = "";
    }
    if(filterExpression.length > 0) {
        filterExpression += concat;
    }
    filterExpression += rule;
    return filterExpression;
}

function generateQuerySet(languages, expressionAttributeValues) {
    var set = "";
    for (var i = 0; i < languages.length; i++) {
        var contentIdName = ":val_" + (i + 1);
        if (i === 0) {
            set += contentIdName;
        } else {
            set += ", " + contentIdName;
        }
        expressionAttributeValues[contentIdName] = languages[i].toLowerCase();
    }
    return set;
}

/***
 * kicks off a search for entries in the manifest table (case insensitive). Search parameters are ANDed together to
 *              refine search.
 * 
 * @params SearchCriteria - the search criteria
 * @param callback - call back function onScan(err, entries) - where:
 *                                              err - an error message string
 *                                              entries - an array of table entry objects that match the search params.
 *                                                where each object contains returnedFields
 * @return boolean - true if search initiated, if false then search error
 */
function searchManifestTable(criteria, callback) {
    try {
        var tableName = getManifestTable();
        var expressionAttributeValues = {};
        var filterExpression = "";
        var expressionAttributeNames = {};
        var projectionExpression = null;

        if(criteria.minViews > 0) {
            expressionAttributeNames["#views"] = "views";
            expressionAttributeValues[":views"] = criteria.minViews;
            filterExpression = appendFilter(filterExpression, "#views >= :views", true);
            if (criteria.daysForRecent) {
                var currentDate = new Date();
                var recentMS = currentDate.valueOf() - criteria.daysForRecent * 24 * 60 * 60 * 1000; // go back daysForRecent days in milliseconds
                expressionAttributeNames["#date"] = "last_updated";
                expressionAttributeValues[":recent"] = new Date(recentMS).toISOString();
                filterExpression = appendFilter(filterExpression, "#date >= :recent", true);
            }
        }

        if (criteria.languages && criteria.languages.length) {
            var set = generateQuerySet(criteria.languages, expressionAttributeValues);
            filterExpression = appendFilter(filterExpression, "(#lc in (" + set + "))");
            expressionAttributeNames["#lc"] = "lang_code";
        }

        if(criteria.user_name) {
            expressionAttributeValues[":user"] = criteria.user_name.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#u, :user)");
            expressionAttributeNames["#u"] = "user_name_lower";
        }

        if(criteria.repo_name) {
            expressionAttributeValues[":repo"] = criteria.repo_name.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#r, :repo)");
            expressionAttributeNames["#r"] = "repo_name_lower";
        }

        if(criteria.title) {
            expressionAttributeValues[":title"] = criteria.title;
            filterExpression = appendFilter(filterExpression, "contains(#title, :title)");
            expressionAttributeNames["#title"] = "title";
        }

        if(criteria.time) {
            expressionAttributeValues[":time"] = criteria.time;
            filterExpression = appendFilter(filterExpression, "contains(#time, :time)");
            expressionAttributeNames["#time"] = "last_updated";
        }

        if(criteria.manifest) {
            expressionAttributeValues[":manifest"] = criteria.manifest.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#m, :manifest)");
            expressionAttributeNames["#m"] = "manifest_lower";
        }

        if(criteria.resID) {
            expressionAttributeValues[":resID"] = criteria.resID.toLowerCase();
            filterExpression = appendFilter(filterExpression, "#id = :resID");
            expressionAttributeNames["#id"] = "resource_id";
        }

        if(criteria.resType) {
            expressionAttributeValues[":type"] = criteria.resType.toLowerCase();
            filterExpression = appendFilter(filterExpression, "#t = :type");
            expressionAttributeNames["#t"] = "resource_type";
        }

        if(criteria.full_text) {
            expressionAttributeValues[":match"] = criteria.full_text.toLowerCase();
            filterExpression = appendFilter(filterExpression, "(contains(#m, :match) OR contains(#r, :match) OR contains(#u, :match))");
            expressionAttributeNames["#m"] = "manifest_lower";
            expressionAttributeNames["#r"] = "repo_name_lower";
            expressionAttributeNames["#u"] = "user_name_lower";
        }

        if (criteria.returnedFields) {
            criteria.returnedFields = substituteReserved(criteria.returnedFields, 'views', expressionAttributeNames);
            projectionExpression = criteria.returnedFields;
        }

        var params = {
            TableName: tableName,
            Limit: criteria.matchLimit // number of records to get
        };

        if(filterExpression) {
            params.FilterExpression = filterExpression;
            if (expressionAttributeNames)
                params.ExpressionAttributeNames = expressionAttributeNames;
            if (expressionAttributeValues)
                params.ExpressionAttributeValues = expressionAttributeValues;
            if (projectionExpression)
                params.ProjectionExpression = projectionExpression;
        }

    } catch(e) {
        var err = "Could not search languages: " + e.message;
        callback(err, null);
        return false;
    }

    var docClient = new AWS.DynamoDB.DocumentClient();
    searchContinue(docClient, params, [], criteria.matchLimit, callback);
    return true;
}

function substituteReserved(returnedFields, key, expressionAttributeNames) {
    if (returnedFields.indexOf(key)) {
        var sub = "#" + key;
        returnedFields = returnedFields.replace(key, sub);
        expressionAttributeNames[sub] = key;
        return returnedFields;
    }
}
