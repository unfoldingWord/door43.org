/**************************************************************************************************
 **********************          DOCUMENT READY FUNCTIONS                **************************
 **************************************************************************************************/
var pageLoaded = false;

/**
 * Functions to setup the language page on document ready
 */
function onReady() {
    setupLanguageSelector();
    setupSearchFieldFromUrl();
    searchProjects();
    getAndUpdateLanguagePageViews(null,window.location.href,1);
    pageLoaded = true;

    $('#search-button').on('click', function () {
        updateUrlWithSearchParams();
        searchProjects();
    });

    $('#browse-button').on('click', function () {
        // TODO: put actual browse code here.
        alert('Browse code goes here.');
    });

    $('#language-filter').on('DOMSubtreeModified', function () {
        if (pageLoaded)
            $('#search-button').trigger('click');
    });
}

/**
 * Called when the document is ready
 */
$(document).ready(function () {
    onReady();
});


/**************************************************************************************************
 *******************     SEARCH FIELD & LANGUAGE FILTER FUNCTIONS              ********************
 **************************************************************************************************/
var languageSelectorTimer;
var languageSearchResults = {};

/**
 * Fix for IE 11 since it doesn't have startsWith()
 */
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(str, position) {
        position = position || 0;
        return this.indexOf(str, position) === position;
    };
}

/**
 * Initialize the language selector
 */
function setupLanguageSelector() {
    var $searchField = $('#search-field');
    var $body = $('body');

    if($searchField.length) {
        $searchField.autocomplete({
            minLength: 2,
            select: function (event, ui) {
                removeLastSearchTerm();
                addLanguageFilter(ui.item);
                return false;
            }
        }).autocomplete('instance')._renderItem = function (ul, item) {
            return $('<li style="font-size: 0.9em;">')
                .append(item['ln'] + (item['ang'] && item['ang'] !== item['ln'] ? ' - ' + item['ang'] : '') + ' (' + item['lc'] + ')<br><span style="font-size: 0.9em;">Region: ' + item['lr'] + '</span>')
                .appendTo(ul);
        };

        $searchField.on('keyup', function (event, testEvent) {
            if (typeof testEvent !== 'undefined') {
                event = testEvent;
            }
            languageSelectorKeyUp(event);
        });
    }

    if($body.length) {
        $('body').on('click', '.lc-filter, .remove-lc.x', function (event) {
            removeLanguageFilter(event.target);
        });
    }
}

/**
 * Handles KeyUp event in the search field to see if it is a language code and present the user with autocomplete
 *
 * @param {Object} event
 */
function languageSelectorKeyUp(event) {
    // the Enter key press must be handled by the plugin
    if (event.which === 13) {
        $('#search-button').trigger('click');
        return;
    }

    // if the timer is currently running, reset it
    if (languageSelectorTimer) {
        clearTimeout(languageSelectorTimer);
    }

    var $searchField = $(event.target);
    var term = extractLastSearchTerm().toLowerCase().substr(0, 4);

    // clear the list
    if ($searchField.autocomplete('instance')) {
        $searchField.autocomplete('option', 'source', []);
    }

    if ($searchField.val().length < 2) {
        return;
    }

    if (typeof languageSearchResults[term] === 'undefined') {
        if (typeof event['unitTest'] === 'undefined') {
            languageSelectorTimer = setTimeout(getLanguageListItems, 500, $searchField);
        }
    } else {
        getLanguageListItems($searchField);
    }
}

/**
 * Gets the last word from the search field
 *
 * @returns {string}
 */
function extractLastSearchTerm() {
    var $searchField = $('#search-field');
    var terms = splitSearchTerms($searchField.val());
    if (terms.length > 0)
        return terms.pop();
}

/**
 * Splits a string into words
 *
 * @param {string} val
 * @returns {string[]}
 */
function splitSearchTerms(val) {
    if (typeof val !== 'undefined')
        return val.split(/\s+/);
    else
        return [];
}

/**
 * Removes the last word from the search field
 */
function removeLastSearchTerm() {
    var $searchField = $('#search-field');
    var terms = $searchField.val().split(' ');
    terms.pop();
    $searchField.val(terms.join(' '));
}

