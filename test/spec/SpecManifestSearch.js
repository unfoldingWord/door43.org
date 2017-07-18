window.doAutoStartup = null; // prevent auto-startup

describe('Test Manifest Search', function () {

  var expectedErr;
  var expectedData;
  var scanMock;
  var returnedError;
  var returnedEntries;
  var originalSearchContinue;
  var returned_docClient;
  var returned_params;
  var returned_retData;
  var returned_matchLimit;

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

    it('getSearchCriteriaFromUrl: valid language array, full text, and user', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/?lc=en&lc=ceb&q=Bible&user=tx-manager-test-data';
        var expectedBaseUrl = 'http://127.0.0.1:4000';
        var expectedParams = {
            matchLimit: MAX_NUMBER_OF_RESULTS_FROM_DB,
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
            matchLimit: MAX_NUMBER_OF_RESULTS_FROM_DB,
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
            matchLimit: MAX_NUMBER_OF_RESULTS_FROM_DB,
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
            matchLimit: MAX_NUMBER_OF_RESULTS_FROM_DB,
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
            matchLimit: MAX_NUMBER_OF_RESULTS_FROM_DB,
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
            matchLimit: MAX_NUMBER_OF_RESULTS_FROM_DB,
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
            matchLimit: MAX_NUMBER_OF_RESULTS_FROM_DB,
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
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.languages = ['es'];
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };
        var expectedSearchKeys = [ 'lang_code' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
   });

    it('searchManifestTable: valid language array with continue should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 2;
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.languages =  ['es'];
        criteria.matchLimit = 2;
        expectedErr = null;
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };
        var expectedSearchKeys = [ 'lang_code' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

    it('searchManifestTable: valid language array and user name should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.languages = ['es', 'ceb'];
        criteria.user_name = "dummy";
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };
        var expectedSearchKeys = [ 'lang_code', 'user_name' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

    it('searchManifestTable: valid repo name and resID should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.repo_name = "dummy_repo";
        criteria.resID = "dummy_res";
        criteria.returnedFields = "user_name, repo_name";
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };
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
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.full_text = "dummy_text";
        criteria.resType = "dummy_type";
        criteria.returnedFields = "user_name, repo_name";
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };
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
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.resType = "dummy_res";
        criteria.title = "dummy_title";
        criteria.time = "dummy_time";
        criteria.manifest = "dummy_manifest";
        criteria.returnedFields = "user_name, repo_name, views";
        criteria.matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };
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
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.languages =  ['ceb'];
        criteria.matchLimit = 2;
        expectedErr = "search Failure";
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };
        var expectedSearchKeys = [ 'lang_code' ];

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
    });

    it('searchManifestTable: undefined getTable() should return error', function () {
        //given
        getManifestTable = null;
        var expectedReturn = false;
        var expectedItemCount = 0;
        var criteria = new SearchCriteria();
        criteria.matchLimit = 20;
        expectedErr = "dummy error";
        expectedData = {};

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: empty should return success but no data', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.returnedFields = "user_name, repo_name";
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifestTable(criteria, callback);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('searchManifestTable: current and recent search should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var criteria = new SearchCriteria();
        criteria.minViews = 5;
        criteria.daysForRecent = 30;
        criteria.returnedFields = "user_name, repo_name";
        expectedErr = null;
        expectedData = { Items:[] };
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
        var expectedItemCount = 2;
        SearchCriteria.matchLimit = 2;
        setupDynamoDbMocks(expectedReturn);
        expectedErr = null;
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };
        var expectedSearchKeys = [ 'lang_code' ];

        //when
        var results = searchProjects(search_url, 2);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
   });

   it('searchProjects for default page', function () {
        //given
        var search_url = 'http://127.0.0.1:4000/en/';
        var expectedReturn = true;
        var expectedItemCount = 2;
        SearchCriteria.matchLimit = 2;
        setupDynamoDbMocks(expectedReturn);
        expectedErr = null;
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };
        var expectedSearchKeys = [ 'lang_code' ];

        //when
        var results = searchProjects(search_url, 2);

        //then
        validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys);
   });

    //
    // helpers
    //

    var unExpectedKeyData;
    var expectedKeyData;

    function validateResults(results, expectedReturn, expectedItemCount, expectedSearchKeys) {
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
        if(expectedSearchKeys) {
            determineExpectedAndUnexpectedKeyData(expectedSearchKeys);

            _.each(expectedKeyData, function (value, key) {
                var attrName = value[0];
                var attrNameValue = value[1];
                var attrValue = value[2];

                expect(returned_params.FilterExpression.indexOf(attrName)).toBeGreaterThanOrEqual(0);
                expect(returned_params.ExpressionAttributeNames[attrName]).toEqual(attrNameValue);
                expect(returned_params.FilterExpression.indexOf(attrValue)).toBeGreaterThanOrEqual(0);
                expect(returned_params.ExpressionAttributeValues[attrValue]).not.toBeUndefined();
                expect(returned_params.ExpressionAttributeValues[attrValue]).not.toBeNull();
            });

            _.each(unExpectedKeyData, function (value, key) {
                var attrName = value[0];
                var attrValue = value[2];

                expect(returned_params.FilterExpression.indexOf(attrName)).toBeLessThan(0);
                expect(returned_params.FilterExpression.indexOf(attrValue)).toBeLessThan(0);
            });
        }
    }

   function determineExpectedAndUnexpectedKeyData(expectedSearchKeys) {
        const possibleKeys = {
            minViews: ["#views", "views", ":views"],
            daysForRecent: ["#date", "last_updated", ":recent"],
            lang_code: ["#lc", "lang_code", ":val_1"],
            user_name: ["#u", "user_name_lower", ":user"],
            repo_name: ["#r", "repo_name_lower", ":repo"],
            title: ["#title", "title", ":title"],
            time: ["#time", "last_updated", ":time"],
            manifest: ["#m", "manifest_lower", ":manifest"],
            resID: ["#id", "resource_id", ":resID"],
            resType: ["#t", "resource_type", ":type"],
        };

        unExpectedKeyData = JSON.parse(JSON.stringify(possibleKeys)); // clone data
        expectedKeyData = {};
        expectedSearchKeys.forEach(function (key) {
            var value = possibleKeys[key];
            if (value ) {
                var value = possibleKeys[key];
                expectedKeyData[key] = value;
                delete unExpectedKeyData[key];
            } else if(key !== 'full_text') {
                expect(possibleKeys.indexOf(key) >= 0).toBeTruthy();
            }
        });

        if(expectedSearchKeys.indexOf('full_text') >= 0) {
            var full_text = {
                manifest: ["#m", "manifest_lower", ":match"],
                user_name: ["#r", "repo_name_lower", ":match"],
                repo_name: ["#u", "user_name_lower", ":match"],
            };

            _.each(full_text,  function (value, key) {
                expectedKeyData[key] = value;
                delete unExpectedKeyData[key];
            });
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

    function setupDynamoDbMocks(retVal) {
        AWS = {
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

        originalSearchContinue = searchContinue;
        spyOn(window, 'searchContinue').and.callFake(mockSearchContinue);
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

    function mockSearchContinue(docClient, params, retData, matchLimit, callback){
        returned_docClient = docClient;
        returned_params = params;
        returned_retData = retData;
        returned_matchLimit = matchLimit;

        originalSearchContinue(docClient, params, retData, matchLimit, callback);
    }
});
