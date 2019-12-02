//jshint esversion:6

const nav_items = document.querySelectorAll(".nav-item");
nav_items.forEach((item, i) => {
  item.classList.add("nav_animations");
  item.style.animationDelay = `${i * 100}ms`;
});

const dots = document.querySelectorAll(".dot");
$(".navbar-brand").hover(()=> {
  animateCSS(".dot", "nav_animations");
});


function animateCSS(element, animationName, callback) {
  const node_list = document.querySelectorAll(element);

  node_list.forEach((node, i) => {
    function handleAnimationEnd() {
      node.classList.remove(animationName);
      node.removeEventListener("animationend", handleAnimationEnd);

      if (typeof callback === "function") callback();
    }

    node.classList.add(animationName);
    node.style.animationDelay = `${i * 100}ms`;
    node.addEventListener("animationend", handleAnimationEnd);
  });
}

$(document).ready(() => {
  $('li.active').removeClass('active');
  $('a[href="' + location.pathname + '"]').closest('li').addClass('active');
});

$(function() {
    // Custom Easing
    jQuery.scrollSpeed(100, 1800, 'easeOutCubic');
});