/**
 * Gets the list of language items from https://door43.org:9096
 *
 * @param {JQuery} $searchField
 * @param {function|Spy} [callback]  Optional. Initially added for unit testing
 */
function getLanguageListItems($searchField, callback) {
    // reset the timer flag
    languageSelectorTimer = 0;
    var term = extractLastSearchTerm().toLowerCase().substr(0, 4);
    if (typeof languageSearchResults[term] !== 'undefined') {
        processLanguages($searchField, languageSearchResults[term], callback);
    } else {
        var request = {type: 'GET', url: 'https://door43.org:9096/?q=' + encodeURIComponent(term)};
        $.ajax(request).done(function (data) {
            if (!data.results) return;
            languageSearchResults[term] = data.results;
            processLanguages($searchField, data.results, callback);
        });
    }
}

/**
 * Process the languages to make the autocomplete drop-drown
 *
 * @param {JQuery} $searchField
 * @param results
 * @param {function} [callback]
 */
function processLanguages($searchField, results, callback) {
    var languages = [];
    var lastSearchTerm = extractLastSearchTerm();
    if (!lastSearchTerm) return;
    var textVal = lastSearchTerm.toLowerCase();

    for (var i = 0; i < results.length; i++) {
        var langData = results[i];
        if ((textVal.length > 2) || (langData['lc'].toLowerCase().startsWith(textVal))) {
            langData['value'] = langData['ln'] + (langData['ang'] && langData['ang'] !== langData['ln'] ? ' - ' + langData['ang'] : '') + ' (' + langData['lc'] + ')';
            langData['label'] = langData['value'] + ' ' + langData['lr'];
            languages.push(langData);
        }
    }

    $searchField.autocomplete('option', 'source', languages.sort(function (a, b) {
        return sortLanguages(a, b, textVal);
    }));
    $searchField.autocomplete('search', textVal);

    if (typeof callback === 'function') {
        callback(languages);
    }
}

/**
 * Sorts the languages for best results first
 *
 * @param {Object} langA
 * @param {Object} langB
 * @param {string} text
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
 * Adds a language filter UI button to the language filter
 *
 * @param {Object} item
 */
function addLanguageFilter(item) {
    var $language_filter = $('#language-filter');

    if($language_filter.length) {
        var lc = item['lc'];
        var title = item['ln'] + (item['ang'] && item['ang'] !== item['ln'] ? ' - ' + item['ang'] : '') + ' (' + lc + ')';
        if (!$('#lc-filter-' + lc).length) {
            var $lc_filter = $('<span id="lc-filter-' + lc + '" class="lc-filter" title="' + title + '">' + lc + '<span class="remove-lc-x">x</span></span>');
            $lc_filter.data('lc', lc);
            $language_filter.append($lc_filter);
        }
    }
}

/**
 * Removes a language filter UI button
 *
 * @param {HTMLElement} element
 */
function removeLanguageFilter(element) {
    var $element = $(element);
    if ($element.hasClass('lc-filter'))
        $element.remove();
    else if ($element.hasClass('remove-lc-x'))
        $element.parent().remove();
}

/**
 * Gets all the language codes from the language filter
 *
 * @returns {string[]}
 */
function getLanguageCodesToFilter() {
    var lcs = [];
    $('.lc-filter').each(function () {
        lcs.push($(this).data('lc'));
    });
    return lcs;
}

/**
 * Updates the URL with search params
 *
 * @param {string} [url]
 * @param {string[]} [langCodes]
 * @param {string} [fullTextSearch]
 * @returns {string}
 */
function updateUrlWithSearchParams(url, langCodes, fullTextSearch) {
    var $search_field = $('#search-field');
    var searchStr = "";

    url = (typeof url === 'undefined' ? window.location.href : url);
    langCodes = (typeof langCodes === 'undefined' ? getLanguageCodesToFilter() : langCodes);
    fullTextSearch = (typeof fullTextSearch === 'undefined'  ? $search_field.val() : fullTextSearch);

    if (langCodes && langCodes.length > 0) {
        searchStr = "lc=" + langCodes.join("&lc=");
    }
    if (fullTextSearch) {
        if (searchStr) {
            searchStr += "&";
        }
        searchStr += "q=" + fullTextSearch;
    }
    var parts = url.split('?');
    var newUrl = parts[0] + "?" + encodeURI(searchStr);
    updateUrl(newUrl);
    return newUrl;
}

