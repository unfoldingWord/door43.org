
describe('Test Language Filters and the Selector Autocomplete', function () {

  beforeEach(function () {
    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

    loadFixtures('i18n-language-page-fixture.html');

    // verify the fixture loaded successfully
    expect(jQuery('#jasmine-fixtures')).toBeTruthy();

    setupLanguageSelector();
  });

  it('Test keyup in search field', function(){
    var $search_for = $('#search-for');

    $search_for.val('e');

    var event = {
      target: $search_for[0],
      which: 13
    };

    // expect not to search on enter (13)
    $search_for.trigger('keyup', event);
  });

  it('Test autocomplete in the search field. Search for "en" should work', function (done) {
    var $search_for = $('#search-for');

    $search_for.val('e');

    var event = {
      target: $search_for[0],
      which: 'e'.charCodeAt(0),
      unitTest: true
    };

    // expect not to search on fist key press
    $search_for.trigger('keyup', event);

    $search_for.val('en');
    event.which = 'n'.charCodeAt(0);
    $search_for.trigger('keyup', event);

    getLanguageListItems($search_for, function(languages) {
      // the first item should be 'English (en)'
      var expectedLength = 0;
      expect(languages.length).toBeGreaterThan(expectedLength);
      var expectedLc = 'en';
      expect(languages[0]['lc']).toEqual(expectedLc);

      // each language code should begin with 'en'
      $('ul.ui-autocomplete li').each(function() {
        var expectedText = ' (en';
        expect(this.innerHTML.toLowerCase()).toContain(expectedText);
      });
      $('ul.ui-autocomplete li:first-child').first().trigger('click');
      var expectedVal = '';
      expect($search_for.val()).toEqual(expectedVal);
      var expectedLcs = ['en'];
      expect(getLanguageCodesToFilter()).toEqual(expectedLcs);

      expect(languageSearchResults['en'] !== undefined).toBeTruthy();

      // calling getLanguageListItems a second time should not have to do an ajax call
      $search_for.autocomplete('instance').term = null;
      getLanguageListItems($search_for);
      expect($('ul.ui-autocomplete li').length).toBeGreaterThan(0);
      done();
    });
  });

  it('Adding and removing a button for "en"', function () {
    var expectedLcs = [];
    expect(getLanguageCodesToFilter()).toEqual(expectedLcs);

    addLanguageFilter({'lc':'en','ang':'English','ln':'English'});
    var expectedLength = 1;
    var expectedTitle = 'English (en)';
    expect($('#lc-filter-en').length).toEqual(expectedLength);
    expect($('#lc-filter-en').prop('title')).toEqual(expectedTitle);

    // Adding again should not make another button
    addLanguageFilter({'lc':'en','ang':'English','ln':'English'});
    expectedLength = 1;
    expect($('#lc-filter-en').length).toEqual(expectedLength);

    // Adding "fr" should result in two buttons
    addLanguageFilter({'lc':'fr','ang':'French','ln':'français, langue française'});
    expectedLength = 2;
    expectedLcs = ['en', 'fr'];
    expectedTitle = 'français, langue française - French (fr)';
    expect($('.lc-filter').length).toEqual(expectedLength);
    expect(getLanguageCodesToFilter()).toEqual(expectedLcs);
    expect($('#lc-filter-fr').prop('title')).toEqual(expectedTitle);

    // Removing "en" by clicking the filter button should have no #lc-filter-en and one .lc-filter
    $('#lc-filter-en').trigger('click');
    removeLanguageFilter(document.getElementById('lc-filter-en'));
    expectedLength = 0;
    expect($('#lc-filter-en').length).toEqual(expectedLength);
    expectedLength = 1;
    expectedLcs = ['fr'];
    expect($('.lc-filter').length).toEqual(expectedLength);
    expect(getLanguageCodesToFilter()).toEqual(expectedLcs);

    // Removing "fr" by the 'x' element should have no #lc-filter-fr and no .lc-filter
    $('#lc-filter-fr .remove-lc-x').trigger('click');
    removeLanguageFilter(document.getElementById('lc-filter-en'));
    expectedLength = 0;
    expect($('#lc-filter-fr').length).toEqual(expectedLength);
    expectedLength = 0;
    expectedLcs = [];
    expect($('.lc-filter').length).toEqual(expectedLength);
    expect(getLanguageCodesToFilter()).toEqual(expectedLcs);
  });

  it('Test functions for getting terms from the search field', function () {
    var $searchFor = $('#search-for');
    $searchFor.val('test1 test2 test3');

    var expectedTerm = 'test3';
    expect(extractLastSearchTerm()).toEqual(expectedTerm);

    removeLastSearchTerm();
    expectedTerm = 'test1 test2';
    expect($searchFor.val()).toEqual(expectedTerm);

    removeLastSearchTerm();
    expectedTerm = 'test1';
    expect($searchFor.val()).toEqual(expectedTerm);

    removeLastSearchTerm();
    expectedTerm = '';
    expect($searchFor.val()).toEqual(expectedTerm);

    removeLastSearchTerm();
    expectedTerm = '';
    expect($searchFor.val()).toEqual(expectedTerm);

    expectedTerm = '';
    expect(extractLastSearchTerm()).toEqual(expectedTerm);
  });

  it('Test splitSearchTerms function', function() {
    var expectedTerms = ['val1', 'val2'];
    expect(splitSearchTerms('val1 val2')).toEqual(expectedTerms);
    expectedTerms = ['val1'];
    expect(splitSearchTerms('val1')).toEqual(expectedTerms);
    expectedTerms = [''];
    expect(splitSearchTerms('')).toEqual(expectedTerms);
    expectedTerms = [];
    expect(splitSearchTerms(undefined)).toEqual(expectedTerms);
  });
});
