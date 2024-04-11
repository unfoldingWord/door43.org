window.doAutoStartup = null; // prevent auto-startup

describe('Test Manifest Search', function () {

  var expectedErr;
  var expectedData;
  var returnedError;
  var returnedEntries;
  var originalSearchContinue;
  var returned_docClient;
  var returned_params;
  var returned_retData;
  var returned_limit;

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

    it('updatePopularResults: err should call alert', function () {
        //given
        var err = "Error";
        var entries = [];
        setupMocksForUpdateResults();

        //when
        updatePopularResults(err, entries);

        //then
        expect(window.alert).toHaveBeenCalled();
        expect(window.showSearchResults).not.toHaveBeenCalled();
    });

    it('updatePopularResults: no err should call showSearchResults', function () {
        //given
        var err = null;
        var entries = [];
        setupMocksForUpdateResults();

        //when
        updatePopularResults(err, entries);

        //then
        expect(window.alert).not.toHaveBeenCalled();
        expect(window.showSearchResults).toHaveBeenCalled();
    });

    it('updateRecentResults: err should call alert', function () {
        //given
        var err = "Error";
        var entries = [];
        setupMocksForUpdateResults();

        //when
        updateRecentResults(err, entries);

        //then
        expect(window.alert).toHaveBeenCalled();
        expect(window.showSearchResults).not.toHaveBeenCalled();
    });

    it('updateRecentResults: no err should call showSearchResults', function () {
        //given
        var err = null;
        var entries = [];
        setupMocksForUpdateResults();

        //when
        updateRecentResults(err, entries);

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

    it('getSearchCriteriaFromUrl: valid language array, full text, and user', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/?lc=en&lc=ceb&q=Bible&user=tx-manager-test-data';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        var expectedParams = {
            limit: MAX_NUMBER_OF_RESULTS_FROM_DB,
            minViews: 0,
            languages: [ 'en', 'ceb'],
            full_text: 'Bible',
            user_name: 'tx-manager-test-data'
        };

        //when
        var criteria = getSearchCriteriaFromUrl(search_url);

        //then
        validateSearchCriteria(criteria, expectedBaseUrl, expectedParams)
    });

    it('getSearchCriteriaFromUrl: multiple language array and extra q', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/?lc=en&q=Bible&q=ceb&user=tx-manager-test-data';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        var expectedParams = {
            limit: MAX_NUMBER_OF_RESULTS_FROM_DB,
            minViews: 0,
            languages: [ 'en' ],
            full_text: 'Bible',
            user_name: 'tx-manager-test-data'
        };

        //when
        var criteria = getSearchCriteriaFromUrl(search_url);

        //then
        validateSearchCriteria(criteria, expectedBaseUrl, expectedParams)
    });

    it('getSearchCriteriaFromUrl: valid language array', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/?lc=es';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        var expectedParams = {
            limit_RESULTS_FROM_DB,
            minViews: 0,
            languages: [ 'es' ],
        };

        //when
        var criteria = getSearchCriteriaFromUrl(search_url);

        //then
        validateSearchCriteria(criteria, expectedBaseUrl, expectedParams)
    });

    it('getSearchCriteriaFromUrl: valid language array and user name', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/?lc=es&lc=ceb&user=dummy';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        var expectedParams = {
            limit: MAX_NUMBER_OF_RESULTS_FROM_DB,
            minViews: 0,
            languages: [ 'es', 'ceb'],
            user_name: 'dummy'
        };

        //when
        var criteria = getSearchCriteriaFromUrl(search_url);

        //then
        validateSearchCriteria(criteria, expectedBaseUrl, expectedParams)
    });

    it('getSearchCriteriaFromUrl: valid repo name and resource', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/?lc=es&repo=dummy_repo&resource=dummy_res';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        var expectedParams = {
            limit: MAX_NUMBER_OF_RESULTS_FROM_DB,
            minViews: 0,
            languages: [ 'es' ],
            repo_name: 'dummy_repo',
            resID: 'dummy_res'
        };

        //when
        var criteria = getSearchCriteriaFromUrl(search_url);

        //then
        validateSearchCriteria(criteria, expectedBaseUrl, expectedParams)
    });

    it('getSearchCriteriaFromUrl: empty search parameters', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/?';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        var expectedParams = {
            limit: MAX_NUMBER_OF_RESULTS_FROM_DB,
            minViews: 0,
        };

        //when
        var criteria = getSearchCriteriaFromUrl(search_url);

        //then
        validateSearchCriteria(criteria, expectedBaseUrl, expectedParams)
    });

    it('getSearchCriteriaFromUrl: no search parameters', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        var expectedParams = {
            limit: MAX_NUMBER_OF_RESULTS_FROM_DB,
            minViews: 0,
        };

        //when
        var criteria = getSearchCriteriaFromUrl(search_url);

        //then
        validateSearchCriteria(criteria, expectedBaseUrl, expectedParams)
    });

    it('searchManifestTable: valid language array should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 1;
        setupDbQueryMocks();
        var criteria = new SearchCriteria();
        criteria.languages = ['es'];
        criteria.limit = 20;
        expectedErr = null;
        expectedData = [{ 'object': "" }];
        var expectedSearchKeys = [ 'languages' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
   });

    it('searchManifestTable: valid language array and user name should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDbQueryMocks();
        var criteria = new SearchCriteria();
        criteria.languages = ['es', 'ceb'];
        criteria.user_name = "dummy";
        criteria.limit = 20;
        expectedErr = null;
        expectedData = [];
        var expectedSearchKeys = [ 'languages', 'user_name' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

    it('searchManifestTable: valid repo name and resID should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDbQueryMocks();
        var criteria = new SearchCriteria();
        criteria.repo_name = "dummy_repo";
        criteria.resID = "dummy_res";
        criteria.returnedFields = "user_name, repo_name";
        criteria.limit = 20;
        expectedErr = null;
        expectedData = [];
        var expectedSearchKeys = [ 'repo_name', 'resID' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

    it('searchManifestTable: valid full_text and resource should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDbQueryMocks();
        var criteria = new SearchCriteria();
        criteria.full_text = "dummy_text";
        criteria.resType = "dummy_type";
        criteria.returnedFields = "user_name, repo_name";
        criteria.limit = 20;
        expectedErr = null;
        expectedData = [];
        var expectedSearchKeys = [ 'full_text', 'resType' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

    it('searchManifestTable: misc. parameters should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDbQueryMocks();
        var criteria = new SearchCriteria();
        criteria.resType = "dummy_res";
        criteria.title = "dummy_title";
        criteria.time = "dummy_time";
        criteria.manifest = "dummy_manifest";
        criteria.returnedFields = "user_name, repo_name, views";
        criteria.limit = 20;
        expectedErr = null;
        expectedData = [];
        var expectedSearchKeys = [ 'resType', 'title', 'time', 'manifest' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

    it('searchManifestTable: search error should return error', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDbQueryMocks();
        var criteria = new SearchCriteria();
        criteria.languages =  ['ceb'];
        criteria.limit = 2;
        expectedErr = "search Failure";
        expectedData = [ { 'object': "" }];
        var expectedSearchKeys = [ 'languages' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

    it('searchManifestTable: empty should return success but no data', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDbQueryMocks();
        var criteria = new SearchCriteria();
        criteria.returnedFields = "user_name, repo_name";
        expectedErr = null;
        expectedData = [];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: current and recent search should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDbQueryMocks();
        var criteria = new SearchCriteria();
        criteria.minViews = 5;
        criteria.daysForRecent = 30;
        criteria.returnedFields = "user_name, repo_name";
        expectedErr = null;
        expectedData = [];
        var expectedSearchKeys = [ 'minViews', 'daysForRecent' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

   it('searchProjects: valid URL return success', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/?lc=es&q=Bible&user=tx-manager-test-data';
        var expectedReturn = true;
        spyOn(window, 'searchManifestTable').and.returnValue(true);
        searchProjects(search_url);

        //when
        var results = searchProjects(search_url);

        //then
        expect(results).toEqual(expectedReturn);
   });

    //
    // helpers
    //

    var unExpectedKeyData;
    var expectedKeyData;

    function validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys) {
        returned_params = results ? results['params'] : null;
        if (expectedErr) {
            expect(returnedError.length > 0).toBeTruthy();
            if (!expectedReturn) {
                expect(returnedEntries).toBeNull();
            } else {
                var returnedEntryCount = returnedEntries ? returnedEntries.length : 0;
                expect(returnedEntryCount).toEqual(expectedItemCount);
            }
        } else { // not error
            expect(returnedError).toBeNull();
            var returnedEntryCount = returnedEntries ? returnedEntries.length : 0;
            expect(returnedEntryCount).toEqual(expectedItemCount);
        }
        if(expectedSearchKeys) {
            determineExpectedAndUnexpectedKeyData(expectedSearchKeys);

            _.each(expectedKeyData, function (value, key) {
                expect(returned_params[key]).not.toBeUndefined();
                expect(returned_params[key]).not.toBeNull();
            });

            _.each(unExpectedKeyData, function (value, key) {
                expect(returned_params.hasOwnProperty(key)).toBeFalsy();
            });
        }
    }

   function determineExpectedAndUnexpectedKeyData(expectedSearchKeys) {
        const possibleKeys = {
            minViews: true,
            daysForRecent: true,
            languages: true,
            full_text: true,
            user_name: true,
            repo_name: true,
            title: true,
            time: true,
            manifest: true,
            resID: true,
            resType: true
        };

        unExpectedKeyData = JSON.parse(JSON.stringify(possibleKeys)); // clone data
        expectedKeyData = {};
        expectedSearchKeys.forEach(function (key) {
            var value = possibleKeys[key];
            if (value ) {
                expectedKeyData[key] = value;
                delete unExpectedKeyData[key];
            }
        });
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
                    var value = expectedParams[key];
                    if (value.indexOf(item) < 0) {
                        console.log("Miscompare key '" + key + "' '" + item + "' not in '[" + value.join(",") + "]'");
                        expect(_.contains(expectedParam, param)).toBeTruthy();
                    }
                })
            } else {
                var expectedParam = expectedParams[key];
                if (expectedParam instanceof Array) {
                    if (expectedParam.indexOf(param) < 0) {
                        console.log("Miscompare key '" + key + "' '" + param + "' not in '[" + expectedParam.join(",") + "]'");
                        expect(_.contains(expectedParam, param)).toBeTruthy();
                    }
                    expect(expectedParam.length).toEqual(1);
                } else {
                    if(param != expectedParam) {
                        console.log("Miscompare key '" + key + "' got '" + param + "' but expected '" + expectedParam + "'");
                        expect(param).toEqual(expectedParam);
                    }
                }
            }
        });
    }

    function validateSearchCriteria(criteria, expectedBaseUrl, expectedParams) {
        expect(baseUrl).toEqual(expectedBaseUrl);
        expect(criteria.length).toEqual(expectedParams.length);
        _.each(criteria, function (param, key) {
            if (param instanceof Array) {
                expect(param.length).toEqual(expectedParams[key].length);
                _.each(param, function (item) {
                    var value = expectedParams[key];
                    if (value.indexOf(item) < 0) {
                        console.log("Miscompare key '" + key + "' '" + item + "' not in '[" + value.join(",") + "]'");
                        expect(_.contains(expectedParam, param)).toBeTruthy();
                    }
                })
            } else {
                var expectedParam = expectedParams[key];
                if (expectedParam instanceof Array) {
                    if (expectedParam.indexOf(param) < 0) {
                        console.log("Miscompare key '" + key + "' '" + param + "' not in '[" + expectedParam.join(",") + "]'");
                        expect(_.contains(expectedParam, param)).toBeTruthy();
                    }
                    expect(expectedParam.length).toEqual(1);
                } else {
                    if(param != expectedParam) {
                        console.log("Miscompare key '" + key + "' got '" + param + "' but expected '" + expectedParam + "'");
                        expect(param).toEqual(expectedParam);
                    }
                }
            }
        });
    }

    function setupUpdateUrlMock() {
        spyOn(window, 'updateUrl').and.returnValue("mock_updateUrl");
    }

    function setupDbQueryMocks() {
        spyOn(window, 'updateResults').and.callThrough();
        spyOn(window, 'searchManifestTable').and.callThrough();

        spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
            if(!expectedErr) {
                response = e.success(expectedData);
            } else {
                response = e.error(null, expectedErr, expectedErr + " thrown");
            }
        });
    }

    function setupSearchManifestTableMocks(retVal) {
        setupUpdateUrlMock();
        spyOn(window, 'updateResults').and.callFake(callback);
        spyOn(window, 'searchManifestTable').and.callFake(mockSearchManifestTest);
        function mockSearchManifestTest(limit, languages, user_name, repo_name, resID, resType, title, time, manifest, full_text, returnedFields, callback) { // mock the table scan operation
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

    function callback(err, entries) {
      returnedError = err;
      returnedEntries = entries;
    }

    function mockSearchContinue(docClient, params, retData, limit, callback){
        returned_docClient = docClient;
        returned_params = params;
        returned_retData = retData;
        returned_limit = limit;

        originalSearchContinue(docClient, params, retData, limit, callback);
    }
});
