$(function() {
    var $rev = $('li.revisions');
    var $rev_hdr = $rev.find('strong');
    var $rev_list = $rev.find('ul.revisions');
    
    if ($rev.length > 0) {
        $rev_hdr.click(function(){
            $(this).next('ul.revisions').slideToggle('fast');
        });
    }
});
