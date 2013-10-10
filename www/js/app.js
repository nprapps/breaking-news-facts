$(function() {
/*
    var context = $.extend(APP_CONFIG, {
        'template_path': 'jst/example.html',
        'config': JSON.stringify(APP_CONFIG, null, 4),
        'copy': JSON.stringify(COPY, null, 4)
    });

    var html = JST.example(context);

    $('#template-example').html(html);
*/

/*
<ul class="nav nav-tabs nav-justified" id="breaking-tabs">
    <li><a href="known" data-toggle="tab">What We Know</a></li>
    <li><a href="unknown" data-toggle="tab">What We're Trying To Confirm</a></li>
    <li><a href="false" data-toggle="tab">What We've Ruled Out</a></li>
</ul>
*/

    var $content = $('#content');
    var $tabs = $('#breaking-tabs');
    var $w = $(window);
    var sections = [ 'known', 'unknown', 'watching', 'false' ];
    var tab_active = null;
    var window_breakpoint = 976;
    
    function setup_tabs() {
        for (s in sections) {
            $tabs.find('li.' + sections[s]).on('click', function() {
                var tab_new = $(this).attr('class');
                $(this).addClass('active').siblings('li').removeClass('active');
                $('#' + tab_new).show().addClass('active').siblings('.tab-pane').removeClass('active').hide();
                tab_active = tab_new;
            });
        }
        reset_tabs();
    }

    function reset_tabs() {
        var window_width = $w.width();
        console.log(window_width, $content.width());
        if (window_width <= window_breakpoint) {
            if (tab_active == null) {
                $tabs.find('li:eq(0)').trigger('click');
            } else {
                $content.find('.tab-pane.active').show().siblings('.tab-pane').hide();
            }
        } else {
            $('.tab-pane').show();
        }
    }
    $w.on('resize', reset_tabs);
    
    
    /* SETUP */
    function setup() {
        setup_tabs();
    }
    setup();
    
});