/**
 * Updates the URL
 *
 * @param {string} newUrl
 */
function updateUrl(newUrl) {
    history.pushState(null, null, newUrl);
}

/**
 * Repopulates the search field and language filters from the URL parameters
 *
 * @param {string} [searchUrl] - The URL to populate the search field. Uses page URL if none given.
 */
function setupSearchFieldFromUrl(searchUrl) {
    searchUrl = (typeof searchUrl === 'undefined') ? window.location.href : searchUrl;
    var $search_field = $('#search-field');

    if($search_field.length) {
        var criteria = getSearchCriteriaFromUrl(searchUrl);
        var searchFieldArr = [];
        if (criteria.full_text) searchFieldArr.push(criteria.full_text);
        // if (criteria.repo_name) searchFieldArr.push('repo:'+criteria.repo_name);
        // if (criteria.user_name) searchFieldArr.push('user:'+criteria.user_name);
        // if (criteria.resID) searchFieldArr.push('resource:'+criteria.resID);
        // if (criteria.resType) searchFieldArr.push('type:'+criteria.resType);
        // if (criteria.title) searchFieldArr.push('title:'+criteria.title);
        // if (criteria.time) searchFieldArr.push('time:'+criteria.time);
        // if (criteria.manifest) searchFieldArr.push('manifest:'+criteria.manifest);
        $search_field.val(searchFieldArr.join(' '));
        if (criteria.languages) {
            $.each(criteria.languages, function (index) {
                var lc = criteria.languages[index];
                addLanguageFilter({'lc': lc, 'ln': lc, 'ang': lc});
            });
        }
    }
}


/**************************************************************************************************
 **********************          MANIFEST TABLE SEARCH FUNCTIONS         **************************
 **************************************************************************************************/

/* Default values for search criteria */
const DEFAULT_PAGE_MINIMUM_VIEWS = 10; // For default page, needs to have this many views
const DEFAULT_PAGE_NUMBER_DAYS_FOR_RECENT = 30; // For default page, needs to have this many views
const MAX_NUMBER_OF_RESULTS_FROM_DB = 10000;  // Maximum items that will be queried from DynamoDB at one time

/* Global variables */
var baseUrl = "..";
var results = [];

/**
 * Class for search criteria
 *
 * @constructor
 */
function SearchCriteria() {
    /**
     * @member {number} matchLimit
     * @member {string[]} languages - array of language code strings or null for any language
     * @member {string} full_text - text to find in any field (if not null)
     * @member {string} user_name - text to find in user_name (if not null)
     * @member {string} repo_name - text to find in repo_name (if not null)
     * @member {string} resID - text to match in resource_id (if not null)
     * @member {string} resType - text to match in resource_type (if not null)
     * @member {string} title - text to find in title (if not null)
     * @member {string} time - text to find in time (if not null)
     * @member {string} manifest - text to find in manifest (if not null)
     * @member {number} minViews - Minimum number of views needed (if not 0 or null)
     * @member {number} daysForRecent - Number of days before today that a project's last update has to be to not require minViews
     * @member {string} returnedFields - comma delimited list of fields to return.  If null it will default to
     *                              all fields
     */
    this.languages = null;
    this.matchLimit = MAX_NUMBER_OF_RESULTS_FROM_DB;
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
    this.returnedFields = null;
}

/**
 * Gets the search criteria from the URL and returns it in an object
 *
 * @param {string} [searchUrl] - The URL to build the search criteria. Uses page URL if none given.
 * @returns {SearchCriteria}
 */
