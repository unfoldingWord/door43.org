
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

function getSingleItem(params, key) {
    var value = params[key];
    if(value && (value instanceof Array)) {
        return value[0]; // if multiple, use first
    }
    return value;
}

function getArrayItem(params, key) {
    var value = params[key];
    if ((value && !(value instanceof Array))) {
        return [value]; // if single, put in array
    }
    return value;
}

function updateResults(err, entries) {
    if (!err) {
        var results = {
            popular: entries,
            recent: entries
        };
        showSearchResults(results)
    } else {
        var message = getMessageString(err, entries, "Search");
        alert(message);
    }
}

/**
 * Search for the selected search keys in url
 * @param {String} search_url - The term or phrase to search for
 */
function searchForResources(search_url) {
  var parts = search_url.split('?');
  var urlParts = parts[0].split('/');
  var remove = (urlParts[urlParts.length - 1] === '') ? 2 : 1;
  urlParts = urlParts.slice(0, urlParts.length - remove);
  baseUrl = urlParts.join('/');

  var resultFields = "repo_name, user_name, title, lang_code, manifest, last_updated, views";
  if((parts.length === 1) || ((parts.length === 2) && (parts[1] === ''))) {
      return searchManifestPopularAndRecent(resultFields,
          function (err, entries) {
              updateResults(err, entries);
          }
      );
  } else {
      var params = extractUrlParams(parts[1]);
      var matchLimit = 1000;
      var full_text = getSingleItem(params, 'q');
      var repo_name = getSingleItem(params, 'repo');
      var user_name = getSingleItem(params, 'user');
      var resID = getSingleItem(params, 'resource');
      var resType = getSingleItem(params, 'type');
      var title = getSingleItem(params, 'title');
      var time = getSingleItem(params, 'time');
      var manifest = getSingleItem(params, 'manifest');
      var languages = getArrayItem(params, 'lc');
      return searchManifest(matchLimit, languages, user_name, repo_name, resID, resType, title, time, manifest, full_text, resultFields,
          function (err, entries) {
              updateResults(err, entries);
          }
      );
  }
}

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

