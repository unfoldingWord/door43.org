
/**
 * Return a formatted string.
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

var baseUrl = "..";

/**
 * Search for the selected search keys in url
 * @param {String} search_url - The term or phrase to search for
 */
function searchForResources(search_url) {
  var resultFields = "repo_name, user_name, title, lang_code, manifest, last_updated, #vw";
  var parts = search_url.split('?');
  var urlParts = parts[0].split('/');
  var remove = (urlParts[urlParts.length - 1] == '') ? 2 : 1;
  urlParts = urlParts.slice(0, urlParts.length - remove);
  baseUrl = urlParts.join('/');

  if((parts.length == 1) || ((parts.length == 2) && (parts[1] == ''))) {
      searchManifestPopularAndRecent(resultFields,
          function (err, entries) {
              if(!err) {
                  var results = {
                      popular: entries,
                      recent: entries
                  };
                  showSearchResults(results)
              } else {
                  var message = getMessageString(err, entries, "Default");
                  alert(message);
              }
          }
      );
  } else {
      //TODO blm: need to add key value searching
  }
}

/**
 * Displays the results returned by the search
 * @param {Object} results
 */
function showSearchResults(results) {

  // validate the results
  if (!results.hasOwnProperty('popular')) {
    console.log('Returned object does not contain "popular."');
    console.log(results);
    return;
  }

  if (!results.hasOwnProperty('recent')) {
    console.log('Returned object does not contain "recent."');
    console.log(results);
    return;
  }

  // load the template
  var template = $('#listing-template').html();

  // sort popular and recent
  var popular = _.sortBy(results['popular'], 'views').reverse();
  var recent = _.sortBy(results['recent'], 'last_updated').reverse();

  // display popular
  var $div = $('#popular-div').find('.search-listing');
  var i, len;
  for (i = 0, len = popular.length; i < len; i++) {
    showThisItem(popular[i], $div, template);
  }
  showMoreLink($div);

  // display popular
  $div = $('#recent-div').find('.search-listing');
  for (i = 0, len = recent.length; i < len; i++) {
    showThisItem(recent[i], $div, template);
  }
  showMoreLink($div);
}

/**
 * extract sub item with fallback on error
 * @param item
 * @param keys
 * @return {string}
 */
function getSubItem(item, keys, defaultValue) {
    var retValue = defaultValue || "";
    try {
        keys.forEach(function (key) {
            item = item[key];
            if(key == "manifest") {
                item = JSON.parse(item);
            }
        });
        retValue = item;
    } catch (e) { }
    return retValue;
}

/**
 * Appends item to the specified div
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
  var author = getSubItem(item,['user_name']);
  $template.find('.author-div').html(simpleFormat(authorFormat, [author]));
  $template.find('.language-title-span').html(l10n['language']);
  var langAndCodeFormat = l10n['language_with_code'];
  var langName = getSubItem(item, ['manifest', 'dublin_core','language','title']);
  var langCode = getSubItem(item, ['lang_code']);
  $template.find('.language-code-div').html(simpleFormat(langAndCodeFormat, [langName, langCode]));
  var views = getSubItem(item, ['views']);
  $template.find('.views-span').html(views);
  var lastUpdated = getSubItem(item,['last_updated'],'1970-01-01');
  $template.find('.updated-span').html(getDateDiff(lastUpdated, today));

  var url = baseUrl + '/u/' + author + "/" + getSubItem(item,['repo_name']);
  $template.find('a').attr('href', url);

  $div.append($template);
}

/**
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

function showMoreLink($div) {

  var $template = $($('#more-template').html());

  // TODO: set anchor href to the correct value
  $template.find('a').attr('href', 'put_the_url_here');

  $div.append($template);
}

function scrollToResults(scroll_to_id) {

  var item_top = $('#' + scroll_to_id).offset().top;
  window.scrollTo(0, item_top - 130);

  // prevent default
  return false;
}

/**************************** language selector ****************************/
var languageSelectorTimer;
var languageCode;
var languagePrompt;

/**
 * Initialize the language selector
 */
function setupLanguageSelector() {
  var $searchFor = $('body').find('#search-for');

  $searchFor.on('keyup', function (event) {
    languageSelectorKeyUp(event);
  });

  $searchFor.on('autocompleteclose', function () {
    parseLanguagePrompt(jQuery(this).val());
  });
}

function parseLanguagePrompt(langText) {
    languageCode = languagePrompt = null;
    if (!langText) return;

    // if closed without picking from the list, do nothing
    var endOfLang = langText.indexOf(')');
    if (endOfLang < 3) return;

    var langCodes = langText.match(/\(([a-z0-9-]+)\)$/i);

    if ((!langCodes) || (langCodes.length !== 2)) return;

    //save language code and readable string
    languagePrompt = langText.substr(0, endOfLang+1);
    languageCode = langCodes[1];
}