function getSearchCriteriaFromUrl(searchUrl) {
    searchUrl = (typeof searchUrl === 'undefined') ? window.location.href : searchUrl;

    var criteria = new SearchCriteria();

    if (!searchUrl)
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
 * Gets the parameters from a URL
 *
 * @param {string} search_string
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
 * Creates a single item
 *
 * @param {Object} params
 * @param {string} key
 * @returns {string}
 */
function getSingleItem(params, key) {
    var value = params[key];
    if (value && (value instanceof Array)) {
        return value[0]; // if multiple, use first
    }
    return value;
}

/**
 * Creates an array item
 *
 * @param {Object} params
 * @param {string} key
 * @returns {string[]}
 */
function getArrayItem(params, key) {
    var value = params[key];
    if ((value && !(value instanceof Array))) {
        return [value]; // if single, put in array
    }
    return value;
}

/**
 * Searches for the selected search keys in the url
 *
 * @param {string} [searchUrl] - The URL to use to search the projects. Uses page URL if none given.
 */
function searchProjects(searchUrl) {
    searchUrl = (typeof searchUrl === 'undefined') ? window.location.href : searchUrl;
    var criteria = getSearchCriteriaFromUrl(searchUrl);
    if (_.isEqual(criteria, new SearchCriteria())) {
        // Nothing was set in the criteria, so is the default page, setting minViews and daysFoRecent
        criteria.minViews = DEFAULT_PAGE_MINIMUM_VIEWS;
        criteria.daysForRecent = DEFAULT_PAGE_NUMBER_DAYS_FOR_RECENT
    }
    criteria.returnedFields = "repo_name, user_name, title, lang_code, manifest, last_updated, views";
    results = [];
    $('#popular-div').find('.search-listing').html('<span class="loading-results">'+loadingText+'</span>');
    $('#recent-div').find('.search-listing').html('<span class="loading-results">'+loadingText+'</span>');
    return searchManifestTable(criteria, updateResults);
}

/***
 * kicks off a search for entries in the manifest table (case insensitive). Search parameters are ANDed together to
 *              refine search.
 *
 * @param {SearchCriteria} criteria - the search criteria
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

        if (criteria.minViews > 0) {
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

        if (criteria.user_name) {
            expressionAttributeValues[":user"] = criteria.user_name.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#u, :user)");
            expressionAttributeNames["#u"] = "user_name_lower";
        }

        if (criteria.repo_name) {
            expressionAttributeValues[":repo"] = criteria.repo_name.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#r, :repo)");
            expressionAttributeNames["#r"] = "repo_name_lower";
        }

        if (criteria.title) {
            expressionAttributeValues[":title"] = criteria.title;
            filterExpression = appendFilter(filterExpression, "contains(#title, :title)");
            expressionAttributeNames["#title"] = "title";
        }

        if (criteria.time) {
            expressionAttributeValues[":time"] = criteria.time;
            filterExpression = appendFilter(filterExpression, "contains(#time, :time)");
            expressionAttributeNames["#time"] = "last_updated";
        }

        if (criteria.manifest) {
            expressionAttributeValues[":manifest"] = criteria.manifest.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#m, :manifest)");
            expressionAttributeNames["#m"] = "manifest_lower";
        }

        if (criteria.resID) {
            expressionAttributeValues[":resID"] = criteria.resID.toLowerCase();
            filterExpression = appendFilter(filterExpression, "#id = :resID");
            expressionAttributeNames["#id"] = "resource_id";
        }

        if (criteria.resType) {
            expressionAttributeValues[":type"] = criteria.resType.toLowerCase();
            filterExpression = appendFilter(filterExpression, "#t = :type");
            expressionAttributeNames["#t"] = "resource_type";
        }

        if (criteria.full_text) {
            var tokens = criteria.full_text.match(/\w+|"[^"]+"/g); // tokenize by spaces, but keep words grouped by double quotes as one token
            $.each(tokens, function (idx, token) {
                token = token.replace(/^"+|"+$/g, '');  // remove double quotes from around token
                expressionAttributeValues[":match" + idx] = token.toLowerCase();
                filterExpression = appendFilter(filterExpression, "(contains(#m, :match" + idx + ") OR contains(#r, :match" + idx + ") OR contains(#u, :match" + idx + "))");
            });
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

        if (filterExpression) {
            params.FilterExpression = filterExpression;
            if (expressionAttributeNames)
                params.ExpressionAttributeNames = expressionAttributeNames;
            if (expressionAttributeValues)
                params.ExpressionAttributeValues = expressionAttributeValues;
            if (projectionExpression)
                params.ProjectionExpression = projectionExpression;
        }

    } catch (e) {
        var err = "Could not search languages: " + e.message;
        callback(err, null);
        return false;
    }

    var docClient = new AWS.DynamoDB.DocumentClient();
    searchContinue(docClient, params, [], criteria.matchLimit, callback);
    return true;
}

/**
 * Appends a filter
 *
 * @param filterExpression
 * @param rule
 * @param orTogether
 * @returns {*}
 */
function appendFilter(filterExpression, rule, orTogether) {
    const concat = orTogether ? " OR " : " AND ";

    if (!filterExpression) {
        filterExpression = "";
    }
    if (filterExpression.length > 0) {
        filterExpression += concat;
    }
    filterExpression += rule;
    return filterExpression;
}

/**
 * Generates query set
 *
 * @param languages
 * @param expressionAttributeValues
 * @returns {string}
 */
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


/**
 * Handles database reserved words
 *
 * @param returnedFields
 * @param key
 * @param expressionAttributeNames
 * @returns {XML|string|void|*}
 */
function substituteReserved(returnedFields, key, expressionAttributeNames) {
    if (returnedFields.indexOf(key)) {
        var sub = "#" + key;
        returnedFields = returnedFields.replace(key, sub);
        expressionAttributeNames[sub] = key;
        return returnedFields;
    }
}

/**
 * Recursive function to scanall items
 *
 * @param docClient
 * @param params
 * @param retData
 * @param matchLimit
 * @param callback
 */
function searchContinue(docClient, params, retData, matchLimit, callback) {
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            callback(err, retData);
        } else {
            if ('Items' in data) {
                retData = retData.concat(data.Items);
            }
            var itemCount = retData.length;
            if ((itemCount >= matchLimit) || !('LastEvaluatedKey' in data)) {
                callback(err, retData);
            } else { // more in list that we need to get
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                searchContinue(docClient, params, retData, matchLimit, callback);
            }
        }
    }
}

