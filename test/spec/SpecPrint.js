describe('printAll', function () {
    it('makes an ajax request', function () {
        //given
        spyOn($, 'ajax').and.callFake(function(e) { // mock ajax call
            e.success('cdn.door43.org/path/to/the.html');
        });
        spyOn(window, 'open')

        //when
        printAll();

        //then
        expect(window.open).toHaveBeenCalledWith('https://cdn.door43.org/path/to/the.html', '_blank');
    });
});
