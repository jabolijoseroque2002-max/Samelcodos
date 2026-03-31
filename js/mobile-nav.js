document.addEventListener('DOMContentLoaded', function() {
  var mobileToggle = document.querySelector('.nav-mobile-toggle');
  var navRight = document.querySelector('.nav-right');

  if (mobileToggle && navRight) {
    mobileToggle.addEventListener('click', function() {
      mobileToggle.classList.toggle('is-active');
      navRight.classList.toggle('is-open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!mobileToggle.contains(e.target) && !navRight.contains(e.target)) {
        mobileToggle.classList.remove('is-active');
        navRight.classList.remove('is-open');
      }
    });

    // Close menu when clicking a link
    navRight.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileToggle.classList.remove('is-active');
        navRight.classList.remove('is-open');
      });
    });
  }
});
