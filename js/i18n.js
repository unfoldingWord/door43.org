
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

/**
 * Search for the selected term or phrase
 * @param {String} search_term The term or phrase to search for
 */
function searchForResources(search_term) {

  var url = '/temp-data.json';

  $.ajax({
    url: url,
    dataType: 'json',
    data: {
      q: search_term,
      format: 'json'
    }
  })
    .done(function (response) {
      showSearchResults(response);
    })
    .fail(function (data, status, error) {
      console.log(error);
      console.log(data);
    });
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
  var popular = _.sortBy(results['popular'], 'num_views').reverse();
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
 * Appends item to the specified div
 * @param {Object} item
 * @param {Object} $div A jquery object
 * @param {String} template The HTML template for the new item
 */
function showThisItem(item, $div, template) {

  var $template = $(template);
  var today = moment.utc().startOf('day');

  $template.find('.title-span').html(item['resource_name']);
  $template.find('.author-div').html(simpleFormat(l10n['author'], [item['author']]));
  $template.find('.language-title-span').html(l10n['language']);
  $template.find('.language-code-div').html(simpleFormat(l10n['language_with_code'], [item['lang_name'], item['lang_code']]));
  $template.find('.views-span').html(item['num_views']);
  $template.find('.updated-span').html(getDateDiff(item['last_updated'], today));

  // TODO: set anchor href to the correct value
  $template.find('a').attr('href', 'put_the_url_here');

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

$().ready(function () {
  window.setTimeout(searchForResources(''), 300);

  $('#search-td').on('click', function (){
    var search_for = document.getElementById('search-for').value;

    // TODO: put actual search code here.
    alert('Search for "' + search_for + '".');
  });

  $('#browse-td').on('click', function (){

    // TODO: put actual browse code here.
    alert('Browse code goes here.');
  });
});
