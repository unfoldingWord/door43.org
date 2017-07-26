describe('LanguageViews', function () {

    describe('Test setLanguagePageViews()', function () {
        it('setLanguagePageViews() valid view_count should generate message', function () {
            //given
            var url = 'https://api.door43.org/en';
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
            setLanguagePageViews(span, url, 'dummy', 1);

            //then
            expect(response['message']).toEqual(expectedMessage);
            expect(response.hasOwnProperty('error')).toBeFalsy();
            expect(messageSet).toEqual(expectedMessage);
        });

        it('setLanguagePageViews() Error message in response data should generate error', function () {
            //given
            var url = 'https://api.door43.org/en';
            var data = {
                ErrorMessage: "error message"
            };
            const expectedErrorMessage = 'Error: ' + data['ErrorMessage'];
            var response = {};
            spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
                response = e.success(data);
            });

            //when
            setLanguagePageViews(null, url, 'dummy', 1);

            //then
            expect(response['error']).toEqual(expectedErrorMessage);
            expect(response.hasOwnProperty('message')).toBeFalsy();
        });

        it('setLanguagePageViews() simulate ajax error reponse', function () {
            //given
            var url = 'https://api.door43.org/en';
            var response = null;
            const errorStatus = 'error status';
            const errorThrown = 'error thrown';
            const expectedResponse = 'Error: ' + errorStatus + '\n' + errorThrown;
            spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
                response = e.error(null, errorStatus, errorThrown);
            });

            //when
            setLanguagePageViews(null, url, 'dummy', 1);

            //then
            expect(response).toEqual(expectedResponse);
        });

        it('setLanguagePageViews() empty response data should generate error', function () {
            //given
            var url = 'https://api.door43.org/en';
            var data = { };
            var response = {};
            const expectedErrorMessage = 'Error: illegal response';
            spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
                response = e.success(data);
            });

            //when
            setLanguagePageViews(null, url, 'dummy', 1);

            //then
            expect(response['error']).toEqual(expectedErrorMessage);
            expect(response.hasOwnProperty('message')).toBeFalsy();
        });
    });

    describe('Test getLanguagePageViewUrl()', function () {
        it('getLanguagePageViewUrl() live page should point to api', function () {
            //given
            var pageUrl = 'https://live.door43.org/en/';
            const expectedURL = 'https://api.door43.org/language_view_count';

            //when
            var downloadUrl = getLanguagePageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getLanguagePageViewUrl() empty page should point to api', function () {
            //given
            var pageUrl = '';
            const expectedURL = 'https://api.door43.org/language_view_count';

            //when
            var downloadUrl = getLanguagePageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getLanguagePageViewUrl() undefined page should point to api', function () {
            //given
            var pageUrl = undefined;
            const expectedURL = 'https://api.door43.org/language_view_count';

            //when
            var downloadUrl = getLanguagePageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getLanguagePageViewUrl() dev page should point to dev-api', function () {
            //given
            var pageUrl = 'https://dev.door43.org/en/';
            const expectedURL = 'https://dev-api.door43.org/language_view_count';

            //when
            var downloadUrl = getLanguagePageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getLanguagePageViewUrl() test page should point to dev-api', function () {
            //given
            var pageUrl = 'https://test.door43.org/en/';
            const expectedURL = 'https://test-api.door43.org/language_view_count';

            //when
            var downloadUrl = getLanguagePageViewUrl(pageUrl);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });
    });
});