function updateUrlWithSearchParams(url, langSearch, fullTextSearch) {
    var searchStr = "";
    if (langSearch && langSearch.length > 0) {
        searchStr = "lc=" + langSearch.join("&lc=");
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

/**
 *
 * @param searchStr
 * @param languageCodes
 */
function searchAndDisplayResults(searchStr, languageCodes) {
    updateUrlWithSearchParams(window.location.href, languageCodes, searchStr);

    var resultFields = "repo_name, user_name, title, lang_code, manifest, last_updated, views";
    searchManifest(100, languageCodes, null, null, null, null, null, null, null, searchStr, resultFields,
        function (err, entries) {
            updateResults(err, entries);
        }
    );
}

function doAutoStartup() {
    window.setTimeout(searchForResources(window.location.href), 500);
    window.setTimeout(setupLanguageSelector(), 500);
}

$().ready(function () {
    if(doAutoStartup) { doAutoStartup(); }

  $('#search-td').on('click', function (){
    searchAndDisplayResults($('#search-for').val(), getLanguageCodesToFilter());
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
 * kicks off a search for entries in the manifest table (case insensitive). Search parameters are ANDed together to
 *              refine search.
 * @param languages - array of language code strings or null for any language
 * @param matchLimit - limit the number of matches to return. This is not an exact limit, but has to do with responses
 *                          being returned a page at a time.  Once number of entries gets to or is above this count
 *                          then no more pages will be fetched.
 * @param user_name - text to find in user_name (if not null)
 * @param repo_name - text to find in repo_name (if not null)
 * @param resID - text to match in resource_id (if not null)
 * @param resType - text to match in resource_type (if not null)
 * @param title - text to find in title (if not null)
 * @param time - text to find in time (if not null)
 * @param manifest - text to find in manifest (if not null)
 * @param full_text - text to find in any field (if not null)
 * @param returnedFields - comma delimited list of fields to return.  If null it will default to
 *                              all fields
 * @param onFinished - call back function onScan(err, entries) - where:
 *                                              err - an error message string
 *                                              entries - an array of table entry objects that match the search params.
 *                                                where each object contains returnedFields
 * @return boolean - true if search initiated, if false then search error
 */
function searchManifest(matchLimit, languages, user_name, repo_name, resID, resType, title, time, manifest, full_text, returnedFields, onFinished) {
    try {
        var tableName = getManifestTable();
        var expressionAttributeValues = {};
        var filterExpression = "";
        var expressionAttributeNames = {};
        var projectionExpression = null;

        if (languages) {
            var languageStr = "[" + languages.join(",") + "]"; // convert array to set string
            expressionAttributeValues[":langs"] = languageStr.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(:langs, #lc)");
            expressionAttributeNames["#lc"] = "lang_code";
        }

        if(user_name) {
            expressionAttributeValues[":user"] = user_name.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#u, :user)");
            expressionAttributeNames["#u"] = "user_name_lower";
        }

        if(repo_name) {
            expressionAttributeValues[":repo"] = repo_name.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#r, :repo)");
            expressionAttributeNames["#r"] = "repo_name_lower";
        }

        if(title) {
            expressionAttributeValues[":title"] = title;
            filterExpression = appendFilter(filterExpression, "contains(#title, :title)");
            expressionAttributeNames["#title"] = "title";
        }

        if(time) {
            expressionAttributeValues[":time"] = time;
            filterExpression = appendFilter(filterExpression, "contains(#time, :time)");
            expressionAttributeNames["#time"] = "last_updated";
        }

        if(manifest) {
            expressionAttributeValues[":manifest"] = manifest.toLowerCase();
            filterExpression = appendFilter(filterExpression, "contains(#m, :manifest)");
            expressionAttributeNames["#m"] = "manifest_lower";
        }

        if(resID) {
            expressionAttributeValues[":resID"] = resID.toLowerCase();
            filterExpression = appendFilter(filterExpression, "#id = :resID");
            expressionAttributeNames["#id"] = "resource_id";
        }

        if(resType) {
            expressionAttributeValues[":type"] = resType.toLowerCase();
            filterExpression = appendFilter(filterExpression, "#t = :type");
            expressionAttributeNames["#t"] = "resource_type";
        }

        if(full_text) {
            expressionAttributeValues[":match"] = full_text.toLowerCase();
            filterExpression = appendFilter(filterExpression, "(contains(#m, :match) OR contains(#r, :match) OR contains(#u, :match))");
            expressionAttributeNames["#m"] = "manifest_lower";
            expressionAttributeNames["#r"] = "repo_name_lower";
            expressionAttributeNames["#u"] = "user_name_lower";
        }

        if (returnedFields) {
            returnedFields = substituteReserved(returnedFields, 'views', expressionAttributeNames);
            projectionExpression = returnedFields;
        }

        var params = {
            TableName: tableName,
            ExpressionAttributeNames: expressionAttributeNames,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            Limit: 3000 // number of records to check at a time
        };

        if (projectionExpression) {
            params.ProjectionExpression = projectionExpression;
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
 * kicks off a search for popular or recent entries in the manifest. Note that this is an OR search to minimize DB calls.
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
    return searchManifestPopularSub(matchLimit,  minimumViews, recentDateStr, returnedFields, onFinished);
}

function searchManifestPopularSub(matchLimit, minimumViews, recentDate, returnedFields, onFinished) {
    try {
        var expressionAttributeValues = {};
        var filterExpression = "";
        var expressionAttributeNames = {};
        var projectionExpression = null;

        if(minimumViews > 0) {
            expressionAttributeNames["#views"] = "views";
            expressionAttributeValues[":views"] = minimumViews;
            filterExpression = appendFilter(filterExpression, "#views >= :views", true);
        }

        if (recentDate) {
            expressionAttributeNames["#date"] = "last_updated";
            expressionAttributeValues[":recent"] = recentDate;
            filterExpression = appendFilter(filterExpression, "#date >= :recent", true);
        }

        if (returnedFields) {
            returnedFields = substituteReserved(returnedFields, 'views', expressionAttributeNames);
            projectionExpression = returnedFields;
        }

        var tableName = getManifestTable();
        var params = {
            TableName: tableName,
            ExpressionAttributeNames: expressionAttributeNames,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            Limit: 3000 // number of records to check at a time
        };

        if (projectionExpression) {
            params.ProjectionExpression = projectionExpression;
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

function substituteReserved(returnedFields, key, expressionAttributeNames) {
    if (returnedFields.indexOf(key)) {
        var sub = "#" + key;
        returnedFields = returnedFields.replace(key, sub);
        expressionAttributeNames[sub] = key;
        return returnedFields;
    }
}
