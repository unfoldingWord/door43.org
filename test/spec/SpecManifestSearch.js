describe('Test Manifest Search', function () {

  var expectedErr;
  var expectedData;
  var scanMock;
  var returnedError;
  var returnedEntries;

    it('valid language string should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var pageUrl = "https://test-dummy.com";
        var language = 'ceb';
        var matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifest(pageUrl, language, matchLimit, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('valid language array should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var pageUrl = "https://test-dummy.com";
        var language = ['es', 'ceb'];
        var matchLimit = 20;
        expectedErr = null;
        expectedData = { Items:[] };

        //when
        var results = searchManifest(pageUrl, language, matchLimit, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('valid language string with continue should return success', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 2;
        setupDynamoDbMocks(expectedReturn);
        var pageUrl = "https://test-dummy.com";
        var language = 'ceb';
        var matchLimit = 2;
        expectedErr = null;
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };

        //when
        var results = searchManifest(pageUrl, language, matchLimit, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('search error should return error', function () {
        //given
        var expectedReturn = true;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var pageUrl = "https://test-dummy.com";
        var language = 'ceb';
        var matchLimit = 2;
        var expectedError = "search Failure";
        expectedErr = expectedError;
        expectedData = {
            Items:[ { 'object': "" }],
            LastEvaluatedKey: { dummy: "dummy data" }
        };

        //when
        var results = searchManifest(pageUrl, language, matchLimit, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('invalid language should return error', function () {
        //given
        var expectedReturn = false;
        var expectedItemCount = 0;
        setupDynamoDbMocks(expectedReturn);
        var pageUrl = "https://test-dummy.com";
        var language = null;
        var matchLimit = 20;
        expectedErr = "dummy error";
        expectedData = {};

        //when
        var results = searchManifest(pageUrl, language, matchLimit, onFinished);

        //then
        validateResults(results, expectedReturn, expectedItemCount);
    });

    it('undefined getTable() should return error', function () {
        //given
        getTable = null;
        var expectedReturn = false;
        var expectedItemCount = 0;
        var pageUrl = "https://test-dummy.com";
        var language = null;
        var matchLimit = 20;
        expectedErr = "dummy error";
        expectedData = {};

        //when
        var results = searchManifest(pageUrl, language, matchLimit, onFinished);

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

        getTable = jasmine.createSpy().and.returnValue("dummy-table");
        scanMock = jasmine.createSpy().and.callFake(mockOnScan);
        function mockOnScan(params, onScan) { // mock the table scan operation
            if(onScan) {
                onScan(expectedErr, expectedData); // call onScan handler with mock data
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
