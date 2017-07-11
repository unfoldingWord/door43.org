window.doAutoStartup = null; // prevent auto-startup

describe('Test Manifest Search', function () {

  var expectedErr;
  var expectedData;
  var scanMock;
  var returnedError;
  var returnedEntries;

    it('getMessageString: error should return error message', function () {
        //given
        var err = "Error";
        var entries = null;
        var search_for = "find";

        //when
        var message = getMessageString(err, entries, search_for);

        //then
        expect(message).toEqual("Search error");
    });

    it('getMessageString: no entries should return empty message', function () {
        //given
        var err = null;
        var entries = [];
        var search_for = "find";

        //when
        var message = getMessageString(err, entries, search_for);

        //then
        expect(message).toContain("No matches found");
    });

    it('getMessageString: 1 entry should return found message', function () {
        //given
        var err = null;
        var entries = [
            {
                title: "Title",
                repo_name: "repo",
                user_name: "user",
                lang_code: "lang"
            }
        ];
        var search_for = "find";

        //when
        var message = getMessageString(err, entries, search_for);

        //then
        expect(message).toContain("Matches found");
    });

    it('searchAndDisplayResults: full text search should show message', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestMocks(expectedReturn);
        var search_for = 'es';
        expectedErr = 'error';
        expectedData = null;
        var languageStr = null;
        var languageCode = null;

        //when
        searchAndDisplayResults(search_for, languageStr, languageCode);

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchAndDisplayResults: language search should show message', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestMocks(expectedReturn);
        var languageCode = 'es';
        var languageStr = 'Espanol (es)';
        var search_for = languageStr;
        expectedErr = 'error';
        expectedData = null;

        //when
        searchAndDisplayResults(search_for, languageStr, languageCode);

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchAndDisplayResults: language search with extra text should show message', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestMocks(expectedReturn);
        var languageCode = 'es';
        var languageStr = 'Espanol (es)';
        var search_for = languageStr + " extra";
        expectedErr = 'error';
        expectedData = null;

        //when
        searchAndDisplayResults(search_for, languageStr, languageCode);

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchForResources: valid language array should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupSearchManifestMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?lc=en&lc=ceb&q=Bible&user=tx-manager-test-data';
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchForResources(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchForResources: multiple language array and extra q should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupSearchManifestMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?lc=en&q=Bible&q=ceb&user=tx-manager-test-data';
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchForResources(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifest: valid language array with continue should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 2;
        setupDynamoDbMocks(expectedReturn);
        var language = ['es'];
        var matchLimit = 2;
        expectedErr = null;
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };

        //when
        var results = searchManifest(matchLimit, language, null, null, null, null, null, null, null, null, null, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifest: valid language array and user name should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var language = ['es', 'ceb'];
        var user = "dummy";
        var matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifest(matchLimit, language, user, null, null, null, null, null, null, null, null, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifest: valid repo name and resource should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var repo = "dummy_repo";
        var resource = "dummy_res";
        var returnFields = "user_name, repo_name";
        var matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifest(matchLimit, null, null, repo, resource, null, null, null, null, null, returnFields, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifest: valid repo name and resource should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var full_text = "dummy_text";
        var returnFields = "user_name, repo_name";
        var matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifest(matchLimit, null, null, null, null, null, null, null, null, full_text, returnFields, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifest: search error should return error', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var language = ['ceb'];
        var matchLimit = 2;
        expectedErr = "search Failure";
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };

        //when
        var results = searchManifest(matchLimit, language, null, null, null, null, null, null, null, null, null, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifest: undefined getTable() should return error', function () {
        //given
        getManifestTable = null;
        var expectedReturn = false;
        var expectedItemCount = 0;
        var language = null;
        var matchLimit = 20;
        expectedErr = "dummy error";
        expectedData = {};

        //when
        var results = searchManifest(matchLimit, language, null, null, null, null, null, null, null, null, null, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    //
    // helpers
    //

    function validateResults(results, expectedReturn, expectedItemCount) {
        expect(results).toEqual(expectedReturn);
        if (expectedErr) {
            expect(returnedError.length > 0).toBeTruthy();
            if (!expectedReturn) {
                expect(returnedEntries).toBeNull();
            } else {
                expect(returnedEntries.length).toEqual(expectedItemCount);
            }
        } else { // not error
            expect(returnedError).toBeNull();
            if(!returnedEntries) {
                expect(returnedEntries.length).toEqual(expectedItemCount);
            }
        }
    }

    function setupDynamoDbMocks(retVal) {
        AWS = {
            DynamoDB: {}
        };
        AWS.DynamoDB.DocumentClient = DocumentClientClassMock;

        getManifestTable = jasmine.createSpy().and.returnValue("dummy-table");
        scanMock = jasmine.createSpy().and.callFake(mockOnScan);
        function mockOnScan(params, onScan) { // mock the table scan operation
            if(onScan) {
                onScan(expectedErr, expectedData); // call onScan handler with mock data
            }
            return retVal;
        }
    }

    function setupSearchManifestMocks(retVal) {
        spyOn(window, 'updateResults').and.callFake(onFinished);
        spyOn(window, 'searchManifest').and.callFake(mockSearchManifest);
        spyOn(window, 'searchManifestPopularAndRecent').and.callFake(mockSearchManifestPopularAndRecent);
        function mockSearchManifest(matchLimit, languages, user_name, repo_name, resID, resType, title, time, manifest, full_text, returnedFields, onFinished) { // mock the table scan operation
            if(onFinished) {
                onFinished(expectedErr, expectedData); // call onScan handler with mock data
            }
            return retVal;
        }
        function mockSearchManifestPopularAndRecent(returnedFields, onFinished, minimumViews, matchLimit) { // mock the table scan operation
            if(onFinished) {
                onFinished(expectedErr, expectedData); // call onScan handler with mock data
            }
            return retVal;
        }
    }

    function DocumentClientClassMock() {
        this.scan = scanMock; // when instance created, setup mock for scan operation
    }

    function onFinished(err, entries) {
      returnedError = err;
      returnedEntries = entries;
    }
});
