describe('Test Language Search JavaScript', function () {

  var err;
  var entries;
  var scan;
  var returnedError;
  var returnedEntries;

    it('invalid language should return error', function () {
        //given
        getTable = jasmine.createSpy().and.returnValue("dummy-table");
        scan = jasmine.createSpy().and.returnValue(true);
        AWS = {
            DynamoDB: {}
        };
        AWS.DynamoDB.DocumentClient = jasmine.createSpy().and.returnValue(scan);
        var pageUrl = "https://test-dummy.com";
        var language = null;
        var matchLimit = 20;
        err = null;
        data = [];

        //when
        var results = searchLanguages(pageUrl, language, matchLimit, onFinished);

        //then
        expect(results).toEqual(false);
        expect(returnedError.length > 0).toBeTruthy();
        expect(returnedEntries).toBeNull();
    });

    it('undefined getTable() should return error', function () {
        //given
        getTable = null;
        var pageUrl = "https://test-dummy.com";
        var language = null;
        var matchLimit = 20;
        err = null;
        data = [];

        //when
        var results = searchLanguages(pageUrl, language, matchLimit, onFinished);

        //then
        expect(results).toEqual(false);
        expect(returnedError.length > 0).toBeTruthy();
        expect(returnedEntries).toBeNull();
    });

    //
  // helpers
  //

  function onFinished(err, entries) {
      returnedError = err;
      returnedEntries = entries;
  }
});
