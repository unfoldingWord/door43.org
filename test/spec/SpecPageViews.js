describe('PageViews', function () {

    describe('Test setPageViews()', function () {
        it('setPageViews() valid view_count should generate message', function () {
            //given
            var url = 'https://api.door43.org/page_view_count';
            var data = {
                view_count: 2
            };
            var response = {};
            const expectedMessage = '2 views';
            spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
                response = e.success(data);
            });
            var messageSet = null;
            var span = {
                html: function(message) {
                    messageSet = message;
                }
            };

            //when
            setPageViews(span, url, 'dummy', 1);

            //then
            expect(response['message']).toEqual(expectedMessage);
            expect(response.hasOwnProperty('error')).toBeFalsy();
            expect(messageSet).toEqual(expectedMessage);
        });

        it('setPageViews() Error message in response data should generate error', function () {
            //given
            var url = 'https://api.door43.org/page_view_count';
            var data = {
                ErrorMessage: "error message"
            };
            const expectedErrorMessage = 'Error: ' + data['ErrorMessage'];
            var response = {};
            spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
                response = e.success(data);
            });

            //when
            setPageViews(null, url, 'dummy', 1);

            //then
            expect(response['error']).toEqual(expectedErrorMessage);
            expect(response.hasOwnProperty('message')).toBeFalsy();
        });

        it('setPageViews() simulate ajax error reponse', function () {
            //given
            var url = 'https://api.door43.org/page_view_count';
            var response = null;
            const errorStatus = 'error status';
            const errorThrown = 'error thrown';
            const expectedResponse = 'Error: ' + errorStatus + '\n' + errorThrown;
            spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
                response = e.error(null, errorStatus, errorThrown);
            });

            //when
            setPageViews(null, url, 'dummy', 1);

            //then
            expect(response).toEqual(expectedResponse);
        });

        it('setPageViews() empty response data should generate error', function () {
            //given
            var url = 'https://api.door43.org/page_view_count';
            var data = { };
            var response = {};
            const expectedErrorMessage = 'Error: illegal response';
            spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
                response = e.success(data);
            });

            //when
            setPageViews(null, url, 'dummy', 1);

            //then
            expect(response['error']).toEqual(expectedErrorMessage);
            expect(response.hasOwnProperty('message')).toBeFalsy();
        });
    });

    describe('Test processPageViewSuccessResponse()', function () {
        it('processPageViewSuccessResponse() view_count should generate message', function () {
            //given
            var data = {
                view_count: 1
            };
            const expectedMessage = '1 view';

            //when
            var response = processPageViewSuccessResponse(data, null);

            //then
            expect(response.hasOwnProperty('error')).toBeFalsy();
            expect(response.hasOwnProperty('message')).toBeTruthy();
            expect(response['message']).toEqual(expectedMessage);
        });

        it('processPageViewSuccessResponse() view_count multipls should generate plural message', function () {
            //given
            var data = {
                view_count: 2
            };
            const expectedMessage = '2 views';

            //when
            var response = processPageViewSuccessResponse(data, null);

            //then
            expect(response.hasOwnProperty('error')).toBeFalsy();
            expect(response.hasOwnProperty('message')).toBeTruthy();
            expect(response['message']).toEqual(expectedMessage);
        });

        it('processPageViewSuccessResponse() ErrorMessage response should not generate message', function () {
            //given
            var data = {
                ErrorMessage: "error message"
            };
            const expectedErrorMessage = 'Error: ' + data['ErrorMessage'];

            //when
            var response = processPageViewSuccessResponse(data, null);

            //then
            expect(response['error']).toEqual(expectedErrorMessage);
            expect(response.hasOwnProperty('message')).toBeFalsy();
        });


        it('processPageViewSuccessResponse() empty response should not generate message', function () {
            //given
            var data = {
            };
            const expectedErrorMessage = 'Error: illegal response';

            //when
            var response = processPageViewSuccessResponse(data, null);

            //then
            expect(response['error']).toEqual(expectedErrorMessage);
            expect(response.hasOwnProperty('message')).toBeFalsy();
        });
    });

    describe('Test getPageViewUrl()', function () {
        it('getPageViewUrl() live page should point to api', function () {
            //given
            var pageUrl = 'https://live.door43.org/u/dummy/repo/96db55378e/';
            const expectedURL = 'https://api.door43.org/page_view_count';

            //when
            var downloadUrl = getPageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getPageViewUrl() empty page should point to api', function () {
            //given
            var pageUrl = '';
            const expectedURL = 'https://api.door43.org/page_view_count';

            //when
            var downloadUrl = getPageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getPageViewUrl() undefined page should point to api', function () {
            //given
            var pageUrl = undefined;
            const expectedURL = 'https://api.door43.org/page_view_count';

            //when
            var downloadUrl = getPageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getPageViewUrl() dev page should point to dev-api', function () {
            //given
            var pageUrl = 'https://dev.door43.org/u/dummy/repo/96db55378e/';
            const expectedURL = 'https://dev-api.door43.org/page_view_count';

            //when
            var downloadUrl = getPageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getPageViewUrl() test page should point to dev-api', function () {
            //given
            var pageUrl = 'https://dev.door43.org/u/dummy/repo/96db55378e/';
            const expectedURL = 'https://dev-api.door43.org/page_view_count';

            //when
            print("PAGE: "+pageUrl)
            print("EXP: "+expectedURL)
            var downloadUrl = getPageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });
    });
});