/**
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
  var textVal = $textBox.val();
  var lastSearch = $textBox.attr('data-last-search');

  // should we clear the list to avoid showing the wrong list?
  if (lastSearch) {
    if (textVal.length === 1
      || ((lastSearch.length > 2) && (textVal.length < 3))
      || ((lastSearch.length < 3) && (textVal.length > 2))
      || ((textVal.length < lastSearch.length) && !lastSearch.startsWith(textVal))) {
      $textBox.autocomplete('option', 'source', []);
    }
  }

  if (typeof event['unitTest'] === 'undefined')
    languageSelectorTimer = setTimeout(languageSelectorTimeout, 500, event.target);
}

/**
 * Use a timeout to prevent unnecessary searching while typing
 * @param {HTMLInputElement} textBox
 */
function languageSelectorTimeout(textBox) {

  // reset the timer flag
  languageSelectorTimer = 0;

  var $textBox = $(textBox);
  var textVal = $textBox.val();

  // don't search for nothing
  if (textVal.length < 2) return;

  var lastSearch = $textBox.attr('data-last-search');

  // limit the search to the first 4 characters
  var thisSearch = (textVal.length > 4) ? textVal.substr(0, 4) : textVal;

  // if the search text has changed, refresh the list of languages
  if (thisSearch !== lastSearch) {

    $textBox.attr('data-last-search', thisSearch);
    getLanguageListItems($textBox);
  }
}

/**
 *
 * @param {Object} $textBox
 * @param results
 * @param {function} [callback]
 */
