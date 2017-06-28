
describe('Test Language Selector Autocomplete', function () {

  beforeEach(function () {

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

    loadFixtures('i18n-language-page-fixture.html');

    // verify the fixture loaded successfully
    expect(jQuery('#jasmine-fixtures')).toBeTruthy();

    setupLanguageSelector();
  });

  it('search for "en" should work', function (done) {

    var $search_for = $('body').find('#search-for');

    $search_for.val('e');

    var event = {
      target: $search_for[0],
      which: 'e'.charCodeAt(0),
      unitTest: true
    };

    // expect not to search on fist key press
    $search_for.trigger('keyup', event);
    languageSelectorTimeout(event.target);
    expect($search_for.attr('data-last-search')).toBeUndefined();

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

});
