jQuery(document).ready(function($) {
  /**
   * Handle the sidebar nav
   */
  $('#sidebar-content').affix({
    offset: {
      top: 250
    }
  });

  /* activate scrollspy menu */
  var $body   = $(document.body);
  var navHeight = $('.navbar').outerHeight(true);

  $body.scrollspy({ target: '#right-col', offset: navHeight});

    /* smooth scrolling sections */
    $("ul#sidebar-nav li a[href^='#']").on('click', function(e) {

      // prevent default anchor click behavior
      e.preventDefault();

      // store hash
      var hash = this.hash;

      // animate
      $('html, body').animate({
      scrollTop: $(hash).offset().top - 60
      }, 300, function(){

      // when done, add hash to url
      // (default click behaviour)
      window.location.hash = hash;
    });

  });
});
