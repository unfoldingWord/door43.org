describe('Test Title in Footer', function () {

    describe('Test updateFooter()', function () {
        var $footer = null;
        var $title = null;
        var htmlSet = null;

        beforeEach(function () {
            $footer = null;
            $title = null;
            htmlSet = null;
        });

        it('updateFooter() heading in footer should update html', function () {
            //given
            const footerPrefix = "pre - ";
            const footerSuffix = " - after";
            const footerCenter = "{{ HEADING }}";
            const footerText = footerPrefix + footerCenter + footerSuffix;
            const titleText = "dummy_title";
            const expectedText = footerPrefix + titleText + footerSuffix;
            setupMocks(footerText, titleText);

            //when
            updateFooter($footer,$title);

            //then
            expect($footer.html).toHaveBeenCalled();
            expect(htmlSet).toEqual(expectedText);
        });

        it('updateFooter() no heading in footer should not update html', function () {
            //given
            const footerText = "dummy_footer";
            const titleText = "dummy_title";
            setupMocks(footerText, titleText);

            //when
            updateFooter($footer,$title);

            //then
            expect($footer.html).not.toHaveBeenCalled();
        });

        it('updateFooter() null title and footer should not crash', function () {
            //given
            const expectedText = null;
            $footer = null;
            $title = null;

            //when
            updateFooter($footer,$title);

            //then
            expect(htmlSet).toEqual(expectedText);
        });

        it('updateFooter() empty title and footer should not crash', function () {
            //given
            const expectedText = null;
            $footer = [];
            $title = [];

            //when
            updateFooter($footer,$title);

            //then
            expect(htmlSet).toEqual(expectedText);
        });

        it('updateFooter() null title should not crash', function () {
            //given
            const expectedText = null;
            const footerText = "dummy";
            setupMocks(footerText, null);
            $title = null;

            //when
            updateFooter($footer,$title);

            //then
            expect(htmlSet).toEqual(expectedText);
        });

        it('updateFooter() empty title should not crash', function () {
            //given
            const expectedText = null;
            const footerText = "dummy";
            setupMocks(footerText, null);
            $title = [];

            //when
            updateFooter($footer,$title);

            //then
            expect(htmlSet).toEqual(expectedText);
        });

        //
        // helpers
        //

        function setupMocks(footerText, titleText) {
            $footer = [
                {
                    innerHTML: footerText
                }
            ];
            $footer.html = jasmine.createSpy().and.callFake(mockJqueryHtml);
            $title = [
                {
                    innerText: titleText
                }
            ];
        }

        function mockJqueryHtml(html){
            htmlSet = html;
        }

    });
});
