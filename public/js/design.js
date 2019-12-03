//jshint esversion:6
// Change active nav-item when navigating to a different page.
$(document).ready(() => {
  $('li.active').removeClass('active');
  $('a[href="' + location.pathname + '"]').closest('li').addClass('active');
});

// fetch posts when bottom of page is reached.
$(window).scroll(()=> {
  if($(window).scrollTop() + $(window).height() ==$(document).height()) {
    // Get current number of posts, know which to pull with fetch
    var currentNumPosts = $(".content-post").length;

    fetch(`http://localhost:3000/fetch/${currentNumPosts}`)
    .then(res => res.json())
    .then((json) => { // can delete paranthesis?
      json.forEach(post => {
        $(".main-area").append(`
          <div class='content-post'>
            <h1>${post.title}</h1>
            <p>
              ${post.content}.substring(0, 200) + ' ...'
              <a href='/posts/${post._id}'>read more</a>
            </p>
          </div>
        `);
      });
    });
  }
});
