describe('LanguageViews', function () {

    describe('Test updateTextOnUndefinedLanguagePage()', function () {
        beforeEach(function () {
            jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
            loadFixtures('404-fixture.html');

            // verify the fixture loaded successfully
            var $div = jQuery('.content-container');
            expect($div.length).toBeTruthy();

            spyOn($, "getScript").and.callFake(function(path, fnction) { // mock ajax call
                fnction();
            });

            spyOn(window, "setLanguagePageViews").and.returnValue("dummy");
        });

        it('updateTextOnUndefinedLanguagePage() should setup language options', function () {
            //given
            const expectedLangCode = "ru";
            const expectedSubPath = expectedLangCode + "/index.html";
            const href = "http://door43.org/" + expectedSubPath;
            const $links = [
                {
                    href: "http://door43.org/" + expectedSubPath
                },
                {
                    href: "http://door43.org/404.html"
                }
            ];

            //when
            updateTextOnUndefinedLanguagePage(href, $links);

            //then
            var $li = $('.content-container .page-content div ul li');
            expect($li.length).toEqual(4);
            expect($li[0].innerHTML).toContain("/en?lc=" + expectedLangCode);
            expect($li[1].innerHTML).toContain("history.go(-1)");
            expect($li[2].innerHTML).toContain("http://dw.door43.org/" + expectedSubPath);
            expect($li[3].innerHTML).toContain("<a href=\"/en/contact\">Contact Us</a> to let us know");
        });
    });

    describe('Test getValidLanguageCode()', function () {
        it('getValidLanguageCode() two letter language code should return lang_code', function () {
            //given
            const code = "ru";
            const expectedLangCode = code;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('getValidLanguageCode() three letter language code should return lang_code', function () {
            //given
            const code = "rub";
            const expectedLangCode = code;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('getValidLanguageCode() one letter language code should return null lang_code', function () {
            //given
            const code = "r";
            const expectedLangCode = null;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('getValidLanguageCode() no language code should return null lang_code', function () {
            //given
            const code = "";
            const expectedLangCode = null;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('getValidLanguageCode() "ru-" language code should return null lang_code', function () {
            //given
            const code = "ru-";
            const expectedLangCode = null;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('getValidLanguageCode() all valid language codes should return lang_code', function () {
            jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures';
            var languages = getJSONFixture('langnames.json');
            for(var i = 0; i < languages.length; i++) {
                var language = languages[i];

                //given
                var code = language.lc;
                var expectedLangCode = code.toLowerCase();
                var href = "http://door43.org/" + code;

                //when
                var lang_code = getValidLanguageCode(href);

                //then
                if(lang_code !== expectedLangCode) {
                    console.log("Mismatch for '" + language.ln + "' - expected '" + expectedLangCode + "', but got '" + lang_code + "'");
                    expect(lang_code).toEqual(expectedLangCode);
                }
            }
        });

        it('getValidLanguageCode() all valid temp language codes should return lang_code', function () {
            jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures';
            var languages = getJSONFixture('templanguages.json');
            for(var i = 0; i < languages.length; i++) {
                var language = languages[i];

                //given
                var code = language.lc;
                var expectedLangCode = code.toLowerCase();
                var href = "http://door43.org/" + code;

                //when
                var lang_code = getValidLanguageCode(href);

                //then
                if(lang_code !== expectedLangCode) {
                    console.log("Mismatch for '" + language.ln + "' - expected '" + expectedLangCode + "', but got '" + lang_code + "'");
                    expect(lang_code).toEqual(expectedLangCode);
                }
            }
        });

        it('getValidLanguageCode() "ru-b" language code should return null lang_code', function () {
            //given
            const code = "ru-b";
            const expectedLangCode = null;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('getValidLanguageCode() "ru-x" language code should return null lang_code', function () {
            //given
            const code = "ru-x";
            const expectedLangCode = null;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('getValidLanguageCode() "ru-x-" language code should return null lang_code', function () {
            //given
            const code = "ru-x-";
            const expectedLangCode = null;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('getValidLanguageCode() "ru-x-a" language code should return lang_code', function () {
            //given
            const code = "ru-x-a";
            const expectedLangCode = code;
            const href = "http://door43.org/" + code;

            //when
            var lang_code = getValidLanguageCode(href);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });
    });

    describe('Test checkForUndefinedLanguagePage()', function () {
       it('checkForUndefinedLanguagePage() unsupported language page should return lang_code', function () {
           //given
           const expectedLangCode = "ru";
           const expectedSubPath = expectedLangCode + "/index.html";
           const href = "http://door43.org/" + expectedSubPath;
           const $links = [
               {
                   href: "http://door43.org/" + expectedSubPath
               },
               {
                   href: "http://door43.org/404.html"
               }
           ];

           //when
           var lang_code = checkForUndefinedLanguagePage(href, $links);

           //then
           expect(lang_code).toEqual(expectedLangCode);
       });

        it('checkForUndefinedLanguagePage() unsupported user page should return null lang_code', function () {
            //given
            const expectedLangCode = null;
            const href = "http://door43.org/u/stuff";
            const $links = [
                {
                    href: href
                },
                {
                    href: "http://door43.org/404.html"
                }
            ];

            //when
            var lang_code = checkForUndefinedLanguagePage(href, $links);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('checkForUndefinedLanguagePage() unsupported unknown page should return null lang_code', function () {
            //given
            const expectedLangCode = null;
            const href = "http://door43.org/dummy";
            const $links = [
                {
                    href: href
                },
                {
                    href: "http://door43.org/404.html"
                }
            ];

            //when
            var lang_code = checkForUndefinedLanguagePage(href, $links);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });

        it('checkForUndefinedLanguagePage() supported page should return null lang_code', function () {
            //given
            const expectedLangCode = null;
            const href = "http://door43.org/en";
            const $links = [
                {
                    href: href
                }
            ];

            //when
            var lang_code = checkForUndefinedLanguagePage(href, $links);

            //then
            expect(lang_code).toEqual(expectedLangCode);
        });
    });
    
    describe('Test changeMissingTextForLanguageCode()', function () {
        beforeEach(function () {
            jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
            loadFixtures('404-fixture.html');

            // verify the fixture loaded successfully
            var $div = jQuery('.content-container');
            expect($div.length).toBeTruthy();
        });

        it('changeMissingTextForLanguageCode() should setup language options', function () {
            //given
            const subPath = 'ru/index.html';
            const lang_code = 'ru';

            //when
            changeMissingTextForLanguageCode(lang_code, subPath);

            //then
            var $li = $('.content-container .page-content div ul li');
            expect($li.length).toEqual(4);
            expect($li[0].innerHTML).toContain("/en?lc=" + lang_code);
            expect($li[1].innerHTML).toContain("history.go(-1)");
            expect($li[2].innerHTML).toContain("http://dw.door43.org/" + subPath);
            expect($li[3].innerHTML).toContain("<a href=\"/en/contact\">Contact Us</a> to let us know");
        });
    });

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
