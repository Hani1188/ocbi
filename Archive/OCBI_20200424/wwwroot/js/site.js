// Write your JavaScript code.
//jQuery
$(function () {
    //Highlight Navbar Acitve Link
    $('a').each(function () {
        if ($(this).prop('href') == window.location.href.replace("#", "")) {
            $(this).addClass('active'); $(this).parents('li').addClass('active');
        }
    });
});