function processLanguages($textBox, results, callback) {

  var languages = [];
  var textVal = $textBox.val().toLowerCase();

  for (var i = 0; i < results.length; i++) {

    var langData = results[i];
    if ((textVal.length > 2) || (langData['lc'].toLowerCase().startsWith(textVal))) {
      langData['value'] = langData['ln'] + (langData['ang'] && langData['ang'] !== langData['ln'] ? ' - ' + langData['ang']:'') + ' (' + langData['lc'] +')';
      langData['label'] = langData['value'] + ' ' + langData['lr'];
      languages.push(langData);
    }
  }

  if (!$textBox.hasClass('ui-autocomplete-input')) {
    $textBox.autocomplete({
      minLength: 0
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
 * @param {Object} $textBox
 * @param {function|Spy} [callback]  Optional. Initially added for unit testing
 */
function getLanguageListItems($textBox, callback) {

  var request = {type: 'GET', url: 'https://door43.org:9096/?q=' + encodeURIComponent($textBox.val().toLowerCase())};

  $.ajax(request).done(function(data) {

    if (!data.results) return;

    processLanguages($textBox, data.results, callback);
  });
}

function addKey(entry, key, line) {
    if (entry[key]) {
        line += ", " + key + "=" + entry[key];
    }
    return line;
}

function getMessageString(err, entries, search_for) {
    var message = "Search error";
    if (err) {
        console.log("Error: " + err);
    } else {
        if (entries.length == 0) {
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

function searchAndDisplayResults(searchStr, languagePrompt, languageCode) {
    var langSearch = null;
    var fullTextSearch = searchStr; // default to fulltext search
    var searchPrompt = searchStr;

    // if language was selected, separate it out
    if(languageCode) {
        searchPrompt = languagePrompt;
        langSearch = [languageCode];
        if(searchStr.indexOf(languagePrompt) == 0) { // if searchStr starts with languagePrompt, remove it
            var q = searchStr.substr(languagePrompt.length).trim();
            if(q.length) { // if there was more text to search, extract it out
                fullTextSearch = q;
                searchPrompt += " " + q;
            } else {
                fullTextSearch = null;
            }
        }
    }

    var resultFields = "repo_name, user_name, title, lang_code, manifest, last_updated, #vw";
    searchManifest(50, langSearch, null, null, null, fullTextSearch, resultFields,
        function (err, entries) {
            var message = getMessageString(err, entries, searchPrompt);
            alert(message);
        }
    );
}

$().ready(function () {
  window.setTimeout(searchForResources(window.location.href), 500);
  window.setTimeout(setupLanguageSelector(), 500);

  $('#search-td').on('click', function (){
    var search_for = $('#search-for').val();
    searchAndDisplayResults(search_for, languagePrompt, languageCode);
  });

  $('#browse-td').on('click', function (){

    // TODO: put actual browse code here.
    alert('Browse code goes here.');
  });
});

function searchContinue(docClient, params, retData, matchLimit, onFinished) {
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            onFinished(err, retData);
        } else {
            if('Items' in data) {
                retData = retData.concat(data.Items);
            }
            var itemCount = retData.length;
            if((itemCount >= matchLimit) || !('LastEvaluatedKey' in data)) {
                onFinished(err, retData);
            } else { // more in list that we need to get
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                searchContinue(docClient, params, retData, matchLimit, onFinished);
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

/***
 * kicks off a search for entries in the manifest (case insensitive)
 * @param languages - array of language code strings or null for any language
 * @param matchLimit - limit the number of matches to return. This is not an exact limit, but has to do with responses
 *                          being returned a page at a time.  Once number of entries gets to or is above this count
 *                          then no more pages will be fetched.
 * @param user_name - user name to match or null for any user
 * @param repo_name - repo name to match or null for any repo
 * @param full_text - text to find in any field
 * @param resource - resource type to find in resource_idString or resource_typeString
 * @param returnedFields - comma delimited list of fields to return.  If null it will default to
 *                              all fields
 * @param onFinished - call back function onScan(err, entries) - where:
 *                                              err - an error message string
 *                                              entries - an array of table entry objects that match the search params.
 *                                                where each object contains returnedFields
 * @return boolean - true if search initiated, if false then search error
 */
function searchManifest(matchLimit, languages, user_name, repo_name, resource, full_text, returnedFields, onFinished) {
    try {
        var tableName = getManifestTable();
        var expressionAttributeValues = {};
        var filterExpression = "";
        var expressionAttributeNames = {  };

        if (languages) {
            var languageStr = "[" + languages.join(",") + "]"; // convert array to set string
            expressionAttributeValues[":langs"] = languageStr.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(:langs, #lc)");
            expressionAttributeNames["#lc"] = "lang_code";
        }

        if(user_name) {
            expressionAttributeValues[":user"] = user_name.toLowerCase();
            filterExpression = appendFilter(filterExpression, "#u = :user");
            expressionAttributeNames["#u"] = "user_name_lower";
        }

        if(repo_name) {
            expressionAttributeValues[":repo"] = repo_name.toLowerCase();
            filterExpression = appendFilter(filterExpression, "#r = :repo");
            expressionAttributeNames["#r"] = "repo_name_lower";
        }

        if(resource) {
            expressionAttributeValues[":res"] = resource.toLowerCase();
            filterExpression = appendFilter(filterExpression, "(#id = :res OR #t = :res)");
            expressionAttributeNames["#id"] = "resource_id";
            expressionAttributeNames["#t"] = "resource_type";
        }

        if(full_text) {
            expressionAttributeValues[":match"] = full_text.toLowerCase();
            filterExpression = appendFilter(filterExpression, "(contains(#m, :match) OR contains(#r, :match) OR contains(#u, :match))");
            expressionAttributeNames["#m"] = "manifest_lower";
            expressionAttributeNames["#r"] = "repo_name_lower";
            expressionAttributeNames["#u"] = "user_name_lower";
        }

        var params = {
            TableName: tableName,
            ExpressionAttributeNames: expressionAttributeNames,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            Limit: 3000 // number of records to check at a time
        };

        if (returnedFields) {
            params.ProjectionExpression = returnedFields;
        }

    } catch(e) {
        var err = "Could not search languages: " + e.message;
        onFinished(err, null);
        return false;
    }

    var docClient = new AWS.DynamoDB.DocumentClient();
    searchContinue(docClient, params, [], matchLimit, onFinished);
    return true;
}

/***
 * kicks off a search for popular entries in the manifest.  Will retry if too many matches or not enough matches
 * @param returnedFields - comma delimited list of fields to return.  If null it will default to
 *                              all fields
 * @param onFinished - call back function onScan(err, entries) - where:
 *                                              err - an error message string
 *                                              entries - an array of table entry objects that match the search params.
 *                                                where each object contains returnedFields
 * @param minimumViews - threshold for popular (default is 50)
 * @param matchLimit - limit the number of matches to return  (default is 1000). This is not an exact limit, but has to do
 *                          with responses being returned a page at a time.  Once number of entries gets to or is above
 *                          this count then no more pages will be fetched.
 * @return boolean - true if search initiated, if false then search error
 */
function searchManifestPopularAndRecent(returnedFields, onFinished, minimumViews, matchLimit) {
    matchLimit = matchLimit || 10000;
    minimumViews = minimumViews || 10;
    var current = new Date();
    var recentMS = current.valueOf() - 30*24*60*60*1000; // go back 30 days in milliseconds
    var recentDate = new Date(recentMS);
    var recentDateStr = recentDate.toISOString();
    searchManifestPopularSub(matchLimit,  minimumViews, recentDateStr, returnedFields, onFinished);
}

function searchManifestPopularSub(matchLimit, minimumViews, recentDate, returnedFields, onFinished) {
    try {
        var expressionAttributeValues = {};
        var filterExpression = "";
        var expressionAttributeNames = {  };

        if(minimumViews > 0) {
            expressionAttributeNames["#vw"] = "views";
            expressionAttributeValues[":views"] = minimumViews;
            filterExpression = appendFilter(filterExpression, "#vw >= :views", true);
        }

        if (recentDate) {
            expressionAttributeNames["#date"] = "last_updated";
            expressionAttributeValues[":recent"] = recentDate;
            filterExpression = appendFilter(filterExpression, "#date >= :recent", true);
        }

        var tableName = getManifestTable();
        var params = {
            TableName: tableName,
            ExpressionAttributeNames: expressionAttributeNames,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            Limit: 3000 // number of records to check at a time
        };

        if (returnedFields) {
            params.ProjectionExpression = returnedFields;
        }

    } catch(e) {
        var err = "Could not search languages: " + e.message;
        onFinished(err, null);
        return false;
    }

    var docClient = new AWS.DynamoDB.DocumentClient();
    searchContinue(docClient, params, [], matchLimit, onFinished);
    return true;
}
