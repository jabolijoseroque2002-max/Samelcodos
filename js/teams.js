document.addEventListener('DOMContentLoaded', function () {
  // Check if user is logged in
  var userName = localStorage.getItem('userName');
  var userRole = localStorage.getItem('userRole') || '';
  if (!userName) {
    window.location.href = 'index.html';
    return;
  }
  if (userRole !== 'admin') {
    window.location.href = userRole === 'team'
      ? 'team-dashboard.html'
      : (userRole === 'personnel'
        ? 'personnel-dashboard.html'
        : (userRole === 'user' ? 'user-dashboard.html' : 'index.html'));
    return;
  }

  // Display user name
  document.getElementById('user-name').textContent = userName;

  // Logout functionality
  function logout() {
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('teamSession');
    localStorage.removeItem('customerSession');
    localStorage.removeItem('personnelSession');
    window.location.href = 'index.html';
  }

  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  var supabaseCfg = window.SAMELCO_SUPABASE || {};
  var teamsGrid = document.getElementById('teams-grid');
  var addTeamBtn = document.getElementById('add-team-btn');
  var teamModal = document.getElementById('team-modal');
  var cancelTeamBtn = document.getElementById('cancel-team-btn');
  var saveTeamBtn = document.getElementById('save-team-btn');
  var newTeamNameInput = document.getElementById('new-team-name');
  var newTeamDescriptionInput = document.getElementById('new-team-description');
  var newTeamDashboardEmailInput = document.getElementById('new-team-dashboard-email');
  var newTeamDashboardPasswordInput = document.getElementById('new-team-dashboard-password');
  var newTeamDashboardConfirmPasswordInput = document.getElementById('new-team-dashboard-confirm-password');

  // Team Descriptions Data
  var teamInfoData = {
    'Customer Service / Member Services': {
      icon: '📞',
      subtitle: 'First point of contact',
      handles: [
        'General complaints',
        'Billing concerns',
        'Service requests'
      ],
      note: 'They will forward your concern to the right technical team.'
    },
    'Technical / Engineering Department': {
      icon: '⚡',
      subtitle: 'System engineering & planning',
      handles: [
        'Power outages',
        'Line problems (broken wires, leaning poles)',
        'Transformer issues'
      ],
      note: 'This team usually dispatches linemen to fix the problem.'
    },
    'Operations / Line Crew (Emergency Team)': {
      icon: '🚨',
      subtitle: '24/7 Emergency response',
      handles: [
        'Sudden blackout',
        'Fallen electric posts',
        'Live wires (very dangerous ⚠️)'
      ],
      note: 'Available 24/7 in most cases.'
    },
    'Maintenance Team': {
      icon: '💡',
      subtitle: 'Preventive & scheduled work',
      handles: [
        'Scheduled repairs',
        'Preventive maintenance',
        'Vegetation clearing (trees touching wires)'
      ]
    },
    'Inspection': {
      icon: '🔍',
      subtitle: 'Compliance & monitoring',
      handles: [
        'Service connection inspection',
        'Meter testing',
        'Compliance audits'
      ]
    }
  };

  var infoModal = document.getElementById('info-modal');
  var closeInfoBtn = document.getElementById('close-info-btn');

  var missionModal = document.getElementById('mission-modal');
  var closeMissionBtn = document.getElementById('close-mission-btn');
  var missionList = document.getElementById('mission-list');
  var missionAddPersonnelBtn = document.getElementById('mission-add-personnel-btn');
  var personnelModal = document.getElementById('personnel-modal');
  var personnelModalTeamLabel = document.getElementById('personnel-modal-team-label');
  var personnelNameInput = document.getElementById('personnel-name-input');
  var personnelEmailInput = document.getElementById('personnel-email-input');
  var personnelPasswordInput = document.getElementById('personnel-password-input');
  var personnelConfirmPasswordInput = document.getElementById('personnel-confirm-password-input');
  var cancelPersonnelBtn = document.getElementById('cancel-personnel-btn');
  var savePersonnelBtn = document.getElementById('save-personnel-btn');

  var allTeams = [];
  var allPersonnel = [];
  var busyTeams = new Map(); // Store team name -> mission count
  var currentFilter = 'all';
  var searchQuery = '';
  var activeMissionTeamName = '';
  var activeMissionTeamId = null;

  var elSearch = document.getElementById('team-search');
  var elTotal = document.getElementById('total-teams-count');
  var elAvailable = document.getElementById('available-teams-count');
  var elBusy = document.getElementById('busy-teams-count');

  function getUserRole() {
    try { return localStorage.getItem('userRole') || 'viewer'; } catch(e){ return 'viewer'; }
  }
  function canManage() {
    return getUserRole() === 'admin';
  }

  // Hide management controls if not admin
  if (!canManage()) {
    if (addTeamBtn) addTeamBtn.style.display = 'none';
  }

  async function loadData() {
    await fetchBusyTeams();
    await loadTeams();
    await loadPersonnel();
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

  function buildTeamDashboardErrorMessage(err, fallback) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg) return fallback;
    if (/Supabase config is missing/i.test(msg)) {
      return 'Supabase is not configured on this page.';
    }
    if (/create_team_with_dashboard_account|not find the function|404/i.test(msg)) {
      return 'Team dashboard SQL is missing. Run sql/migrations/20260324_add_team_dashboard_accounts.sql in Supabase first.';
    }
    if (/already exists|already in use|23505/i.test(msg)) {
      return msg;
    }
    if (/password must be at least 8/i.test(msg)) {
      return msg;
    }
    if (/valid dashboard email is required/i.test(msg)) {
      return msg;
    }
    return fallback + ': ' + msg;
  }

  function resetNewTeamForm() {
    if (newTeamNameInput) newTeamNameInput.value = '';
    if (newTeamDescriptionInput) newTeamDescriptionInput.value = '';
    if (newTeamDashboardEmailInput) newTeamDashboardEmailInput.value = '';
    if (newTeamDashboardPasswordInput) newTeamDashboardPasswordInput.value = '';
    if (newTeamDashboardConfirmPasswordInput) newTeamDashboardConfirmPasswordInput.value = '';
  }

  function buildPersonnelErrorMessage(err, fallback) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg) return fallback;
    if (/create_personnel_account|login_personnel_account|assign_report_personnel|not find the function|404/i.test(msg)) {
      return 'Personnel SQL is missing. Run sql/migrations/20260324_add_personnel_accounts.sql in Supabase first.';
    }
    if (/already in use|already exists/i.test(msg)) return msg;
    if (/valid personnel email is required|password must be at least 8|selected personnel was not found|inactive|assign a team to the report before assigning personnel|does not belong to an assigned team|not linked to a team/i.test(msg)) return msg;
    return fallback + ': ' + msg;
  }

  function normalizeLookup(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getTeamByName(teamName) {
    var normalized = normalizeLookup(teamName);
    return allTeams.find(function(team) {
      return normalizeLookup(team && team.name) === normalized;
    }) || null;
  }

  function getPersonnelForTeam(teamName) {
    var team = getTeamByName(teamName);
    if (!team || !team.id) return [];
    return allPersonnel.filter(function(person) {
      return Number(person && person.team_id) === Number(team.id);
    });
  }

  function resetPersonnelForm() {
    if (personnelNameInput) personnelNameInput.value = '';
    if (personnelEmailInput) personnelEmailInput.value = '';
    if (personnelPasswordInput) personnelPasswordInput.value = '';
    if (personnelConfirmPasswordInput) personnelConfirmPasswordInput.value = '';
  }

  function openPersonnelModal(teamName) {
    var team = getTeamByName(teamName || activeMissionTeamName);
    if (!team || !team.id) {
      alert('Team details could not be found for personnel creation.');
      return;
    }
    activeMissionTeamName = team.name;
    activeMissionTeamId = Number(team.id);
    resetPersonnelForm();
    if (personnelModalTeamLabel) {
      personnelModalTeamLabel.textContent = 'Create a personnel account for ' + team.name + '.';
    }
    if (personnelModal) personnelModal.style.display = 'block';
  }

  function closePersonnelModal() {
    resetPersonnelForm();
    if (personnelModal) personnelModal.style.display = 'none';
  }

  function buildPersonnelSelectHtml(teamName, assignmentRows) {
    var people = getPersonnelForTeam(teamName);
    var assignedLookup = {};
    (assignmentRows || []).forEach(function(assignment) {
      assignedLookup[String(assignment.personnel_id)] = assignment;
    });

    if (!people.length) {
      return '<div class="mission-assign-empty">No personnel added yet for this team.</div>';
    }

    return '<div class="mission-assign-checklist">' + people.map(function(person) {
      var personId = String(person.id);
      var assignment = assignedLookup[personId] || null;
      return '<label class="mission-assign-option' + (assignment && assignment.assignment_status === 'done' ? ' is-done' : '') + '">' +
        '<input type="checkbox" class="mission-assign-checkbox" value="' + escapeHtml(personId) + '"' + (assignment ? ' checked' : '') + '>' +
        '<span class="mission-assign-option-name">' + escapeHtml(person.full_name || 'Unnamed personnel') + '</span>' +
        (assignment ? '<span class="mission-assign-option-state is-' + escapeHtml(assignment.assignment_status) + '">' + escapeHtml(assignment.assignment_status === 'done' ? 'Done' : 'Assigned') + '</span>' : '') +
      '</label>';
    }).join('') + '</div>';
  }

  function buildAssignedPersonnelSummaryHtml(assignmentRows, fallbackText) {
    if (Array.isArray(assignmentRows) && assignmentRows.length) {
      return '<div class="mission-assigned-summary">' + assignmentRows.map(function(assignment) {
        return '<span class="mission-assigned-chip is-' + escapeHtml(assignment.assignment_status) + '">' +
          escapeHtml(assignment.full_name || ('Personnel #' + assignment.personnel_id)) +
          ' - ' + escapeHtml(assignment.assignment_status === 'done' ? 'Done' : 'Assigned') +
        '</span>';
      }).join('') + '</div>';
    }
    return '<div class="mission-assigned-to">No one assigned yet</div>';
  }

  async function loadMissionAssignments(reportIds, teamId) {
    if (!supabaseCfg.url || !supabaseCfg.anonKey || !Array.isArray(reportIds) || !reportIds.length) {
      return {};
    }

    try {
      var res = await fetch(
        supabaseCfg.url + '/rest/v1/report_personnel_assignments?select=report_id,personnel_id,assignment_status,done_at,updated_at,personnel:personnel_id(id,full_name,team_id,is_active)&report_id=in.(' + reportIds.join(',') + ')&order=updated_at.desc',
        {
          headers: {
            apikey: supabaseCfg.anonKey,
            Authorization: 'Bearer ' + supabaseCfg.anonKey
          }
        }
      );
      if (!res.ok) throw new Error('Failed to load personnel assignments');

      var rows = await res.json();
      var assignmentsByReport = {};
      (Array.isArray(rows) ? rows : []).forEach(function(row) {
        var personnelRow = row && row.personnel && !Array.isArray(row.personnel) ? row.personnel : null;
        if (personnelRow && Number(personnelRow.team_id || 0) !== Number(teamId || 0)) return;

        var reportKey = String(row && row.report_id || '');
        if (!reportKey) return;
        if (!assignmentsByReport[reportKey]) assignmentsByReport[reportKey] = [];
        assignmentsByReport[reportKey].push({
          report_id: Number(row.report_id),
          personnel_id: Number(row.personnel_id),
          assignment_status: String(row.assignment_status || 'assigned').toLowerCase() === 'done' ? 'done' : 'assigned',
          done_at: row.done_at || '',
          updated_at: row.updated_at || '',
          full_name: personnelRow && personnelRow.full_name ? personnelRow.full_name : 'Personnel #' + row.personnel_id
        });
      });

      Object.keys(assignmentsByReport).forEach(function(reportKey) {
        assignmentsByReport[reportKey].sort(function(a, b) {
          return String(a.full_name || '').localeCompare(String(b.full_name || ''));
        });
      });

      return assignmentsByReport;
    } catch (err) {
      console.error('Error loading mission assignments:', err);
      return {};
    }
  }

  async function loadPersonnel() {
    if (!supabaseCfg.url || !supabaseCfg.anonKey) return;
    try {
      var res = await fetch(supabaseCfg.url + '/rest/v1/personnel?select=*&order=full_name.asc', {
        headers: {
          apikey: supabaseCfg.anonKey,
          Authorization: 'Bearer ' + supabaseCfg.anonKey
        }
      });
      if (!res.ok) return;
      allPersonnel = await res.json();
      updatePersonnelUI();
    } catch (err) {
      console.error('Error loading personnel:', err);
    }
  }

  function updatePersonnelUI() {
    // Personnel controls are rendered dynamically inside mission cards.
  }

  async function fetchBusyTeams() {
    if (!supabaseCfg.url || !supabaseCfg.anonKey || !supabaseCfg.reportsTable) return;
    try {
      var res = await fetch(supabaseCfg.url + '/rest/v1/' + supabaseCfg.reportsTable + '?select=assigned_team&status=neq.resolved', {
        headers: {
          apikey: supabaseCfg.anonKey,
          Authorization: 'Bearer ' + supabaseCfg.anonKey
        }
      });
      if (!res.ok) return;
      var rows = await res.json();
      busyTeams.clear();
      (rows || []).forEach(function(r) {
        if (r.assigned_team) {
          String(r.assigned_team).split(',').forEach(function(teamName) {
            var trimmedName = teamName.trim();
            if (trimmedName) {
              busyTeams.set(trimmedName, (busyTeams.get(trimmedName) || 0) + 1);
            }
          });
        }
      });
    } catch (err) {
      console.error('Error fetching busy teams:', err);
    }
  }

  async function loadTeams() {
    if (!supabaseCfg.url || !supabaseCfg.anonKey) return;
    try {
      var res = await fetch(supabaseCfg.url + '/rest/v1/teams?select=*&order=name.asc', {
        headers: {
          apikey: supabaseCfg.anonKey,
          Authorization: 'Bearer ' + supabaseCfg.anonKey
        }
      });
      if (!res.ok) return;
      allTeams = await res.json();
      updateStats();
      renderTeams();
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  }

  function updateStats() {
    var total = allTeams.length;
    var busyCount = 0;
    var availableCount = 0;

    allTeams.forEach(function(team) {
      if (busyTeams.has(String(team.name).trim())) busyCount++;
      else availableCount++;
    });

    if (elTotal) elTotal.textContent = total;
    if (elAvailable) elAvailable.textContent = availableCount;
    if (elBusy) elBusy.textContent = busyCount;
  }

  function renderTeams() {
    if (!teamsGrid) return;
    teamsGrid.innerHTML = '';
    
    var filteredTeams = allTeams.filter(function(team) {
      var nameMatch = !searchQuery || team.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!nameMatch) return false;

      if (currentFilter === 'all') return true;
      var isBusy = busyTeams.has(String(team.name).trim());
      if (currentFilter === 'available') return !isBusy;
      if (currentFilter === 'unavailable') return isBusy;
      return true;
    });

    if (filteredTeams.length === 0) {
      teamsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748b; background: rgba(255,255,255,0.5); border-radius: 20px;">No teams found matching your criteria.</div>';
      return;
    }

    filteredTeams.forEach(function(team) {
      var missionCount = busyTeams.get(String(team.name).trim()) || 0;
      var isBusy = missionCount > 0;
      var card = document.createElement('div');
      card.className = 'team-card' + (isBusy ? ' is-busy' : '');
      
      var statusClass = team.is_active ? 'badge-active' : 'badge-inactive';
      var statusText = team.is_active ? 'Active' : 'Inactive';
      
      var availClass = isBusy ? 'badge-busy' : 'badge-available';
      var availText = isBusy ? 'On Mission' : 'Available';
      var dashboardReady = !!team.has_dashboard_login;
      var dashboardBadgeClass = dashboardReady ? 'badge-available' : 'badge-inactive';
      var dashboardBadgeText = dashboardReady ? 'Dashboard Ready' : 'No Dashboard Login';

      var actionsHtml = '';
      if (canManage()) {
        actionsHtml = 
          '<div class="team-card-actions">' +
            '<button type="button" class="team-btn team-btn-toggle toggle-status-btn" data-id="' + team.id + '" data-active="' + team.is_active + '">' +
              (team.is_active ? 'Deactivate' : 'Activate') +
            '</button>' +
            '<button type="button" class="team-btn team-btn-delete delete-team-btn" data-id="' + team.id + '">Delete</button>' +
          '</div>';
      }

      var info = teamInfoData[team.name] || { icon: '👥' };

      card.innerHTML = 
        '<div class="team-card-header">' +
          '<div style="display:flex; justify-content: space-between; align-items: flex-start; width: 100%;">' +
            '<div>' +
              '<div style="font-size: 2rem; margin-bottom: 0.5rem;">' + info.icon + '</div>' +
              '<h3 class="team-card-title">' + escapeHtml(team.name) + '</h3>' +
            '</div>' +
            '<button type="button" class="team-info-btn" data-name="' + escapeHtml(team.name) + '" title="View Team Responsibilities">ℹ️</button>' +
          '</div>' +
        '</div>' +
        '<div class="team-card-badges">' +
          '<span class="team-badge ' + statusClass + '">' + statusText + '</span>' +
          '<span class="team-badge ' + availClass + '">' + availText + '</span>' +
          '<span class="team-badge ' + dashboardBadgeClass + '">' + dashboardBadgeText + '</span>' +
        '</div>' +
        (isBusy ? '<div class="team-assignment-info"><span class="mission-count">' + missionCount + '</span> Active mission' + (missionCount > 1 ? 's' : '') + '</div>' : '<div class="team-assignment-info">No active missions</div>') +
        '<div style="margin-top:0.85rem; font-size:0.92rem; color:#475569; line-height:1.5;">' +
          (team.dashboard_email
            ? 'Dashboard email: <strong style="color:#0f172a;">' + escapeHtml(team.dashboard_email) + '</strong>'
            : 'Dashboard email not set yet.') +
        '</div>' +
        actionsHtml;
      
      teamsGrid.appendChild(card);
    });

    // Bind actions
    document.querySelectorAll('.team-assignment-info').forEach(function(el) {
      if (el.querySelector('.mission-count')) {
        el.addEventListener('click', function() {
          var teamName = this.closest('.team-card').querySelector('.team-card-title').textContent;
          showActiveMissions(teamName);
        });
      }
    });

    document.querySelectorAll('.team-info-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        showTeamInfo(btn.getAttribute('data-name'));
      });
    });

    document.querySelectorAll('.toggle-status-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        toggleTeamStatus(btn.getAttribute('data-id'), btn.getAttribute('data-active') === 'true');
      });
    });

    document.querySelectorAll('.delete-team-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this team?')) {
          deleteTeam(btn.getAttribute('data-id'));
        }
      });
    });
  }

  if (elSearch) {
    elSearch.addEventListener('input', function() {
      searchQuery = this.value.trim();
      renderTeams();
    });
  }

  document.querySelectorAll('.team-filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.team-filter-btn').forEach(function(b) { b.classList.remove('is-active'); });
      this.classList.add('is-active');
      currentFilter = this.getAttribute('data-filter');
      renderTeams();
    });
  });

  function showTeamInfo(teamName) {
    if (!infoModal) return;
    var info = teamInfoData[teamName];
    if (!info) {
      alert('Detailed info for this team is not yet available.');
      return;
    }

    var titleEl = document.getElementById('info-title');
    var subEl = document.getElementById('info-subtitle');
    var listEl = document.getElementById('info-handles-list');
    var noteEl = document.getElementById('info-note');

    if (titleEl) titleEl.textContent = (info.icon || '') + ' ' + teamName;
    if (subEl) subEl.textContent = info.subtitle || '';
    
    if (listEl) {
      listEl.innerHTML = '';
      (info.handles || []).forEach(function(h) {
        var li = document.createElement('li');
        li.textContent = h;
        listEl.appendChild(li);
      });
    }

    if (noteEl) {
      noteEl.textContent = info.note || '';
      noteEl.style.display = info.note ? 'block' : 'none';
    }

    infoModal.style.display = 'block';
  }

  if (closeInfoBtn) {
    closeInfoBtn.addEventListener('click', function() {
      infoModal.style.display = 'none';
    });
  }

  async function showActiveMissions(teamName) {
    if (!missionModal || !missionList) return;
    var team = getTeamByName(teamName);
    activeMissionTeamName = teamName;
    activeMissionTeamId = team && team.id ? Number(team.id) : null;
    missionList.innerHTML = '<div style="text-align:center; padding:2rem; color:#64748b;">Loading missions...</div>';
    missionModal.style.display = 'block';
    
    document.getElementById('mission-modal-title').textContent = teamName;
    document.getElementById('mission-modal-subtitle').textContent = 'Managing active missions';

    try {
      // Fetch active reports for this team
      var res = await fetch(supabaseCfg.url + '/rest/v1/' + supabaseCfg.reportsTable + '?select=*&status=neq.resolved&assigned_team=ilike.*' + encodeURIComponent(teamName) + '*', {
        headers: {
          apikey: supabaseCfg.anonKey,
          Authorization: 'Bearer ' + supabaseCfg.anonKey
        }
      });
      if (!res.ok) throw new Error('Failed to fetch missions');
      var missions = await res.json();
      
      missionList.innerHTML = '';
      if (missions.length === 0) {
        missionList.innerHTML = '<div style="text-align:center; padding:2rem; color:#64748b;">No active missions found for this team.</div>';
        return;
      }

      var missionAssignments = await loadMissionAssignments(
        missions.map(function(m) { return Number(m.id); }).filter(Boolean),
        activeMissionTeamId
      );

      missions.forEach(function(m) {
        var item = document.createElement('div');
        item.className = 'mission-item';
        var assignmentRows = missionAssignments[String(m.id)] || [];
        var assignedHtml = buildAssignedPersonnelSummaryHtml(assignmentRows, m.assigned_personnel || '');

        item.innerHTML = 
          '<div class="mission-item-header">' +
            '<div>' +
              '<span class="mission-queue">#' + (m.queue_number || m.id) + '</span>' +
              '<div class="mission-issue">' + escapeHtml(m.issue_type) + '</div>' +
              '<div>' + assignedHtml + '</div>' +
            '</div>' +
            '<span class="team-badge badge-active" style="font-size:0.7rem;">' + escapeHtml(m.status) + '</span>' +
          '</div>' +
          '<div class="mission-location">Location: ' + escapeHtml(m.municipality) + ', ' + escapeHtml(m.barangay) + '</div>' +
          '<div class="mission-assign-wrap">' +
            buildPersonnelSelectHtml(teamName, assignmentRows) +
            '<button type="button" class="mission-save-btn" data-id="' + m.id + '">Assign</button>' +
          '</div>';
        
        missionList.appendChild(item);
      });

      // Bind save buttons
      missionList.querySelectorAll('.mission-save-btn').forEach(function(btn) {
        btn.addEventListener('click', async function() {
          var reportId = btn.getAttribute('data-id');
          var selectedIds = Array.from(btn.closest('.mission-item').querySelectorAll('.mission-assign-checkbox:checked'))
            .map(function(input) { return Number(input.value); })
            .filter(function(value) { return !!value; });
          
          btn.disabled = true;
          btn.textContent = 'Saving...';
          
          try {
            await callSupabaseRpc('assign_report_personnel', {
              p_report_id: Number(reportId),
              p_personnel_ids: selectedIds
            });
            await showActiveMissions(teamName);
          } catch (err) {
            console.error('Save error:', err);
            alert(buildPersonnelErrorMessage(err, 'Failed to save personnel assignment'));
            btn.textContent = 'Assign';
            btn.disabled = false;
          }
        });
      });

    } catch (err) {
      console.error('Fetch error:', err);
      missionList.innerHTML = '<div style="text-align:center; padding:2rem; color:#ef4444;">Failed to load missions.</div>';
    }
  }

  if (closeMissionBtn) {
    closeMissionBtn.addEventListener('click', function() {
      missionModal.style.display = 'none';
    });
  }

  async function savePersonnelAccount() {
    var fullName = personnelNameInput ? personnelNameInput.value.trim() : '';
    var email = personnelEmailInput ? personnelEmailInput.value.trim().toLowerCase() : '';
    var password = personnelPasswordInput ? personnelPasswordInput.value : '';
    var confirmPassword = personnelConfirmPasswordInput ? personnelConfirmPasswordInput.value : '';

    if (!activeMissionTeamId) {
      alert('Please open a team mission board first.');
      return;
    }
    if (!fullName || !email || !password || !confirmPassword) {
      alert('Please complete all personnel fields.');
      return;
    }
    if (password.length < 8) {
      alert('Personnel password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Personnel passwords do not match.');
      return;
    }

    var originalText = savePersonnelBtn ? savePersonnelBtn.textContent : 'Save Personnel';
    try {
      if (savePersonnelBtn) {
        savePersonnelBtn.disabled = true;
        savePersonnelBtn.textContent = 'Saving...';
      }
      await callSupabaseRpc('create_personnel_account', {
        p_full_name: fullName,
        p_email: email,
        p_password: password,
        p_team_id: Number(activeMissionTeamId)
      });
      await loadPersonnel();
      closePersonnelModal();
      if (activeMissionTeamName) {
        await showActiveMissions(activeMissionTeamName);
      }
      alert('Personnel account created successfully.');
    } catch (err) {
      alert(buildPersonnelErrorMessage(err, 'Failed to create personnel account'));
    } finally {
      if (savePersonnelBtn) {
        savePersonnelBtn.disabled = false;
        savePersonnelBtn.textContent = originalText;
      }
    }
  }

  if (missionAddPersonnelBtn) {
    missionAddPersonnelBtn.addEventListener('click', function() {
      openPersonnelModal(activeMissionTeamName);
    });
  }

  if (cancelPersonnelBtn) {
    cancelPersonnelBtn.addEventListener('click', closePersonnelModal);
  }

  if (savePersonnelBtn) {
    savePersonnelBtn.addEventListener('click', savePersonnelAccount);
  }

  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === teamModal) {
      teamModal.style.display = 'none';
    }
    if (event.target === infoModal) {
      infoModal.style.display = 'none';
    }
    if (event.target === missionModal) {
      missionModal.style.display = 'none';
    }
    if (event.target === personnelModal) {
      closePersonnelModal();
    }
  });

  async function toggleTeamStatus(id, currentActive) {
    try {
      var res = await fetch(supabaseCfg.url + '/rest/v1/teams?id=eq.' + id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseCfg.anonKey,
          Authorization: 'Bearer ' + supabaseCfg.anonKey
        },
        body: JSON.stringify({ is_active: !currentActive })
      });
      if (res.ok) {
        await loadData();
      } else {
        var err = await res.json();
        console.error('Toggle failed:', err);
        alert('Failed to update team status: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Toggle error:', err);
      alert('Failed to update team status');
    }
  }

  async function deleteTeam(id) {
    try {
      var res = await fetch(supabaseCfg.url + '/rest/v1/teams?id=eq.' + id, {
        method: 'DELETE',
        headers: {
          apikey: supabaseCfg.anonKey,
          Authorization: 'Bearer ' + supabaseCfg.anonKey
        }
      });
      if (res.ok) {
        await loadData();
      } else {
        var err = await res.json();
        console.error('Delete failed:', err);
        if (err.code === '23503') {
          alert('Cannot delete team because it is referenced in reports. Deactivate it instead.');
        } else {
          alert('Failed to delete team: ' + (err.message || 'Unknown error'));
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete team');
    }
  }

  async function saveNewTeam() {
    var name = newTeamNameInput.value.trim();
    var description = newTeamDescriptionInput ? newTeamDescriptionInput.value.trim() : '';
    var dashboardEmail = newTeamDashboardEmailInput ? newTeamDashboardEmailInput.value.trim().toLowerCase() : '';
    var password = newTeamDashboardPasswordInput ? newTeamDashboardPasswordInput.value : '';
    var confirmPassword = newTeamDashboardConfirmPasswordInput ? newTeamDashboardConfirmPasswordInput.value : '';

    if (!name) {
      alert('Please enter a team name');
      return;
    }
    if (!dashboardEmail || !password || !confirmPassword) {
      alert('Please enter the dashboard email and password for this team.');
      return;
    }
    if (password.length < 8) {
      alert('Dashboard password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Dashboard passwords do not match.');
      return;
    }

    var originalButtonText = saveTeamBtn ? saveTeamBtn.textContent : 'Save Team';
    try {
      if (saveTeamBtn) {
        saveTeamBtn.disabled = true;
        saveTeamBtn.textContent = 'Saving...';
      }

      await callSupabaseRpc('create_team_with_dashboard_account', {
        p_name: name,
        p_dashboard_email: dashboardEmail,
        p_password: password,
        p_description: description || null
      });

      resetNewTeamForm();
      if (teamModal) {
        teamModal.style.display = 'none';
      }
      await loadData();
      alert('Team created successfully. Use "' + dashboardEmail + '" on the Team Login tab.');
    } catch (err) {
      alert(buildTeamDashboardErrorMessage(err, 'Failed to save team'));
    } finally {
      if (saveTeamBtn) {
        saveTeamBtn.disabled = false;
        saveTeamBtn.textContent = originalButtonText;
      }
    }
  }

  if (addTeamBtn) {
    addTeamBtn.addEventListener('click', function() {
      resetNewTeamForm();
      teamModal.style.display = 'block';
    });
  }

  if (cancelTeamBtn) {
    cancelTeamBtn.addEventListener('click', function() {
      resetNewTeamForm();
      teamModal.style.display = 'none';
    });
  }

  if (saveTeamBtn) {
    saveTeamBtn.addEventListener('click', saveNewTeam);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  loadData();
});
