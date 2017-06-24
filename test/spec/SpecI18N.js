
describe('Test I18N JavaScript', function () {

  var test_data;

  beforeEach(function () {

    test_data = {
      "popular": [
        {
          "lang_name": "English",
          "lang_code": "en",
          "resource_name": "Open Bible Stories",
          "author": "john_smith",
          "last_updated": "2017-06-22 11:02:21",
          "num_views": 123
        },
        {
          "lang_name": "English",
          "lang_code": "en",
          "resource_name": "Unlocked Literal Bible",
          "author": "john_smith",
          "last_updated": "2017-03-22 11:02:21",
          "num_views": 0
        },
        {
          "lang_name": "French",
          "lang_code": "fr",
          "resource_name": "Open Bible Stories",
          "author": "john_smith",
          "last_updated": "2017-06-16 11:02:21",
          "num_views": 10
        },
        {
          "lang_name": "Spanish",
          "lang_code": "es",
          "resource_name": "Open Bible Stories",
          "author": "john_smith",
          "last_updated": "2017-05-22 11:02:21",
          "num_views": 97
        },
        {
          "lang_name": "Hindi",
          "lang_code": "hi",
          "resource_name": "Open Bible Stories",
          "author": "john_smith",
          "last_updated": "2017-04-22 11:02:21",
          "num_views": 2
        }
      ],
      "recent": [
        {
          "lang_name": "English",
          "lang_code": "en",
          "resource_name": "Open Bible Stories",
          "author": "john_smith",
          "last_updated": moment().format('YYYY-MM-DD'),
          "num_views": 123
        },
        {
          "lang_name": "French",
          "lang_code": "fr",
          "resource_name": "Open Bible Stories",
          "author": "john_smith",
          "last_updated": moment().subtract(2, 'days').format('YYYY-MM-DD'),
          "num_views": 10
        },
        {
          "lang_name": "Spanish",
          "lang_code": "es",
          "resource_name": "Open Bible Stories",
          "author": "john_smith",
          "last_updated": moment().subtract(12, 'days').format('YYYY-MM-DD'),
          "num_views": 97
        },
        {
          "lang_name": "Hindi",
          "lang_code": "hi",
          "resource_name": "Open Bible Stories",
          "author": "john_smith",
          "last_updated": moment().subtract(21, 'days').format('YYYY-MM-DD'),
          "num_views": 2
        },
        {
          "lang_name": "English",
          "lang_code": "en",
          "resource_name": "Unlocked Literal Bible",
          "author": "john_smith",
          "last_updated": moment().subtract(40, 'days').format('YYYY-MM-DD'),
          "num_views": 0
        }
      ]
    };

    var templates = '\
<script type="html/template" id="listing-template">\
<div class="listing-container">\
  <a href="">\
    <table>\
      <tr>\
        <td class="column-1"><i class="fa fa-star-o"></i></td>\
        <td class="column-2">\
          <h3><span class="title-span"></span></h3>\
          <div class="updated-views-div"><span class="updated-span"></span>&emsp;<i class="fa fa-eye"></i> <span class="views-span"></span></div>\
          <div class="author-div"></div>\
          <div class="pinned-to-bottom">\
            <h3><span class="language-title-span"></span></h3>\
            <div class="language-code-div"></div>\
          </div>\
        </td>\
      </tr>\
    </table>\
  </a>\
</div>\
</script>\
<script type="html/template" id="more-template">\
<div class="more-container">\
  <span><a href="" class="bold">View more...</a></span>\
</div>\
</script>\
<div id="popular-div" class="search-results-category">\
  <div class="search-results-header">Popular</div>\
  <div class="search-listing"></div>\
</div>\
<div class="clear"></div>\
<div id="recent-div" class="search-results-category">\
  <div class="search-results-header">Recently Updated</div>\
  <div class="search-listing"></div>\
</div>\
<div class="clear"></div>\
<script type="text/javascript">\
  var locale = {"date":{"day_names":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"abbr_day_names":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],"month_names":["January","February","March","April","May","June","July","August","September","October","November","December"],"abbr_month_names":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"formats":{"default":"%Y-%m-%d","long":"%B %d, %Y","short":"%b %d"}}};\
  var l10n = {"day":["days","day","days","days"],"week":["weeks","week","weeks","weeks"],"month":["months","month","months","months"],"updated_today":"Updated today","updated_days":"Updated {0} {1} ago","updated_weeks":"Updated {0} {1} ago","updated_months":"Updated {0} {1} ago","author":"Author: {0}","language":"Language","language_with_code":"{0} &mdash; {1}"};\
</script>';

    // add the templates to the body
    var $body = $(document.body);
    $body.html('');
    $body.append(templates);
  });

  it('simpleFormat should work', function () {

    var found = simpleFormat('one {0} two {1}', ['1', '2'])
    expect(found).toEqual('one 1 two 2');

    found = simpleFormat('one {0} two {1} two {1} one {0}', ['1', '2'])
    expect(found).toEqual('one 1 two 2 two 2 one 1');
  });

  it('showSearchResults() should work', function () {

    showSearchResults(test_data);
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(5);

    var $more = $body.find('#popular-div .search-listing .more-container');
    expect($more.length).toEqual(1);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(5);

    $more = $body.find('#recent-div .search-listing .more-container');
    expect($more.length).toEqual(1);
  });

  it('showSearchResults() with missing popular should not error', function () {

    delete test_data['popular'];

    showSearchResults(test_data);
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(0);

    var $more = $body.find('#popular-div .search-listing .more-container');
    expect($more.length).toEqual(0);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(0);

    $more = $body.find('#recent-div .search-listing .more-container');
    expect($more.length).toEqual(0);
  });

  it('showSearchResults() with missing recent should not error', function () {

    delete test_data['recent'];

    showSearchResults(test_data);
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(0);

    var $more = $body.find('#popular-div .search-listing .more-container');
    expect($more.length).toEqual(0);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(0);

    $more = $body.find('#recent-div .search-listing .more-container');
    expect($more.length).toEqual(0);
  });
});
