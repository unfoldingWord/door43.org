
describe('Test Language Selector Autocomplete', function () {

  beforeEach(function () {
    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

    loadFixtures('i18n-language-page-fixture.html');

    // verify the fixture loaded successfully
    expect(jQuery('#jasmine-fixtures')).toBeTruthy();

    setupLanguageSelector();
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
    languageSelectorTimeout(event.target);

    $search_for.val('en');
    event.which = 'n'.charCodeAt(0);
    $search_for.trigger('keyup', event);
    languageSelectorTimeout(event.target);

    getLanguageListItems($search_for, function(languages) {
      // the first item should be 'English (en)'
      var expectedLength = 0;
      expect(languages.length).toBeGreaterThan(expectedLength);
      var expectedLc = 'en';
      expect(languages[0]['lc']).toEqual(expectedLc);

      // each language code should begin with 'en'
      var ul = jQuery('ul.ui-autocomplete')[0];
      jQuery(ul).find('li').each(function() {
        var expectedText = ' (en';
        expect(this.innerHTML.toLowerCase()).toContain(expectedText);
      });
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
    var expectedLcs = ['en', 'fr'];
    expectedTitle = 'français, langue française - French (fr)';
    expect($('.lc-filter').length).toEqual(expectedLength);
    expect(getLanguageCodesToFilter()).toEqual(expectedLcs);
    expect($('#lc-filter-fr').prop('title')).toEqual(expectedTitle);

    // Removing "en" should have no #lc-filter-en and one .lc-filter
    removeLanguageFilter(document.getElementById('lc-filter-en'));
    expectedLength = 0;
    expect($('#lc-filter-en').length).toEqual(expectedLength);
    expectedLength = 1;
    expectedLcs = ['fr'];
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
  });

  it('Test splitSearchTerms function', function() {
    var expectedTerms = ['val1', 'val2'];
    expect(splitSearchTerms('val1 val2')).toEqual(expectedTerms);
    expectedTerms = ['val1'];
    expect(splitSearchTerms('val1')).toEqual(expectedTerms);
    expectedTerms = [''];
    expect(splitSearchTerms('')).toEqual(expectedTerms);
  });
});