/**
 * Update the results stored in memory and shows them.
 *
 * @param err
 * @param {Object[]} entries
 */
function updateResults(err, entries) {
    if (!err) {
        results = _.sortBy(entries, 'last_updated').reverse();
        // Calling showSearchResults() without specifying a section means we want both emptied and newly populated
        showSearchResults();
    } else {
        var message = getMessageString(err, entries, "Search");
        alert(message);
    }
}

/**
 * Displays messages
 *
 * @param err
 * @param {Object[]} entries
 * @param {string} search_for
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

/**
 * For adding keys to a message
 *
 * @param {Object} entry
 * @param {string} key
 * @param {string} line
 * @returns {string}
 */
function addKey(entry, key, line) {
    if (entry[key]) {
        line += ", " + key + "=" + entry[key];
    }
    return line;
}


/**************************************************************************************************
 **********************         POPULAR & RECENT SECTION FUNCTIONS        **************************
 **************************************************************************************************/
/* For specifying which section is being worked on */
const SECTION_TYPE_POPULAR = 1;
const SECTION_TYPE_RECENT = 2;

var popular_fibonacci_n;
var recent_fibonacci_n;

/**
 * Shows more results for the given section
 *
 * @param {number} [sectionToShow]
 */
function showSearchResults(sectionToShow) {
    // load the template
    var template = $('#listing-template').html();

    var $popular_div = $('#popular-div').find('.search-listing');
    var $recent_div = $('#recent-div').find('.search-listing');

    var indexFrom, numberToAdd, indexTo, displayMoreLink;

    if (typeof sectionToShow === 'undefined') {
        $popular_div.empty();
        $recent_div.empty();
        popular_fibonacci_n = 5;
        recent_fibonacci_n = 5;
    }

    if (typeof sectionToShow === 'undefined' || sectionToShow === SECTION_TYPE_POPULAR) {
        var popularResults = _.sortBy(results.slice().reverse(), 'views').reverse(); // Reverse 1st time since we reverse again
        if (!popularResults.length) {
            $popular_div.html('<div class="no-results">'+noResultsText+'</div>');
        }
        else {
            // display popular
            indexFrom = $popular_div.find('.listing-container').length;
            numberToAdd = fibonacci(popular_fibonacci_n);
            ++popular_fibonacci_n;
            numberToAdd = (numberToAdd > 21 ? 21 : (numberToAdd < 5 ? 5 : numberToAdd));
            indexTo = indexFrom + numberToAdd;
            displayMoreLink = true;
            if (indexTo >= popularResults.length) {
                displayMoreLink = false;
                indexTo = popularResults.length;
            }
            addEntriesToDiv($popular_div, SECTION_TYPE_POPULAR, popularResults.slice(indexFrom, indexTo), template,
                displayMoreLink);
        }
    }

    if (typeof sectionToShow === 'undefined' || sectionToShow === SECTION_TYPE_RECENT) {
        if (!results.length) {
            $recent_div.html('<div class="no-results">'+noResultsText+'</div>');
        } else {
            // display recent
            indexFrom = $recent_div.find('.listing-container').length;
            numberToAdd = fibonacci(recent_fibonacci_n);
            ++recent_fibonacci_n;
            numberToAdd = (numberToAdd > 21 ? 21 : (numberToAdd < 5 ? 5 : numberToAdd));
            indexTo = indexFrom + numberToAdd;
            displayMoreLink = true;
            if (indexTo >= results.length) {
                displayMoreLink = false;
                indexTo = results.length;
            }
            addEntriesToDiv($recent_div, SECTION_TYPE_RECENT, results.slice(indexFrom, indexTo), template, displayMoreLink);
        }
    }
}

