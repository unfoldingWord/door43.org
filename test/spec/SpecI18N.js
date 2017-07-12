
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

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

    loadFixtures('i18n-language-page-fixture.html');

    // verify the fixture loaded successfully
    expect(jQuery('#jasmine-fixtures')).toBeTruthy();
  });

  it('simpleFormat should work', function () {

    var found = simpleFormat('one {0} two {1}', ['1', '2']);
    expect(found).toEqual('one 1 two 2');

    found = simpleFormat('one {0} two {1} two {1} one {0}', ['1', '2']);
    expect(found).toEqual('one 1 two 2 two 2 one 1');
  });

  it('showSearchResults() should work', function () {

    showSearchResults(test_data);
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(5);

    // var $more = $body.find('#popular-div .search-listing .more-container');
    // expect($more.length).toEqual(1);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(5);

    // $more = $body.find('#recent-div .search-listing .more-container');
    // expect($more.length).toEqual(1);
  });

  it('showSearchResults() with missing popular should not error', function () {

    delete test_data['popular'];

    showSearchResults(test_data);
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(0);

    // var $more = $body.find('#popular-div .search-listing .more-container');
    // expect($more.length).toEqual(0);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(0);

    // $more = $body.find('#recent-div .search-listing .more-container');
    // expect($more.length).toEqual(0);
  });

  it('showSearchResults() with missing recent should not error', function () {

    delete test_data['recent'];

    showSearchResults(test_data);
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(0);

    // var $more = $body.find('#popular-div .search-listing .more-container');
    // expect($more.length).toEqual(0);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(0);

    // $more = $body.find('#recent-div .search-listing .more-container');
    // expect($more.length).toEqual(0);
  });
});
