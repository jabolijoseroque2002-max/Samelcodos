document.addEventListener('DOMContentLoaded', function () {
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

  document.getElementById('user-name').textContent = userName;

  document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('teamSession');
    localStorage.removeItem('customerSession');
    localStorage.removeItem('personnelSession');
    window.location.href = 'index.html';
  });

  // navigation helpers
  function handleNavigation(action) {
    if (action === 'records') window.location.href = 'records.html';
    else if (action === 'analytics') { /* already here */ }
    else if (action === 'branches') window.location.href = 'branches.html';
    else if (action === 'teams') window.location.href = 'teams.html';
    else if (action === 'about') window.location.href = 'about.html';
    else if (action === 'contact') window.location.href = 'contact.html';
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
    navDotsDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
    navDotsDropdown.querySelectorAll('.nav-dots-item').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = this.getAttribute('data-action');
        navDotsDropdown.classList.remove('is-open');
        handleNavigation(action);
      });
    });
  }

  // municipality helpers (shared data comes from municipalities-data.js)
  var MUNICIPALITIES = Array.isArray(window.SAMELCO_MUNICIPALITIES) ? window.SAMELCO_MUNICIPALITIES : [];
  function findMunicipalityByName(name) {
    if (!name) return null;
    var lower = String(name).toLowerCase();
    return MUNICIPALITIES.find(function(m){ return (m.name||'').toLowerCase() === lower; }) || null;
  }
  function findMunicipalityByLocationText(text) {
    if (!text) return null;
    var s = String(text).toLowerCase();
    var hit = MUNICIPALITIES.find(function(m){ return s.indexOf((m.name||'').toLowerCase()) !== -1; });
    return hit || null;
  }
  function normalizeMunicipalityName(raw, locationText) {
    var viaName = findMunicipalityByName(raw);
    if (viaName) return viaName.name || '';
    var viaText = findMunicipalityByLocationText(locationText);
    if (viaText) return viaText.name || '';
    return (raw ? String(raw).trim() : '');
  }

  function parseBarangayFromLocationText(text) {
    if (!text) return '';
    var parts = String(text).split(',').map(function(p){ return String(p || '').trim(); }).filter(Boolean);
    if (parts.length >= 2) return parts[parts.length - 2] || '';
    return '';
  }

  function toDayKey(iso) {
    if (!iso) return '';
    var s = String(iso);
    var idx = s.indexOf('T');
    return idx !== -1 ? s.slice(0, idx) : s.slice(0, 10);
  }

  function isResolvedRow(r) {
    var st = String(r.status || '').toLowerCase();
    if (st === 'resolved') return true;
    if (r.resolved_at) return true;
    return false;
  }

  function normalizeReportRow(r) {
    var locTxt = r.location_text || r.location || r.address || '';
    var municipality = normalizeMunicipalityName(r.municipality || '', locTxt);
    var barangay = (r.barangay ? String(r.barangay).trim() : '') || parseBarangayFromLocationText(locTxt) || '';
    return {
      id: r.id,
      created_at: r.created_at || '',
      municipality: municipality || 'Unknown',
      barangay: barangay || 'Not specified',
      issue_type: r.issue_type || r.issue || '',
      description: r.description || '',
      location_text: locTxt,
      status: r.status || 'pending',
      resolved_at: r.resolved_at || ''
    };
  }

  function colorPalette(n) {
    var base = ['#8b2a2a', '#dc2626', '#f59e0b', '#059669', '#3b82f6', '#7c3aed', '#0ea5e9', '#14b8a6', '#f97316', '#ef4444'];
    var out = [];
    for (var i = 0; i < n; i++) out.push(base[i % base.length]);
    return out;
  }

  var elSearch = document.getElementById('analytics-search');
  var elRange = document.getElementById('analytics-range');
  var elMuni = document.getElementById('analytics-muni-filter');
  var elBarangay = document.getElementById('analytics-barangay-filter');
  var elStatus = document.getElementById('analytics-status-filter');
  var elClear = document.getElementById('analytics-clear-filters');

  var elRangeLabel = document.getElementById('analytics-range-label');
  var elActive = document.getElementById('active-problems-count');
  var elResolved = document.getElementById('restored-services-count');
  var elTotal = document.getElementById('total-records-count');
  var elOverdue = document.getElementById('analytics-overdue-count');

  var elTopMunis = document.getElementById('top-municipalities-list');
  var elTopBarangays = document.getElementById('top-barangays-list');
  var elMuniTable = document.getElementById('analytics-municipality-table-rows');

  var elRecentList = document.getElementById('analytics-recent-list');
  var elRecentEmpty = document.getElementById('analytics-recent-empty');

  var allReports = [];
  var perDayChart, topMuniChart, topBarangayChart;

  function setSelectOptions(selectEl, values, leadingLabel) {
    if (!selectEl) return;
    var current = String(selectEl.value || 'all');
    selectEl.innerHTML = '';
    var opt0 = document.createElement('option');
    opt0.value = 'all';
    opt0.textContent = leadingLabel || 'All';
    selectEl.appendChild(opt0);
    values.forEach(function(v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      selectEl.appendChild(opt);
    });
    var canKeep = Array.from(selectEl.options).some(function(o){ return o.value === current; });
    selectEl.value = canKeep ? current : 'all';
  }

  function populateMunicipalityFilter() {
    if (!elMuni) return;
    var names = MUNICIPALITIES.map(function(m){ return m && m.name ? String(m.name) : ''; }).filter(Boolean);
    names.sort(function(a,b){ return a.localeCompare(b); });
    setSelectOptions(elMuni, names, 'All Municipalities');
  }

  function populateBarangayFilter(rows) {
    if (!elBarangay) return;
    var muniVal = elMuni ? String(elMuni.value || 'all') : 'all';
    var set = new Set();
    rows.forEach(function(r) {
      if (muniVal !== 'all' && r.municipality !== muniVal) return;
      if (r.barangay) set.add(r.barangay);
    });
    var vals = Array.from(set).filter(Boolean).sort(function(a,b){ return a.localeCompare(b); });
    setSelectOptions(elBarangay, vals, 'All Barangays');
  }

  function getRangeDays(rangeValue) {
    if (!rangeValue || rangeValue === 'all') return null;
    if (rangeValue === '7d') return 7;
    if (rangeValue === '30d') return 30;
    if (rangeValue === '90d') return 90;
    var m = String(rangeValue).match(/^(\d+)d$/);
    if (m) return Number(m[1]) || null;
    return null;
  }

  function applyFilters(rows) {
    var search = elSearch ? String(elSearch.value || '').trim().toLowerCase() : '';
    var rangeVal = elRange ? String(elRange.value || '30d') : '30d';
    var muniVal = elMuni ? String(elMuni.value || 'all') : 'all';
    var brgyVal = elBarangay ? String(elBarangay.value || 'all') : 'all';
    var statusVal = elStatus ? String(elStatus.value || 'all') : 'all';
    var days = getRangeDays(rangeVal);
    var cutoff = null;
    if (typeof days === 'number' && isFinite(days)) {
      cutoff = new Date();
      cutoff.setHours(0,0,0,0);
      cutoff.setDate(cutoff.getDate() - (days - 1));
    }
    return rows.filter(function(r) {
      if (cutoff && r.created_at) {
        var dt = new Date(r.created_at);
        if (!(dt instanceof Date) || isNaN(dt.getTime())) return false;
        if (dt < cutoff) return false;
      }
      if (muniVal !== 'all' && r.municipality !== muniVal) return false;
      if (brgyVal !== 'all' && r.barangay !== brgyVal) return false;
      var resolved = isResolvedRow(r);
      if (statusVal === 'active' && resolved) return false;
      if (statusVal === 'resolved' && !resolved) return false;
      if (search) {
        var hay = [
          r.municipality,
          r.barangay,
          r.issue_type,
          r.description,
          r.location_text
        ].join(' ').toLowerCase();
        if (hay.indexOf(search) === -1) return false;
      }
      return true;
    });
  }

  function updateRangeLabel(count) {
    if (!elRangeLabel) return;
    var rangeVal = elRange ? String(elRange.value || '30d') : '30d';
    var muniVal = elMuni ? String(elMuni.value || 'all') : 'all';
    var brgyVal = elBarangay ? String(elBarangay.value || 'all') : 'all';
    var statusVal = elStatus ? String(elStatus.value || 'all') : 'all';

    var parts = [];
    if (rangeVal === '7d') parts.push('Last 7 days');
    else if (rangeVal === '30d') parts.push('Last 30 days');
    else if (rangeVal === '90d') parts.push('Last 90 days');
    else parts.push('All time');

    if (muniVal !== 'all') parts.push(muniVal);
    if (brgyVal !== 'all') parts.push(brgyVal);
    if (statusVal === 'active') parts.push('Active');
    if (statusVal === 'resolved') parts.push('Resolved');
    parts.push(String(count || 0) + ' reports');
    elRangeLabel.textContent = parts.join(' • ');
  }

  function updateStats(filtered) {
    var total = filtered.length;
    var active = 0;
    var resolved = 0;
    var overdue = 0;
    var now = Date.now();
    filtered.forEach(function(r) {
      var isRes = isResolvedRow(r);
      if (isRes) resolved++;
      else active++;
      if (!isRes && r.created_at) {
        var dt = new Date(r.created_at);
        if (dt instanceof Date && !isNaN(dt.getTime())) {
          if (now - dt.getTime() > 24 * 60 * 60 * 1000) overdue++;
        }
      }
    });
    if (elActive) elActive.textContent = String(active);
    if (elResolved) elResolved.textContent = String(resolved);
    if (elTotal) elTotal.textContent = String(total);
    if (elOverdue) elOverdue.textContent = String(overdue);
    updateRangeLabel(total);
  }

  function countByKey(rows, getKey) {
    var map = {};
    rows.forEach(function(r) {
      var k = getKey(r);
      if (!k) return;
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }

  function topEntries(map, limit) {
    var entries = Object.keys(map).map(function(k){ return { key: k, value: map[k] }; });
    entries.sort(function(a,b){ return b.value - a.value; });
    return entries.slice(0, limit);
  }

  function renderTopList(listEl, entries) {
    if (!listEl) return;
    listEl.innerHTML = '';
    entries.forEach(function(e) {
      var li = document.createElement('li');
      var left = document.createElement('span');
      left.textContent = e.key;
      var right = document.createElement('span');
      right.textContent = String(e.value);
      li.appendChild(left);
      li.appendChild(right);
      listEl.appendChild(li);
    });
  }

  function renderMunicipalityTable(filtered) {
    if (!elMuniTable) return;
    var byMuni = {};
    var now = Date.now();
    filtered.forEach(function(r) {
      var m = r.municipality || 'Unknown';
      if (!byMuni[m]) byMuni[m] = { reports: 0, active: 0, resolved: 0, overdue: 0 };
      byMuni[m].reports++;
      var res = isResolvedRow(r);
      if (res) byMuni[m].resolved++;
      else byMuni[m].active++;
      if (!res && r.created_at) {
        var dt = new Date(r.created_at);
        if (dt instanceof Date && !isNaN(dt.getTime())) {
          if (now - dt.getTime() > 24 * 60 * 60 * 1000) byMuni[m].overdue++;
        }
      }
    });
    var rows = Object.keys(byMuni).map(function(k){ return { muni: k, stats: byMuni[k] }; });
    rows.sort(function(a,b){ return b.stats.reports - a.stats.reports; });
    elMuniTable.innerHTML = '';
    rows.slice(0, 12).forEach(function(r) {
      var row = document.createElement('div');
      row.className = 'analytics-table-row';
      row.innerHTML =
        '<span data-label="Municipality">' + r.muni + '</span>' +
        '<span data-label="Total">' + String(r.stats.reports) + '</span>' +
        '<span data-label="Active">' + String(r.stats.active) + '</span>' +
        '<span data-label="Resolved">' + String(r.stats.resolved) + '</span>' +
        '<span data-label="Overdue">' + String(r.stats.overdue) + '</span>';
      elMuniTable.appendChild(row);
    });
  }

  function renderRecent(filtered) {
    if (!elRecentList || !elRecentEmpty) return;
    var sorted = filtered.slice().sort(function(a,b) {
      var da = a.created_at ? new Date(a.created_at).getTime() : 0;
      var db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
    var slice = sorted.slice(0, 10);
    elRecentList.innerHTML = '';
    if (!slice.length) {
      elRecentEmpty.style.display = '';
      return;
    }
    elRecentEmpty.style.display = 'none';
    slice.forEach(function(r) {
      var item = document.createElement('div');
      var resolved = isResolvedRow(r);
      item.className = 'issue-item ' + (resolved ? 'issue-restored' : 'issue-problem');
      item.style.cursor = 'pointer';
      var left = document.createElement('div');
      left.className = 'issue-location';
      left.textContent = r.municipality + (r.barangay ? (', ' + r.barangay) : '');
      var right = document.createElement('div');
      right.className = 'issue-status ' + (resolved ? 'records-status-restored' : 'records-status-problem');
      right.textContent = resolved ? 'Resolved' : 'Active';
      item.appendChild(left);
      item.appendChild(right);
      item.addEventListener('click', function() {
        var params = new URLSearchParams();
        var loc = r.municipality + (r.barangay ? (' ' + r.barangay) : '');
        params.set('location', loc);
        if (r.issue_type) params.set('issue', r.issue_type);
        window.location.href = 'records.html?' + params.toString();
      });
      elRecentList.appendChild(item);
    });
  }

  function ensureChartRegistered() {
    if (typeof Chart === 'undefined') return;
    if (typeof ChartDataLabels !== 'undefined' && Chart && typeof Chart.register === 'function') {
      try { Chart.register(ChartDataLabels); } catch (_) {}
    }
  }

  function toUtcDayKeyFromDate(dt) {
    if (!(dt instanceof Date) || isNaN(dt.getTime())) return '';
    return dt.toISOString().slice(0, 10);
  }

  function buildUtcDaySeries(startDayKey, endDayKey, maxDays) {
    if (!startDayKey || !endDayKey) return [];
    var start = new Date(startDayKey + 'T00:00:00.000Z');
    var end = new Date(endDayKey + 'T00:00:00.000Z');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    if (start.getTime() > end.getTime()) return [];
    var out = [];
    var cursor = start;
    var cap = (typeof maxDays === 'number' && isFinite(maxDays) && maxDays > 0) ? Math.floor(maxDays) : 5000;
    while (cursor.getTime() <= end.getTime() && out.length < cap) {
      out.push(toUtcDayKeyFromDate(cursor));
      cursor = new Date(cursor.getTime());
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return out;
  }

  function renderPerDayChart(filtered) {
    var canvas = document.getElementById('reports-per-day-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    ensureChartRegistered();
    var counts = countByKey(filtered, function(r){ return toDayKey(r.created_at); });
    delete counts[''];
    var rangeVal = elRange ? String(elRange.value || '30d') : '30d';
    var days = getRangeDays(rangeVal);
    var labels = [];
    if (typeof days === 'number' && isFinite(days) && days > 0) {
      var now = new Date();
      var endUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      var startUtc = new Date(endUtc.getTime());
      startUtc.setUTCDate(startUtc.getUTCDate() - (days - 1));
      labels = buildUtcDaySeries(toUtcDayKeyFromDate(startUtc), toUtcDayKeyFromDate(endUtc), days);
    } else {
      var keys = Object.keys(counts).sort();
      if (!keys.length) {
        labels = [];
      } else {
        var minKey = keys[0];
        var maxKey = keys[keys.length - 1];
        var all = buildUtcDaySeries(minKey, maxKey, 5000);
        var cap = 365;
        labels = all.length > cap ? all.slice(all.length - cap) : all;
      }
    }
    var values = labels.map(function(k){ return counts[k] || 0; });
    var ctx = canvas.getContext('2d');
    
    // Create gradient
    var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(139, 42, 42, 0.85)');
    gradient.addColorStop(1, 'rgba(139, 42, 42, 0.2)');

    if (perDayChart) perDayChart.destroy();
    perDayChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Reports',
          data: values,
          backgroundColor: gradient,
          borderColor: '#8b2a2a',
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
          hoverBackgroundColor: '#8b2a2a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1500, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(26, 21, 18, 0.9)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold', family: "'Outfit', sans-serif" },
            bodyFont: { size: 13, family: "'Outfit', sans-serif" },
            cornerRadius: 10,
            displayColors: false
          },
          datalabels: {
            display: labels.length <= 45,
            color: '#8b2a2a',
            anchor: 'end',
            align: 'top',
            offset: 4,
            formatter: function(v){ return v ? v : ''; },
            font: { weight: '700', family: "'Outfit', sans-serif", size: 12 }
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [5, 5] },
            ticks: { color: '#666', font: { family: "'Outfit', sans-serif", size: 11 } } 
          },
          x: { 
            grid: { display: false },
            ticks: { color: '#666', font: { family: "'Outfit', sans-serif", size: 11 }, maxRotation: 45, minRotation: 45, autoSkip: true } 
          }
        }
      }
    });
  }

  function renderTopMunicipalitiesChart(filtered) {
    var canvas = document.getElementById('top-municipalities-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    ensureChartRegistered();
    var counts = countByKey(filtered, function(r){ return r.municipality || 'Unknown'; });
    var top = topEntries(counts, 8);
    var labels = top.map(function(e){ return e.key; });
    var values = top.map(function(e){ return e.value; });
    
    var ctx = canvas.getContext('2d');
    
    // Create custom gradients for each bar
    var baseColors = ['#8b2a2a', '#dc2626', '#f59e0b', '#059669', '#3b82f6', '#7c3aed', '#0ea5e9', '#14b8a6'];
    var gradients = baseColors.map(function(color) {
      var g = ctx.createLinearGradient(0, 0, 0, 400);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      return g;
    });

    if (topMuniChart) topMuniChart.destroy();
    topMuniChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Reports',
          data: values,
          backgroundColor: gradients,
          borderColor: baseColors,
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1800, easing: 'easeOutElastic' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(26, 21, 18, 0.9)',
            padding: 12,
            cornerRadius: 10,
            displayColors: true
          },
          datalabels: {
            color: '#1a1512',
            anchor: 'end',
            align: 'top',
            offset: 4,
            formatter: function(v){ return v; },
            font: { weight: '700', family: "'Outfit', sans-serif", size: 12 }
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [5, 5] },
            ticks: { color: '#666', font: { family: "'Outfit', sans-serif" } } 
          },
          x: { 
            grid: { display: false },
            ticks: { color: '#666', font: { family: "'Outfit', sans-serif" } } 
          }
        }
      }
    });
  }

  function renderTopBarangaysChart(filtered) {
    var canvas = document.getElementById('top-barangays-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    ensureChartRegistered();
    var muniVal = elMuni ? String(elMuni.value || 'all') : 'all';
    var counts = countByKey(filtered, function(r){
      if (muniVal !== 'all') return r.barangay || 'Not specified';
      return (r.barangay || 'Not specified') + ' • ' + (r.municipality || 'Unknown');
    });
    var top = topEntries(counts, 8);
    var labels = top.map(function(e){ return e.key; });
    var values = top.map(function(e){ return e.value; });
    
    var ctx = canvas.getContext('2d');
    var baseColors = ['#f59e0b', '#059669', '#3b82f6', '#7c3aed', '#0ea5e9', '#14b8a6', '#f97316', '#ef4444'];
    var gradients = baseColors.map(function(color) {
      var g = ctx.createLinearGradient(0, 0, 0, 400);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      return g;
    });

    if (topBarangayChart) topBarangayChart.destroy();
    topBarangayChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Reports',
          data: values,
          backgroundColor: gradients,
          borderColor: baseColors,
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 2000, easing: 'easeOutCubic' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(26, 21, 18, 0.9)',
            padding: 12,
            cornerRadius: 10
          },
          datalabels: {
            color: '#1a1512',
            anchor: 'end',
            align: 'top',
            offset: 4,
            formatter: function(v){ return v; },
            font: { weight: '700', family: "'Outfit', sans-serif", size: 12 }
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [5, 5] },
            ticks: { color: '#666', font: { family: "'Outfit', sans-serif" } } 
          },
          x: { 
            grid: { display: false },
            ticks: { color: '#666', font: { family: "'Outfit', sans-serif" } } 
          }
        }
      }
    });
  }

  function updateAll() {
    populateBarangayFilter(allReports);
    var filtered = applyFilters(allReports);
    updateStats(filtered);

    var muniCounts = countByKey(filtered, function(r){ return r.municipality || 'Unknown'; });
    renderTopList(elTopMunis, topEntries(muniCounts, 8));

    var muniVal = elMuni ? String(elMuni.value || 'all') : 'all';
    var brgyCounts = countByKey(filtered, function(r){
      if (muniVal !== 'all') return r.barangay || 'Not specified';
      return (r.barangay || 'Not specified') + ' • ' + (r.municipality || 'Unknown');
    });
    renderTopList(elTopBarangays, topEntries(brgyCounts, 8));

    renderMunicipalityTable(filtered);
    renderRecent(filtered);
    renderPerDayChart(filtered);
    renderTopMunicipalitiesChart(filtered);
    renderTopBarangaysChart(filtered);
  }

  function bindEvents() {
    if (elSearch) elSearch.addEventListener('input', function(){ updateAll(); });
    if (elRange) elRange.addEventListener('change', function(){ updateAll(); });
    if (elStatus) elStatus.addEventListener('change', function(){ updateAll(); });
    if (elMuni) elMuni.addEventListener('change', function(){
      if (elBarangay) elBarangay.value = 'all';
      updateAll();
    });
    if (elBarangay) elBarangay.addEventListener('change', function(){ updateAll(); });
    if (elClear) elClear.addEventListener('click', function() {
      if (elSearch) elSearch.value = '';
      if (elRange) elRange.value = '30d';
      if (elMuni) elMuni.value = 'all';
      if (elBarangay) elBarangay.value = 'all';
      if (elStatus) elStatus.value = 'all';
      updateAll();
    });
  }

  async function fetchAllReports(cfg) {
    var pageSize = 1000;
    var offset = 0;
    var out = [];
    var selectCols = [
      'id',
      'location_text',
      'issue_type',
      'description',
      'created_at',
      'municipality',
      'barangay',
      'status',
      'resolved_at'
    ].join(',');
    while (true) {
      var url = cfg.url + '/rest/v1/' + cfg.reportsTable +
        '?select=' + encodeURIComponent(selectCols) +
        '&order=created_at.desc' +
        '&limit=' + pageSize +
        '&offset=' + offset;
      var res = await fetch(url, {
        headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var rows = await res.json();
      if (!Array.isArray(rows) || !rows.length) break;
      out = out.concat(rows);
      if (rows.length < pageSize) break;
      offset += pageSize;
      if (offset >= 5000) break;
    }
    return out;
  }

  async function loadAnalyticsData() {
    var cfg = window.SAMELCO_SUPABASE || {};
    if (!cfg.url || !cfg.anonKey || !cfg.reportsTable) {
      allReports = [];
      updateAll();
      return;
    }
    try {
      var rows = await fetchAllReports(cfg);
      allReports = (Array.isArray(rows) ? rows : []).map(normalizeReportRow);
      try { localStorage.setItem('analyticsReportsCache', JSON.stringify(allReports)); } catch (_) {}
    } catch (err) {
      try {
        var cached = JSON.parse(localStorage.getItem('analyticsReportsCache') || '[]');
        if (Array.isArray(cached)) allReports = cached;
      } catch (_) {}
    }
    updateAll();
  }

  populateMunicipalityFilter();
  bindEvents();
  loadAnalyticsData();

  window.addEventListener('storage', function(e) {
    if (e.key === 'analyticsReportsCache') {
      try {
        var cached = JSON.parse(localStorage.getItem('analyticsReportsCache') || '[]');
        if (Array.isArray(cached)) allReports = cached;
      } catch (_) {}
      updateAll();
    }
  });


});
