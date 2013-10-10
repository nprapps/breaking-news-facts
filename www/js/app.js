$(function() {
    var $content = $('#content');
    var $column_false = $('#false');
    var $column_known = $('#known');
    var $column_unknown = $('#unknown');
    var $column_watching = $('#watching');
    
    var $tabs = $('#breaking-tabs');
    var $w = $(window);

    var sections = [ 'known', 'unknown', 'watching', 'false' ];
    var tab_active = null;
    var window_breakpoint = 976;


    /* DATA */
    function empty_columns() {
        $column_false.find('ul.news-items').empty();
        $column_known.find('ul.news-items').empty();
        $column_unknown.find('ul.news-items').empty();
        $column_watching.find('ul.news-items').empty();
    }
    function embed_tweet(tweet_id) {
        var embed_code = '';
        return embed_code;
    }
    function load_data() {
        $.getJSON('data/event-1.json', function(data) {
            var updates_false = '';
            var updates_known = '';
            var updates_unknown = '';
            var updates_watching = '';
        
            $.each(data, function(k,v) {
                var is_approved = v[0].approved;
                var is_public = v[0].public;
                var is_tweet = false;
                var num_updates = v.length;
                var this_update = '';
                
                if (is_approved) {
                    if (v[0].attribution.search('twitter.com') > -1) {
                        is_tweet = true;
                    }
                    this_update += '<li class="new">';
                    this_update += '<h4>New</h4>';
                    this_update += '<div class="news-item">' + v[0].statement;
                    
                    // doesn't work cross-domain; 
                    // twitter embed code should be retrieved by admin instead
                    /*
                    if (is_tweet) { 
                        var tweet_elements = v[0].attribution.split('/');
                        var tweet_id = tweet_elements[(tweet_elements.length - 1)];
                        console.log('TWEET ID: ' + tweet_id);
                        $.getJSON('https://api.twitter.com/1/statuses/oembed.json?id=' + tweet_id _ '&omit_script=true', function(tweet) {
                            this_update += tweet.html;
                        });
                    }
                    */
                    
                    this_update += '</div>';
                    
                    // tweet attribution, metadata
                    this_update += '<ul class="meta">';
                    this_update += '<li class="date-added">' + moment(v[0].time_string, "YYYYMMDD").fromNow() + '</li>';
                    if (is_tweet) {
                        this_update += '<li class="source">Source: <a href="' + v[0].attribution + '">Twitter</a></li>';
                    } else {
                        this_update += '<li class="source">Source: ' + v[0].attribution + '</li>';
                    }
                    this_update += '<li class="reporter">Added by: ' + v[0].reporter + '</li>';

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
                            var is_rev_approved = v[i].approved;
                            var is_rev_public = v[i].public;
                            var is_rev_tweet = false;
                            
                            if (is_rev_approved) {
                                if (v[i].attribution.search('twitter.com') > -1) {
                                    is_rev_tweet = true;
                                }
                                this_update += '<li>';
                                this_update += '<div class="news-item">';
                                this_update += '<span class="date">' + moment(v[i].time_string, "YYYYMMDD").fromNow() + ':</span> ';
                                this_update += v[i].statement;
                                if (is_rev_tweet) {
                                    this_update += ' (Source: <a href="' + v[0].attribution + '">Twitter</a>)';
                                } else {
                                    this_update += ' (Source: ' + v[i].attribution + ')';
                                }
                                this_update += '</div>';
                                this_update += '</li>';
                            }
                        }
                        this_update += '</ul>'; // close revisions
                        this_update += '</li>';
                    }
                    this_update += '</ul>'; // close metadata
                    this_update += '</li>';
                    
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
        setup_tabs();
        load_data();
    }
    setup();
    
});
