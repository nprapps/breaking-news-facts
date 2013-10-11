$(function() {
    var $content = $('#content');
    var $column_false = $('#false');
    var $column_known = $('#known');
    var $column_unknown = $('#unknown');
    var $column_watching = $('#watching');
    
    var $b = $('body');
    var $tabs = $('#breaking-tabs');
    var $w = $(window);

    var sections = [ 'known', 'unknown', 'watching', 'false' ];
    var tab_active = null;
    var window_breakpoint = 976;
    
    var page_type;
    var page_scope;


    /* DATA */
    function load_data() {
        $.getJSON('data/event-1.json', function(data) {
            var updates_false = '';
            var updates_known = '';
            var updates_unknown = '';
            var updates_watching = '';
            
            var data = filter_data(data);
        
            $.each(data, function(k,v) {
                var num_updates = v.length;
                var this_update = '';
                
                switch(page_type) {
                    case 'email':
                        this_update += JST.email_news_item(v[0]);
                        break;
                    case 'board':
                        this_update += JST.board_news_item(v[0]);

                        // previous versions of this fact
                        if (num_updates > 1) {
                            this_update += '<li class="revisions">';
                            this_update += '<strong>' + (num_updates - 1) + ' previous ';
                            if ((num_updates - 1) == 1) {
                                this_update += 'version';
                            } else {
                                this_update += 'versions';
                            }
                            this_update += '</strong>';
                            this_update += '<ul class="revisions">';
                            for (var i = 1; i < num_updates; i++) {
                                this_update += JST.board_revised_item(v[i]);
                            }
                            this_update += '</ul>'; // close revisions
                            this_update += '</li>';
                        }
                        this_update += '</ul>'; // close metadata
                        this_update += '</li>'; // close item
                        break;
                }
                    
                    
                // assign to a column
                switch(v[0].status) {
                    case 0: // false
                        updates_false += this_update;
                        break;
                    case 1: // confirmed
                        updates_known += this_update;
                        break;
                    case 2: // not chasing
                        updates_watching += this_update;
                        break;
                    case 3: // chasing
                        updates_unknown += this_update;
                        break;
                }
                    
                console.log(this_update);
            });
            
            $column_false.find('ul.news-items').empty().append(updates_false);
            $column_known.find('ul.news-items').empty().append(updates_known);
            $column_unknown.find('ul.news-items').empty().append(updates_unknown);
            $column_watching.find('ul.news-items').empty().append(updates_watching);
            
            toggle_revisions();
        });
    }

    function filter_data(data) {
        var filtered_data = [];

        $.each(data, function (k, v) {
            if (v != undefined) {
                var filtered_data_item = [];
                $.each(v, function(i, f) {
                    if (f != undefined) {
                        var is_approved = f.approved;
                        var is_public = f.public;
                        var is_tweet = false;

                        if (f.attribution.search('twitter.com') > -1) {
                            is_tweet = true;
                        }
                        
                        switch(page_scope) {
                            case 'public':
                                if (page_scope == 'public' && is_public && is_approved) {
                                    f.date_relative = moment(f.time_string, "YYYYMMDD").fromNow();
                                    f.page_scope = page_scope;
                                    f.is_tweet = is_tweet;
                                    filtered_data_item.push(f);
                                }
                                break;
                            case 'internal':
                                if (is_approved) {
                                    f.date_relative = moment(f.time_string, "YYYYMMDD").fromNow();
                                    f.page_scope = page_scope;
                                    f.is_tweet = is_tweet;
                                    filtered_data_item.push(f);
                                }
                                break;
                        }
                    }
                });
                if (filtered_data_item.length > 0) {
                    filtered_data.push(filtered_data_item);
                }
            }

            if (v == undefined || v.length == 0) {
                data.splice(k, 1);
            }
        });
        return filtered_data;
    }
    
    
    /* SHOW/HIDE REVISIONS */
    function toggle_revisions() {
        var $rev = $('li.revisions');
        var $rev_hdr = $rev.find('strong');
    
        if ($rev.length > 0) {
            $rev_hdr.click(function(){
                $(this).next('ul.revisions').slideToggle('fast');
            });
        }
    }


    /* TABS */
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
        if ($b.hasClass('board')) {
            page_type = 'board';
        } else if ($b.hasClass('email')) {
            page_type = 'email';
        }

        if ($b.hasClass('public')) {
            page_scope = 'public';
        } else if ($b.hasClass('internal')) {
            page_scope = 'internal';
        }

        setup_tabs();
        load_data();
    }
    setup();
    
});
