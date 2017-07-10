
describe('Test Language Selector Autocomplete', function () {

  beforeEach(function () {

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

    loadFixtures('i18n-language-page-fixture.html');

    // verify the fixture loaded successfully
    expect(jQuery('#jasmine-fixtures')).toBeTruthy();

    setupLanguageSelector();
  });

  it('search for "en" should work', function (done) {

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
    expect($search_for.attr('data-last-search')).toEqual('e');

    $search_for.val('en');
    event.which = 'n'.charCodeAt(0);
    $search_for.trigger('keyup', event);
    languageSelectorTimeout(event.target);
    expect($search_for.attr('data-last-search')).toEqual('en');

    getLanguageListItems($search_for, function(languages) {

      // the first item should be 'English (en)'
      expect(languages.length).toBeGreaterThan(0);
      expect(languages[0]['lc']).toEqual('en');

      // each language code should begin with 'en'
      var ul = jQuery('ul.ui-autocomplete')[0];
      jQuery(ul).find('li').each(function() {

        expect(this.innerHTML.toLowerCase()).toContain(' (en');
      });
      done();
    });
  });

  it('Adding and removing a button for "en"', function () {
    expect(getLanguageCodesToFilter()).toEqual([]);

    addLanguageFilter({'lc':'en','ang':'English','ln':'English'});
    expect($('#lc-filter-en').length).toEqual(1);
    expect($('#lc-filter-en').prop('title')).toEqual('English (en)');

    // Adding again should not make another button
    addLanguageFilter({'lc':'en','ang':'English','ln':'English'});
    expect($('#lc-filter-en').length).toEqual(1);

    // Adding "fr" should result in two buttons
    addLanguageFilter({'lc':'fr','ang':'French','ln':'français, langue française'});
    expect($('.lc-filter').length).toEqual(2);
    expect(getLanguageCodesToFilter()).toEqual(['en', 'fr']);
    expect($('#lc-filter-fr').prop('title')).toEqual('français, langue française - French (fr)');

    // Removing "en" should have no #lc-filter-en and one .lc-filter
    removeLanguageFilter(document.getElementById('lc-filter-en'));
    expect($('#lc-filter-en').length).toEqual(0);
    expect($('.lc-filter').length).toEqual(1);
    expect(getLanguageCodesToFilter()).toEqual(['fr']);
  });

  it('Test functions for getting terms from the search field', function () {
    var $searchFor = $('#search-for');
    $searchFor.val('test1 test2 test3');

    expect(extractLastSearchTerm()).toEqual('test3');

    removeLastSearchTerm();
    expect($searchFor.val()).toEqual('test1 test2');

    removeLastSearchTerm();
    expect($searchFor.val()).toEqual('test1');

    removeLastSearchTerm();
    expect($searchFor.val()).toEqual('');

    removeLastSearchTerm();
    expect($searchFor.val()).toEqual('');
  });

  it('Test splitSearchTerms function', function() {
    expect(splitSearchTerms('val1 val2')).toEqual(['val1', 'val2']);
    expect(splitSearchTerms('val1')).toEqual(['val1']);
    expect(splitSearchTerms('')).toEqual(['']);
  });
});
