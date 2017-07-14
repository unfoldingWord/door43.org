window.doAutoStartup = null; // prevent auto-startup

describe('Test Manifest Search', function () {

  var expectedErr;
  var expectedData;
  var scanMock;
  var returnedError;
  var returnedEntries;

    it('updateResults: err should call alert', function () {
        //given
        var err = "Error";
        var entries = [];
        setupMocksForUpdateResults();

        //when
        updateResults(err, entries);

        //then
        expect(window.alert).toHaveBeenCalled();
        expect(window.showSearchResults).not.toHaveBeenCalled();
    });

    it('updateResults: no err should call showSearchResults', function () {
        //given
        var err = null;
        var entries = [];
        setupMocksForUpdateResults();

        //when
        updateResults(err, entries);

        //then
        expect(window.alert).not.toHaveBeenCalled();
        expect(window.showSearchResults).toHaveBeenCalled();
    });

    it('updateUrlWithSearchParams: valid language language array two item search', function () {
        //given
        var fullTextSearch = "dummy_text";
        var langSearch = ['es', 'ceb'];
        var baseUrl = 'http://127.0.0.1:4000/en';
        var expectedBaseUrl = baseUrl;
        var expectedParams = {
            q: fullTextSearch,
            lc: langSearch
        };
        setupUpdateUrlMock();

        //when
        var url = updateUrlWithSearchParams(baseUrl, langSearch, fullTextSearch);

        //then
        validateSearchParameters(url, expectedBaseUrl, expectedParams);
    });

    it('updateUrlWithSearchParams: valid language language array single item search', function () {
        //given
        var fullTextSearch = "dummy_text";
        var langSearch = ['es'];
        var baseUrl = 'http://127.0.0.1:4000/en';
        var expectedBaseUrl = baseUrl;
        var expectedParams = {
            q: fullTextSearch,
            lc: langSearch
        };
        setupUpdateUrlMock();

        //when
        var url = updateUrlWithSearchParams(baseUrl, langSearch, fullTextSearch);

        //then
        validateSearchParameters(url, expectedBaseUrl, expectedParams);
    });

    it('updateUrlWithSearchParams: valid language language array three item search', function () {
        //given
        var fullTextSearch = "dummy_text";
        var langSearch = ['es', 'ceb', 'ne'];
        var baseUrl = 'http://127.0.0.1:4000/en';
        var expectedBaseUrl = baseUrl;
        var expectedParams = {
            q: fullTextSearch,
            lc: langSearch
        };
        setupUpdateUrlMock();

        //when
        var url = updateUrlWithSearchParams(baseUrl, langSearch, fullTextSearch);

        //then
        validateSearchParameters(url, expectedBaseUrl, expectedParams);
    });

    it('updateUrlWithSearchParams: valid language language array 0 item search', function () {
        //given
        var fullTextSearch = "dummy_text";
        var langSearch = [];
        var baseUrl = 'http://127.0.0.1:4000/en';
        var expectedBaseUrl = baseUrl;
        var expectedParams = {
            q: fullTextSearch
        };
        setupUpdateUrlMock();

        //when
        var url = updateUrlWithSearchParams(baseUrl, langSearch, fullTextSearch);

        //then
        validateSearchParameters(url, expectedBaseUrl, expectedParams);
    });

    it('updateUrlWithSearchParams: valid language language array null item search', function () {
        //given
        var fullTextSearch = "dummy_text";
        var langSearch = null;
        var baseUrl = 'http://127.0.0.1:4000/en';
        var expectedBaseUrl = baseUrl;
        var expectedParams = {
            q: fullTextSearch
        };
        setupUpdateUrlMock();

        //when
        var url = updateUrlWithSearchParams(baseUrl, langSearch, fullTextSearch);

        //then
        validateSearchParameters(url, expectedBaseUrl, expectedParams);
    });

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

    it('searchProject: full text search without languages should call updateResults', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestTableMocks(expectedReturn);
        var search_for = 'es';
        expectedErr = 'error';
        expectedData = null;
        var languageCodes = null;

        //when
        updateUrlWithSearchParams(undefined, languageCodes, search_for);
        searchProjects();

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchProjects: language search should call updateResults', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestTableMocks(expectedReturn);
        var languageCodes = ['es'];
        var search_for = "";
        expectedErr = 'error';
        expectedData = null;

        //when
        updateUrlWithSearchParams(undefined, languageCodes, search_for);
        searchProjects();

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchProjects: language and text search should call updateResults', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestTableMocks(expectedReturn);
        var languageCodes = ['es'];
        var search_for = "text";
        expectedErr = 'error';
        expectedData = null;

        //when
        updateUrlWithSearchParams(undefined, languageCodes, search_for);
        searchProjects();

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchProjects: language search with null extra text should call updateResults', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestTableMocks(expectedReturn);
        var languageCodes = ['es'];
        var search_for = null;
        expectedErr = 'error';
        expectedData = null;

        //when
        updateUrlWithSearchParams(undefined, languageCodes, search_for);
        searchProjects();

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchProjects: multi language search with extra text should call updateResults', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestTableMocks(expectedReturn);
        var languageCodes = ['en','ceb'];
        var search_for = 'text';
        expectedErr = 'error';
        expectedData = null;

        //when
        updateUrlWithSearchParams(undefined, languageCodes, search_for);
        searchProjects();

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchProjects: empty language search with extra text should call updateResults', function () {
        //given
        var expectedReturn = true;
        setupSearchManifestTableMocks(expectedReturn);
        var languageCodes = [];
        var search_for = 'text';
        expectedErr = 'error';
        expectedData = null;

        //when
        updateUrlWithSearchParams(undefined, languageCodes, search_for);
        searchProjects();

        //then
        expect(window.updateResults).toHaveBeenCalled();
    });

    it('searchProjects: valid language array should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupSearchManifestTableMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?lc=en&lc=ceb&q=Bible&user=tx-manager-test-data';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        expectedErr = null;
        expectedData = [];

        //when
        var results = searchProjects(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        expect(window.searchManifestTable).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl);
    });

    it('searchProjects: multiple language array and extra q should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupSearchManifestTableMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?lc=en&q=Bible&q=ceb&user=tx-manager-test-data';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        expectedErr = null;
        expectedData = [];

        //when
        var results = searchProjects(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        expect(window.searchManifestTable).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl);
    });

    it('searchProjects: valid language array with continue should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 2;
        setupSearchManifestTableMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?lc=es';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        expectedErr = null;
        expectedData = [ { 'object': "" }];

        //when
        var results = searchProjects(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        expect(window.searchManifestTable).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl);
    });

    it('searchProjects: valid language array and user name should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupSearchManifestTableMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?lc=es&lc=ceb&user=dummy';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        expectedErr = null;
        expectedData = [];

        //when
        var results = searchProjects(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        expect(window.searchManifestTable).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl);
    });

    it('searchProjects: valid repo name and resource should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupSearchManifestTableMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?repo=es&lc=dummy_repo&resource=dummy_res';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        expectedErr = null;
        expectedData = [];

        //when
        var results = searchProjects(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        expect(window.searchManifestTable).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl);
    });

    it('searchProjects: empty search parameters should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupSearchManifestTableMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        expectedErr = null;
        expectedData = [];

        //when
        var results = searchProjects(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        expect(window.searchManifestTable).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl);
    });

    it('searchProjects: no search parameters should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupSearchManifestTableMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        expectedErr = null;
        expectedData = [];

        //when
        var results = searchProjects(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        expect(window.searchManifestTable).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl);
    });

    it('searchProjects: search error should return error', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 1;
        setupSearchManifestTableMocks(expectedReturn);
        var search_url = 'http://127.0.0.1:4000/en/?lc=ceb';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        expectedErr = "search Failure";
        expectedData = [ { 'object': "" }];

        //when
        var results = searchProjects(search_url);

        //then
        expect(window.updateResults).toHaveBeenCalled();
        expect(window.searchManifestTable).toHaveBeenCalled();
        validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl);
    });

    it('searchManifestTable: valid language array should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = SearchCriteria();
        criteria.languages = ['es'];
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
   });

    it('searchManifestTable: valid language array with continue should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 2;
        setupDynamoDbMocks(expectedReturn);
        var criteria = SearchCriteria();
        criteria.languages =  ['es'];
        criteria.matchLimit = 2;
        expectedErr = null;
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: valid language array and user name should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = SearchCriteria();
        criteria.languages = ['es', 'ceb'];
        criteria.user_name = "dummy";
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: valid repo name and resource should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = SearchCriteria();
        criteria.repo_name = "dummy_repo";
        criteria.resID = "dummy_res";
        criteria.returnFields = "user_name, repo_name";
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: valid repo name and resource should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = SearchCriteria();
        criteria.full_text = "dummy_text";
        criteria.returnFields = "user_name, repo_name";
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: misc. parameters should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = SearchCriteria();
        criteria.resType = "dummy_res";
        criteria.title = "dummy_title";
        criteria.time = "dummy_time";
        criteria.manifest = "dummy_manifest";
        criteria.returnFields = "user_name, repo_name, views";
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: search error should return error', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = SearchCriteria();
        criteria.languages =  ['ceb'];
        criteria.matchLimit = 2;
        expectedErr = "search Failure";
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: undefined getTable() should return error', function () {
        //given
        getManifestTable = null;
        var expectedReturn = false;
        var expectedItemCount = 0;
        var criteria = SearchCriteria();
        criteria.matchLimit = 20;
        expectedErr = "dummy error";
        expectedData = {};

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = SearchCriteria();
        criteria.returnFields = "user_name, repo_name";
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: undefined getTable() should return error', function () {
        //given
        getManifestTable = null;
        var expectedReturn = false;
        var expectedItemCount = 0;
        var criteria = SearchCriteria();
        criteria.returnFields = "user_name, repo_name";
        expectedErr = "dummy error";
        expectedData = {};

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    //
    // helpers
    //

    function validateResults(results, expectedReturn, expectedItemCount, expectedBaseUrl) {
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
        if(expectedBaseUrl) {
            expect(baseUrl).toEqual(expectedBaseUrl);
        }
    }

    function validateSearchParameters(url, expectedBaseUrl, expectedParams) {
        var parts = url.split('?');
        expect(parts[0]).toEqual(expectedBaseUrl);
        var params = extractUrlParams(parts[1]);
        expect(params.length).toEqual(expectedParams.length);
        _.each(params, function (param, key) {
            if (param instanceof Array) {
                expect(param.length).toEqual(expectedParams[key].length);
                _.each(param, function (item) {
                    expect(_.contains(expectedParams[key], item)).toBeTruthy();
                })
            } else {
                var expectedParam = expectedParams[key];
                if (expectedParam instanceof Array) {
                    expect(_.contains(expectedParam, param)).toBeTruthy();
                    expect(expectedParam.length).toEqual(1);
                } else {
                    expect(param).toEqual(expectedParam);
                }
            }
        });
    }

    function setupUpdateUrlMock() {
        spyOn(window, 'updateUrl').and.returnValue("mock_updateUrl");
    }

    function setupDynamoDbMocks(retVal) {
        var AWS = {
            DynamoDB: {}
        };
        AWS.DynamoDB.DocumentClient = DocumentClientClassMock;

        spyOn(window, 'updateResults').and.callThrough();
        spyOn(window, 'searchManifestTable').and.callThrough();
        getManifestTable = jasmine.createSpy().and.returnValue("dummy-table");
        scanMock = jasmine.createSpy().and.callFake(mockOnScan);
        function mockOnScan(params, onScan) { // mock the table scan operation
            if(onScan) {
                onScan(expectedErr, expectedData); // call onScan handler with mock data
            }
            return retVal;
        }
    }

    function setupSearchManifestTableMocks(retVal) {
        setupUpdateUrlMock();
        spyOn(window, 'updateResults').and.callFake(callback);
        spyOn(window, 'searchManifestTable').and.callFake(mockSearchManifestTest);
        function mockSearchManifestTest(matchLimit, languages, user_name, repo_name, resID, resType, title, time, manifest, full_text, returnedFields, callback) { // mock the table scan operation
            if(callback) {
                callback(expectedErr, expectedData); // call onScan handler with mock data
            }
            return retVal;
        }
    }

    function setupMocksForUpdateResults() {
        spyOn(window, 'alert').and.returnValue("dummy-alert");
        spyOn(window, 'showSearchResults').and.returnValue("dummy-showSearchResults");
    }

    function DocumentClientClassMock() {
        this.scan = scanMock; // when instance created, setup mock for scan operation
    }

    function callback(err, entries) {
      returnedError = err;
      returnedEntries = entries;
    }
});
