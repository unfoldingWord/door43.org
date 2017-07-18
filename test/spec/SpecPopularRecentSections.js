
describe('Test I18N JavaScript', function () {

  beforeEach(function () {

    results = [
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
      },
      {
        "lang_name": "English",
        "lang_code": "en",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(41, 'days').format('YYYY-MM-DD'),
        "num_views": 123
      },
      {
        "lang_name": "French",
        "lang_code": "fr",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(52, 'days').format('YYYY-MM-DD'),
        "num_views": 10
      },
      {
        "lang_name": "Spanish",
        "lang_code": "es",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(62, 'days').format('YYYY-MM-DD'),
        "num_views": 97
      },
      {
        "lang_name": "Hindi",
        "lang_code": "hi",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(71, 'days').format('YYYY-MM-DD'),
        "num_views": 2
      },
      {
        "lang_name": "English",
        "lang_code": "en",
        "resource_name": "Unlocked Literal Bible",
        "author": "john_smith",
        "last_updated": moment().subtract(80, 'days').format('YYYY-MM-DD'),
        "num_views": 0
      },
      {
        "lang_name": "English",
        "lang_code": "en",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(85, 'days').format('YYYY-MM-DD'),
        "num_views": 123
      },
      {
        "lang_name": "French",
        "lang_code": "fr",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(92, 'days').format('YYYY-MM-DD'),
        "num_views": 10
      },
      {
        "lang_name": "Spanish",
        "lang_code": "es",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(95, 'days').format('YYYY-MM-DD'),
        "num_views": 97
      },
      {
        "lang_name": "Hindi",
        "lang_code": "hi",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(101, 'days').format('YYYY-MM-DD'),
        "num_views": 2
      },
      {
        "lang_name": "English",
        "lang_code": "en",
        "resource_name": "Unlocked Literal Bible",
        "author": "john_smith",
        "last_updated": moment().subtract(140, 'days').format('YYYY-MM-DD'),
        "num_views": 0
      },
      {
        "lang_name": "English",
        "lang_code": "en",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(145, 'days').format('YYYY-MM-DD'),
        "num_views": 123
      },
      {
        "lang_name": "French",
        "lang_code": "fr",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(152, 'days').format('YYYY-MM-DD'),
        "num_views": 10
      },
      {
        "lang_name": "Spanish",
        "lang_code": "es",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(162, 'days').format('YYYY-MM-DD'),
        "num_views": 97
      },
      {
        "lang_name": "Hindi",
        "lang_code": "hi",
        "resource_name": "Open Bible Stories",
        "author": "john_smith",
        "last_updated": moment().subtract(171, 'days').format('YYYY-MM-DD'),
        "num_views": 2
      },
      {
        "lang_name": "English",
        "lang_code": "en",
        "resource_name": "Unlocked Literal Bible",
        "author": "john_smith",
        "last_updated": moment().subtract(180, 'days').format('YYYY-MM-DD'),
        "num_views": 0
      }
    ];
    results = _.sortBy(results,'last_updated');

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

  it('showSearchResults() should show 5 items in both the popular and recent sections and the more-container', function () {
    showSearchResults(); // show first 5
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

  it('With results sliced to 4, showSearchResults() should not show the more-container', function () {
    results = results.slice(0,4); // make list only 4 items long
    showSearchResults(); // show all 4
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(4);

    var $more = $body.find('#popular-div .search-listing .more-container');
    expect($more.length).toEqual(0);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(4);

    $more = $body.find('#recent-div .search-listing .more-container');
    expect($more.length).toEqual(0);
  });

  it('showSearchResults(SECTION_TYPE_POPULAR) show show 8 more items in the popular section', function () {
    showSearchResults(); // show first 5
    showSearchResults(SECTION_TYPE_POPULAR); // show next 8
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(13);

    var $more = $body.find('#popular-div .search-listing .more-container');
    expect($more.length).toEqual(1);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(5);

    $more = $body.find('#recent-div .search-listing .more-container');
    expect($more.length).toEqual(1);
  });

  it('showSearchResults(SECTION_TYPE_RECENT) twice should not show the more-container', function () {
    showSearchResults(); // show first 5
    showSearchResults(SECTION_TYPE_RECENT); // show next 8
    showSearchResults(SECTION_TYPE_RECENT); // show next 13, but only 20 exist so shows 7 more
    var $body = $(document.body);

    var $popular_listings = $body.find('#popular-div .search-listing .listing-container');
    expect($popular_listings.length).toEqual(5);

    var $more = $body.find('#popular-div .search-listing .more-container');
    expect($more.length).toEqual(1);

    var $recent_listings = $body.find('#recent-div .search-listing .listing-container');
    expect($recent_listings.length).toEqual(20);

    $more = $body.find('#recent-div .search-listing .more-container');
    expect($more.length).toEqual(0);
  });

  it('Test fibonacci() function', function () {
    expect(fibonacci(-1)).toEqual(1);
    expect(fibonacci(0)).toEqual(1);
    expect(fibonacci(1)).toEqual(1);
    expect(fibonacci(2)).toEqual(1);
    expect(fibonacci(3)).toEqual(2);
    expect(fibonacci(4)).toEqual(3);
    expect(fibonacci(5)).toEqual(5);
    expect(fibonacci(6)).toEqual(8);
    expect(fibonacci(7)).toEqual(13);
    expect(fibonacci(8)).toEqual(21);
  });
});
