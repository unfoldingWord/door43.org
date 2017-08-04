
describe('Test Project Sidebars', function () {

  beforeEach(function () {
    spyOn(window, 'get_window_width').and.callFake(function () {
      return 1000;
    });

    projectPageLoaded = false;

    // add the nav tags to the body
    document.body.style.height = '5000px';
    document.body.style.width = '1000px';
    var $body = $(document.body);
    $body.append('<nav class="navbar navbar-inverse navbar-fixed-top" itemscope="itemscope" itemtype="http://schema.org/SiteNavigationElement" role="navigation">Top Nav Bar</nav>');
    var $navbar = $('.navbar');
    $navbar.css('height', 65);
    $body.append('<header id="pinned-header" style="margin-top: 130px">Pinned Header</header>');
    $body.append('<div class="nav nav-stacked" id="revisions-div">Revisions</div>');
    $body.append('<div class="col-md-6" id="outer-content" role="main" style="height: 4000px">Content</div>');
    $body.append('<nav class="affix-top hidden-print hidden-xs hidden-sm" id="right-sidebar-nav">Right Nav Bar</nav>');
    $body.append('<footer class="site-footer" itemscope="itemscope" itemtype="http://schema.org/WPFooter" role="contentinfo">');

    var $right_nav = $body.find('#right-side-nav');
    $right_nav.append('<ul class="nav nav-stacked books panel-group" id="sidebar-nav"></ul>');
  });

  it('should set scrollspy data', function () {

    // run the onload function
    onProjectPageLoaded();

    // check for scrollspy data
    var $data = $(document.body).data('bs.scrollspy');
    expect($data).toBeDefined();
    expect($data.options.offset).toEqual(165);
  });

  it('should set outer-content margin-top', function () {

    var $outer = $('#outer-content');

    // margin-top should be zero
    expect($outer.css('marginTop')).toEqual('0px');

    // NOTE: We have to set window.scrollY = 2000 instead of using window.scroll(0, 2000) because the
    //       PhantomJS browser expands to the size of the document, so scrolling doesn't happen.

    // scroll down
    window.scrollY = 2000;
    onDocumentScroll(window);
    expect($outer.css('marginTop')).toEqual('240px');

    // scroll to top
    window.scrollY = 0;
    onDocumentScroll(window);
    expect($outer.css('marginTop')).toEqual('0px');
  });
});
