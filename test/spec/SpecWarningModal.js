describe('Test Warming Modal', function () {
    it('showWarningModel() should generate modal HTML', function () {
        showWarningModal('<ul><li>'+['Missing Chapter 1', 'Missing Chapter 2'].join('</li><li>')+'</li></ul>',
            'Door43', 'en_obs');

        expect($('#warning-modal')).toExist();

        var expectedLength = 2;
        expect($('#warning-modal .modal-body li').length).toEqual(expectedLength);

        var expectedText = 'mailto:help@door43.org?subject='+encodeURIComponent('Build Warning: Door43/en_obs')
        expect($('#warning-modal .btn-secondary').attr('href')).toContain(expectedText);
    });
});