document.addEventListener('DOMContentLoaded', function () {
  // common layout logic (user, logout, nav menu, branches button)
  var userName = localStorage.getItem('userName');
  if (!userName) {
    window.location.href = 'index.html';
    return;
  }
  document.getElementById('user-name').textContent = userName;

  document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
  });

  var branchesBtn = document.getElementById('branches-btn');
  if (branchesBtn) {
    branchesBtn.addEventListener('click', function() {
      // already on branches page, do nothing or reload
    });
  }

  var navDotsBtn = document.getElementById('nav-dots-btn');
  var navDotsDropdown = document.getElementById('nav-dots-dropdown');
  if (navDotsBtn && navDotsDropdown) {
    navDotsBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = navDotsDropdown.classList.toggle('is-open');
      navDotsBtn.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', function() {
      navDotsDropdown.classList.remove('is-open');
      navDotsBtn.setAttribute('aria-expanded', 'false');
    });
    navDotsDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    navDotsDropdown.querySelectorAll('.nav-dots-item').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = this.getAttribute('data-action');
        navDotsDropdown.classList.remove('is-open');
        if (action === 'home') {
          window.location.href = 'dashboard.html';
        } else if (action === 'records') {
          window.location.href = 'records.html';
        } else if (action === 'analytics') {
          window.location.href = 'analytics.html';
        } else if (action === 'branches') {
          window.location.href = 'branches.html';
        } else if (action === 'etc') {
          alert('Etc – Coming soon');
        }
      });
    });
  }

  // branch selection logic
  var branchOptions = document.querySelectorAll('.branch-option');
  branchOptions.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var branch = this.getAttribute('data-branch');
      // store branch name for filtering on records page
      localStorage.setItem('selectedBranch', branch);
      window.location.href = 'records.html';
    });
  });
});