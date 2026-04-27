document.addEventListener('DOMContentLoaded', function () {
  // Municipalities (SAMELCO II – Samar) - Use shared data from municipalities-data.js (16 municipalities from GeoJSON)
  var municipalities = window.SAMELCO_MUNICIPALITIES || [];
  var municipalityDataset = Array.isArray(window.SAMELCO_MUNICIPALITIES) && window.SAMELCO_MUNICIPALITIES.length
    ? window.SAMELCO_MUNICIPALITIES
    : municipalities;

  // Nav: Municipalities dropdown – simple list
  var municipalitiesTrigger = document.getElementById('nav-municipalities-trigger');
  var municipalitiesDropdown = document.getElementById('nav-municipalities-dropdown');
  var municipalitiesListEl = document.getElementById('nav-municipalities-list');
  if (municipalitiesTrigger && municipalitiesDropdown && municipalitiesListEl) {
    municipalityDataset.forEach(function (m) {
      var item = document.createElement('div');
      item.className = 'nav-municipal-item';
      item.textContent = m.name;
      municipalitiesListEl.appendChild(item);
    });
    municipalitiesTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = municipalitiesDropdown.classList.toggle('is-open');
      municipalitiesTrigger.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', function (e) {
      if (!municipalitiesTrigger.contains(e.target) && !municipalitiesDropdown.contains(e.target)) {
        municipalitiesDropdown.classList.remove('is-open');
        municipalitiesTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Nav: three-dot menu toggle
  const navTrigger = document.querySelector('.nav-menu-trigger');
  const navButtons = document.getElementById('nav-dropdown');
  if (navTrigger && navButtons) {
    navTrigger.addEventListener('click', function () {
      const isOpen = navButtons.classList.toggle('is-open');
      navTrigger.setAttribute('aria-expanded', isOpen);
      navTrigger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('click', function (e) {
      if (!navTrigger.contains(e.target) && !navButtons.contains(e.target)) {
        navButtons.classList.remove('is-open');
        navTrigger.setAttribute('aria-expanded', 'false');
        navTrigger.setAttribute('aria-label', 'Open menu');
      }
    });
    navButtons.querySelectorAll('.nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navButtons.classList.remove('is-open');
        navTrigger.setAttribute('aria-expanded', 'false');
        navTrigger.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Carousel dots: sync with 15s animation (3 slides, 5s each)
  const dots = document.querySelectorAll('.carousel-dot');
  if (dots.length) {
    let idx = 0;
    setInterval(function () {
      dots.forEach(function (d) { d.classList.remove('active'); });
      dots[idx].classList.add('active');
      idx = (idx + 1) % dots.length;
    }, 5000);
  }

  var supabaseCfg = window.SAMELCO_SUPABASE || {};
  const tabs = document.querySelectorAll('.tab');
  const loginForm = document.getElementById('login-form');
  const teamLoginForm = document.getElementById('team-login-form');
  const personnelLoginForm = document.getElementById('personnel-login-form');
  const signupForm = document.getElementById('signup-form');
  const loginEmailEl = document.getElementById('login-email');
  const loginPasswordEl = document.getElementById('login-password');
  const teamLoginEmailEl = document.getElementById('team-login-email');
  const teamLoginPasswordEl = document.getElementById('team-login-password');
  const personnelLoginEmailEl = document.getElementById('personnel-login-email');
  const personnelLoginPasswordEl = document.getElementById('personnel-login-password');
  const signupNameEl = document.getElementById('signup-name');
  const signupEmailEl = document.getElementById('signup-email');
  const signupContactEl = document.getElementById('signup-contact');
  const signupAccountNumberEl = document.getElementById('signup-account-number');
  const signupMunicipalityEl = document.getElementById('signup-municipality');
  const signupBarangayEl = document.getElementById('signup-barangay');
  const signupPasswordEl = document.getElementById('signup-password');
  const signupConfirmPasswordEl = document.getElementById('signup-confirm-password');
  const authForms = [
    { key: 'login', form: loginForm },
    { key: 'team', form: teamLoginForm },
    { key: 'personnel', form: personnelLoginForm },
    { key: 'signup', form: signupForm }
  ];

  function fillSelectOptions(selectEl, values, placeholder) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    var emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = placeholder;
    emptyOpt.selected = true;
    emptyOpt.disabled = true;
    emptyOpt.hidden = true;
    selectEl.appendChild(emptyOpt);

    values.forEach(function (value) {
      var opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      selectEl.appendChild(opt);
    });
  }

  function onSignupMunicipalityChange() {
    if (!signupMunicipalityEl || !signupBarangayEl) return;
    var selected = signupMunicipalityEl.value;
    var muni = municipalityDataset.find(function (m) { return m.name === selected; });
    var barangays = muni && Array.isArray(muni.barangays) ? muni.barangays : [];
    var barangayNames = barangays.map(function(b) {
      return (b && typeof b === 'object' && b.name) ? b.name : b;
    });
    fillSelectOptions(signupBarangayEl, barangayNames, 'Select barangay');
    signupBarangayEl.disabled = !barangayNames.length;
    if (!barangayNames.length) signupBarangayEl.value = '';
  }

  function initSignupLocationOptions() {
    if (!signupMunicipalityEl || !signupBarangayEl) return;
    var municipalityNames = municipalityDataset.map(function (m) { return m.name; });
    fillSelectOptions(signupMunicipalityEl, municipalityNames, 'Select municipality');
    fillSelectOptions(signupBarangayEl, [], 'Select barangay');
    signupBarangayEl.disabled = true;
    signupMunicipalityEl.addEventListener('change', onSignupMunicipalityChange);
  }

  function activateAuthTab(target) {
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === target);
    });
    authForms.forEach(function (entry) {
      if (!entry.form) return;
      var isActive = entry.key === target;
      entry.form.classList.toggle('active', isActive);
      entry.form.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function setCustomerSession(user) {
    if (!user || typeof user !== 'object') return;
    localStorage.setItem('userName', user.full_name || user.email || 'Customer');
    localStorage.setItem('userRole', 'user');
    localStorage.removeItem('teamSession');
    localStorage.removeItem('personnelSession');
    localStorage.setItem('customerSession', JSON.stringify({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      contact_number: user.contact_number || '',
      account_number: user.account_number || '',
      municipality: user.municipality || '',
      barangay: user.barangay || '',
      created_at: user.created_at || '',
      last_login_at: user.last_login_at || ''
    }));
  }

  function setTeamSession(team) {
    if (!team || typeof team !== 'object') return;
    localStorage.setItem('userName', team.team_name || team.dashboard_email || 'Team');
    localStorage.setItem('userRole', 'team');
    localStorage.removeItem('customerSession');
    localStorage.removeItem('personnelSession');
    localStorage.setItem('teamSession', JSON.stringify({
      team_id: team.team_id,
      team_name: team.team_name,
      dashboard_email: team.dashboard_email || '',
      description: team.description || '',
      is_active: typeof team.is_active === 'boolean' ? team.is_active : true,
      created_at: team.created_at || '',
      last_login_at: team.last_login_at || ''
    }));
  }

  function setPersonnelSession(personnel) {
    if (!personnel || typeof personnel !== 'object') return;
    localStorage.setItem('userName', personnel.full_name || personnel.email || 'Personnel');
    localStorage.setItem('userRole', 'personnel');
    localStorage.removeItem('customerSession');
    localStorage.removeItem('teamSession');
    localStorage.setItem('personnelSession', JSON.stringify({
      id: personnel.id,
      full_name: personnel.full_name,
      email: personnel.email || '',
      team_id: personnel.team_id || '',
      team_name: personnel.team_name || '',
      is_active: typeof personnel.is_active === 'boolean' ? personnel.is_active : true,
      created_at: personnel.created_at || '',
      last_login_at: personnel.last_login_at || ''
    }));
  }

  function extractRpcErrorMessage(payload, status) {
    if (payload && typeof payload === 'object') {
      if (payload.message) return String(payload.message);
      if (payload.error) return String(payload.error);
      if (payload.hint) return String(payload.hint);
    }
    if (typeof payload === 'string' && payload.trim()) return payload.trim();
    return 'HTTP ' + status;
  }

  async function callSupabaseRpc(functionName, payload) {
    if (!supabaseCfg.url || !supabaseCfg.anonKey) {
      throw new Error('Supabase config is missing.');
    }
    var response = await fetch(supabaseCfg.url + '/rest/v1/rpc/' + functionName, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseCfg.anonKey,
        Authorization: 'Bearer ' + supabaseCfg.anonKey
      },
      body: JSON.stringify(payload)
    });
    var rawText = '';
    try { rawText = await response.text(); } catch (e) {}
    var parsed = null;
    if (rawText) {
      try { parsed = JSON.parse(rawText); } catch (e) { parsed = rawText; }
    }
    if (!response.ok) {
      throw new Error(extractRpcErrorMessage(parsed, response.status));
    }
    return parsed;
  }

  function getFirstRow(data) {
    if (Array.isArray(data)) return data[0] || null;
    return data && typeof data === 'object' ? data : null;
  }

  function buildCustomerAuthErrorMessage(err, fallback) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg) return fallback;
    if (/Supabase config is missing/i.test(msg)) {
      return 'Customer login is not configured on this page.';
    }
    if (/register_customer_user|login_customer_user|not find the function|404/i.test(msg)) {
      return 'Customer auth SQL is missing. Run the customer auth migration in Supabase first.';
    }
    if (/already registered/i.test(msg)) {
      return msg;
    }
    if (/invalid email or password/i.test(msg)) {
      return 'Invalid email or password.';
    }
    if (/inactive/i.test(msg)) {
      return msg;
    }
    return fallback + ': ' + msg;
  }

  function buildTeamAuthErrorMessage(err, fallback) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg) return fallback;
    if (/Supabase config is missing/i.test(msg)) {
      return 'Team login is not configured on this page.';
    }
    if (/login_team_dashboard|not find the function|404/i.test(msg)) {
      return 'Team dashboard SQL is missing. Run sql/migrations/20260324_add_team_dashboard_accounts.sql in Supabase first.';
    }
    if (/invalid email or password/i.test(msg)) {
      return 'Invalid team email or password.';
    }
    if (/inactive/i.test(msg)) {
      return msg;
    }
    return fallback + ': ' + msg;
  }

  function buildPersonnelAuthErrorMessage(err, fallback) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg) return fallback;
    if (/Supabase config is missing/i.test(msg)) {
      return 'Personnel login is not configured on this page.';
    }
    if (/login_personnel_account|not find the function|404/i.test(msg)) {
      return 'Personnel SQL is missing. Run sql/migrations/20260324_add_personnel_accounts.sql in Supabase first.';
    }
    if (/invalid email or password/i.test(msg)) {
      return 'Invalid personnel email or password.';
    }
    if (/inactive/i.test(msg)) {
      return msg;
    }
    return fallback + ': ' + msg;
  }

  initSignupLocationOptions();

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateAuthTab(this.getAttribute('data-tab'));
    });
  });

  activateAuthTab('login');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = loginEmailEl ? loginEmailEl.value.trim() : '';
      const normalizedEmail = email.toLowerCase();
      const password = loginPasswordEl ? loginPasswordEl.value : '';

      if (normalizedEmail === 'admin' && password === 'admin123') {
        localStorage.setItem('userName', 'Admin');
        localStorage.setItem('userRole', 'admin');
        localStorage.removeItem('customerSession');
        localStorage.removeItem('teamSession');
        localStorage.removeItem('personnelSession');
        window.location.href = 'dashboard.html';
        return;
      }

      try {
        var loginResult = await callSupabaseRpc('login_customer_user', {
          p_email: normalizedEmail,
          p_password: password
        });
        console.log('Login result:', loginResult);
        var user = getFirstRow(loginResult);
        if (!user) {
          console.error('No user found in login result');
          throw new Error('Invalid email or password');
        }
        setCustomerSession(user);
        window.location.href = 'user-dashboard.html';
      } catch (err) {
        console.error('Login error:', err);
        alert(buildCustomerAuthErrorMessage(err, 'Failed to login'));
      }
    });
  }

  if (teamLoginForm) {
    teamLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = teamLoginEmailEl ? teamLoginEmailEl.value.trim() : '';
      const normalizedEmail = email.toLowerCase();
      const password = teamLoginPasswordEl ? teamLoginPasswordEl.value : '';

      try {
        var loginResult = await callSupabaseRpc('login_team_dashboard', {
          p_email: normalizedEmail,
          p_password: password
        });
        var team = getFirstRow(loginResult);
        if (!team) {
          throw new Error('Invalid email or password');
        }
        setTeamSession(team);
        window.location.href = 'team-dashboard.html';
      } catch (err) {
        alert(buildTeamAuthErrorMessage(err, 'Failed to login to the team dashboard'));
      }
    });
  }

  if (personnelLoginForm) {
    personnelLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = personnelLoginEmailEl ? personnelLoginEmailEl.value.trim() : '';
      const normalizedEmail = email.toLowerCase();
      const password = personnelLoginPasswordEl ? personnelLoginPasswordEl.value : '';

      try {
        var loginResult = await callSupabaseRpc('login_personnel_account', {
          p_email: normalizedEmail,
          p_password: password
        });
        var personnel = getFirstRow(loginResult);
        if (!personnel) {
          throw new Error('Invalid email or password');
        }
        setPersonnelSession(personnel);
        window.location.href = 'personnel-dashboard.html';
      } catch (err) {
        alert(buildPersonnelAuthErrorMessage(err, 'Failed to login to the personnel dashboard'));
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = signupNameEl ? signupNameEl.value.trim() : '';
      const email = signupEmailEl ? signupEmailEl.value.trim() : '';
      const normalizedEmail = email.toLowerCase();
      const contactNumber = signupContactEl ? signupContactEl.value.trim() : '';
      const accountNumber = signupAccountNumberEl ? signupAccountNumberEl.value.trim() : '';
      const municipality = signupMunicipalityEl ? signupMunicipalityEl.value : '';
      const barangay = signupBarangayEl ? signupBarangayEl.value : '';
      const password = signupPasswordEl ? signupPasswordEl.value : '';
      const confirmPassword = signupConfirmPasswordEl ? signupConfirmPasswordEl.value : '';

      if (!name || !normalizedEmail || !contactNumber || !accountNumber || !municipality || !barangay) {
        alert('Please complete all customer registration fields.');
        return;
      }
      if (password.length < 8) {
        alert('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      try {
        var registerResult = await callSupabaseRpc('register_customer_user', {
          p_full_name: name,
          p_email: normalizedEmail,
          p_password: password,
          p_account_number: accountNumber,
          p_contact_number: contactNumber,
          p_municipality: municipality,
          p_barangay: barangay
        });
        var createdUser = getFirstRow(registerResult);
        if (!createdUser) {
          throw new Error('Account creation failed');
        }
        setCustomerSession(createdUser);
        signupForm.reset();
        fillSelectOptions(signupBarangayEl, [], 'Select barangay');
        if (signupBarangayEl) signupBarangayEl.disabled = true;
        alert('Customer account created successfully.');
        window.location.href = 'user-dashboard.html';
      } catch (err) {
        alert(buildCustomerAuthErrorMessage(err, 'Failed to create customer account'));
      }
    });
  }
});
