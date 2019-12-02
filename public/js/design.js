//jshint esversion:6

$(document).ready(() => {
  $('li.active').removeClass('active');
  $('a[href="' + location.pathname + '"]').closest('li').addClass('active');
});