/**
 * Given N, find its fibonacci 
 *
 * @param {number} num - N for the fibonacci number 
 * @returns {number} - The fibonacci number
 */
function fibonacci(num) {
  if (num <= 2) return 1;
  return fibonacci(num - 1) + fibonacci(num - 2);
}

/**
 * Adds an array of project entries from the DB to the display of a given section
 *
 * @param {JQuery} $div
 * @param {number} section_type
 * @param {Object[]} entries
 * @param {HTMLElement} template
 * @param {boolean} displayMoreLink
 */
function addEntriesToDiv($div, section_type, entries, template, displayMoreLink) {
    $div.find('.more-container').remove();
    for (var i = 0, len = entries.length; i < len; i++) {
        showThisItem(entries[i], $div, template);
    }
    if (displayMoreLink) {
        showMoreLink($div, section_type);
    }
}

/**
 * Appends item to the specified div
 *
 * @param {Object} item
 * @param {Object} $div A jquery object
 * @param {string} template The HTML template for the new item
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
 * Extract sub item with fallback on error
 *
 * @param {Object} item
 * @param {string[]} keys
 * @param {string} defaultValue - default value to return on error (otherwise will return "" on error)
 * @return {string}
 */
function getSubItem(item, keys, defaultValue) {
    var retValue = defaultValue || "";
    try {
        keys.forEach(function (key) {
            item = item[key];
            if (key === "manifest") {
                item = JSON.parse(item);
            }
        });
        retValue = item;
    } catch (e) {
    }
    return retValue;
}

/**
 * Return a formatted string.
 *
 * Replaces {0}, {1} ... {n} with the corresponding elements of the args array.
 * @param {string} format The format string
 * @param {string[]} args The list of replacements
 * @returns {string}
 */
function simpleFormat(format, args) {
    return format.replace(/{(\d+)}/g, function (match, index) {
        return (typeof args[index] !== 'undefined') ? args[index] : match;
    });
}

/**
 * Gets the amount of time from now to a given date
 *
 * @param {string} published_date
 * @param {Object} today - A moment object representing today
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
 * @param {JQuery} $div
 * @param {number} section_type
 */
function showMoreLink($div, section_type) {
    var $template = $($('#more-template').html());
    $template.find('a').on('click', function () {
        showSearchResults(section_type);
        // prevent default
        return false;
    });
    $div.append($template);
}

/**
 * Scrolls to the Results section
 *
 * @param {string}scroll_to_id
 * @returns {boolean}
 */
function scrollToResults(scroll_to_id) {
    var item_top = $('#' + scroll_to_id).offset().top;
    window.scrollTo(0, item_top - 130);
    // prevent default
    return false;
}

