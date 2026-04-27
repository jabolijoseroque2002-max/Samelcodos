document.addEventListener('DOMContentLoaded', function () {
  // login check
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

  // branch dropdown logic reused
  var branchesBtn = document.getElementById('branches-btn');
  var branchDropdown = document.getElementById('branch-dropdown');
  if (branchesBtn && branchDropdown) {
    branchesBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      branchDropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', function() {
      branchDropdown.classList.remove('is-open');
    });
    branchDropdown.addEventListener('click', function(e) { e.stopPropagation(); });

    branchDropdown.querySelectorAll('.branch-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var branch = this.getAttribute('data-branch');
        localStorage.setItem('selectedBranch', branch);
        window.location.href = 'records.html';
      });
    });
  }

  // three-dots menu same as other pages
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
        if (action === 'home') window.location.href = 'dashboard.html';
        else if (action === 'records') window.location.href = 'records.html';
        else if (action === 'analytics') window.location.href = 'analytics.html';
        else if (action === 'branches') window.location.href = 'branches.html';
        else if (action === 'teams') window.location.href = 'teams.html';
        else if (action === 'etc') window.location.href = 'about.html';
        else if (action === 'contact') window.location.href = 'contact.html';
      });
    });
  }

  // -----------------------------------------------------------------------------
  // replicate map functionality from dashboard
  // Use shared data from municipalities-data.js (16 municipalities from GeoJSON)
  var municipalities = window.SAMELCO_MUNICIPALITIES || [];

  // Update municipality count display if it exists
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  var muniCountDisplay = document.getElementById('municipality-count-display');
  if (muniCountDisplay && municipalities.length > 0) {
    animateValue(muniCountDisplay, 0, municipalities.length, 1500);
  }

  var branchesCountDisplay = document.getElementById('branches-count-display');
  if (branchesCountDisplay) {
    animateValue(branchesCountDisplay, 0, 4, 1500);
  }

  // create sidebar list
  var sidebarList = document.getElementById('municipalities-sidebar-list');
  if (sidebarList) {
    municipalities.forEach(function(m) {
      var item = document.createElement('div');
      item.className = 'sidebar-municipality-item';
      var barangayCount = Array.isArray(m.barangays) ? m.barangays.length : m.barangays;
      var header = document.createElement('div');
      header.innerHTML = '<h4>' + m.name + '</h4><p>' + barangayCount + ' Barangays</p>';
      item.appendChild(header);
      var bList = document.createElement('div');
      bList.className = 'sidebar-barangays';
      bList.style.display = 'none';
      if (Array.isArray(m.barangays)) {
        m.barangays.forEach(function(b) {
          var bItem = document.createElement('div');
          bItem.className = 'barangay-item-sidebar';
          var bName = typeof b === 'object' && b.name ? b.name : b;
          bItem.textContent = bName;
          bList.appendChild(bItem);
        });
      }
      item.appendChild(bList);
      item.addEventListener('click', function() {
        bList.style.display = (bList.style.display === 'none') ? 'block' : 'none';
        if (window.map) window.map.setView([m.lat, m.lng], 11);
      });
      sidebarList.appendChild(item);
    });
  }

  var mapEl = document.getElementById('map');
  if (mapEl) {
    var map = L.map('map', {
      center: [11.7, 124.9],
      zoom: 10,
      minZoom: 9,
      maxZoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
      maxBounds: [[10.5, 124.0], [12.5, 125.5]]
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(map);
    var customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div class="marker-pin"></div>',
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });

    // --- Map Labels ---
    var municipalityLabelLayer = L.layerGroup();
    var barangayLabelLayer = L.layerGroup();

    function updateMapLabels() {
      var zoom = map.getZoom();
      
      // Toggle Municipality Labels (Visible at zoom 10 and above)
      if (zoom >= 10) {
        if (!map.hasLayer(municipalityLabelLayer)) municipalityLabelLayer.addTo(map);
      } else {
        if (map.hasLayer(municipalityLabelLayer)) map.removeLayer(municipalityLabelLayer);
      }

      // Toggle Barangay Labels (Visible at zoom 12 and above)
      if (zoom >= 12) {
        if (!map.hasLayer(barangayLabelLayer)) barangayLabelLayer.addTo(map);
      } else {
        if (map.hasLayer(barangayLabelLayer)) map.removeLayer(barangayLabelLayer);
      }
    }

    function initMunicipalityLabels() {
      if (!window.SAMELCO_MUNICIPALITIES) return;
      window.SAMELCO_MUNICIPALITIES.forEach(function(m) {
        if (!m.lat || !m.lng) return;
        L.marker([m.lat, m.lng], {
          icon: L.divIcon({
          className: 'map-label municipality-label',
          html: '<span>' + m.name + '</span>',
          iconSize: [160, 24],
          iconAnchor: [80, 12]
        }),
          interactive: false,
          pane: 'markerPane'
        }).addTo(municipalityLabelLayer);
      });
    }

    map.on('zoomend', updateMapLabels);
    initMunicipalityLabels();

    municipalities.forEach(function(m) {
      L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);
    });

    // Render Coverage GeoJSON if available
    if (window.SAMELCO_COVERAGE_GEOJSON) {
      L.geoJSON(window.SAMELCO_COVERAGE_GEOJSON, {
        style: function(feature) {
          return {
            color: '#8b2a2a',
            weight: 1.5,
            opacity: 0.6,
            fillColor: '#8b2a2a',
            fillOpacity: 0.05
          };
        },
        onEachFeature: function(feature, layer) {
          if (feature.properties) {
            var props = feature.properties;
            var popupContent = '<div class="map-popup-content">' +
              '<h4 style="margin:0 0 8px; color:#8b2a2a; border-bottom:1px solid #eee; padding-bottom:4px;">' + (props.NAME_3 || 'Unknown Barangay') + '</h4>' +
              '<p style="margin:4px 0;"><strong>Municipality:</strong> ' + (props.NAME_2 || 'N/A') + '</p>' +
              '</div>';
            layer.bindPopup(popupContent);
            
            layer.on({
              mouseover: function(e) {
                var l = e.target;
                l.setStyle({
                  weight: 3,
                  opacity: 1,
                  fillOpacity: 0.2
                });
              },
              mouseout: function(e) {
                var l = e.target;
                l.setStyle({
                  weight: 1.5,
                  opacity: 0.6,
                  fillOpacity: 0.05
                });
              }
            });

            // Add barangay label to the barangayLabelLayer
            if (props.NAME_3) {
              var bounds = layer.getBounds();
              if (bounds.isValid()) {
                var center = bounds.getCenter();
                L.marker(center, {
                  icon: L.divIcon({
                  className: 'map-label barangay-label',
                  html: '<span>' + props.NAME_3 + '</span>',
                  iconSize: [120, 18],
                  iconAnchor: [60, 9]
                }),
                  interactive: false,
                  pane: 'markerPane'
                }).addTo(barangayLabelLayer);
              }
            }
          }
        }
      }).addTo(map);
    }

    // Initial update of labels
    updateMapLabels();

    var group = new L.featureGroup(map._layers);
    map.fitBounds(group.getBounds().pad(0.1));
    window.map = map;
  }

  // Modal functionality for branches and municipalities
  var branchesCard = document.getElementById('branches-card');
  var municipalitiesCard = document.getElementById('municipalities-card');
  var branchesModal = document.getElementById('branches-modal');
  var municipalitiesModal = document.getElementById('municipalities-modal');
  var closeBranches = document.getElementById('close-branches');
  var closeMunicipalities = document.getElementById('close-municipalities');

  // List of Branches for the modal
  var branchOffices = [
    { name: 'Main Office', location: 'Paranas, Samar' },
    { name: 'Catbalogan Branch', location: 'Catbalogan City, Samar' },
    { name: 'Calbiga Branch', location: 'Calbiga, Samar' },
    { name: 'Basey Branch', location: 'Basey, Samar' }
  ];

  // Populate Municipalities Modal
  var munListContainer = document.getElementById('municipalities-list-container');
  if (munListContainer && Array.isArray(municipalities)) {
    municipalities.sort(function(a, b) { return a.name.localeCompare(b.name); });
    municipalities.forEach(function(m) {
      var item = document.createElement('div');
      item.style.padding = '0.75rem';
      item.style.background = '#f8fafc';
      item.style.borderRadius = '12px';
      item.style.border = '1px solid #e2e8f0';
      item.style.fontSize = '0.9rem';
      item.style.fontWeight = '600';
      item.style.color = '#1e293b';
      item.textContent = m.name;
      munListContainer.appendChild(item);
    });
  }

  // Populate Branches Modal
  var branchesListContainer = document.getElementById('branches-list-container');
  if (branchesListContainer) {
    branchOffices.forEach(function(b) {
      var item = document.createElement('div');
      item.style.padding = '1rem';
      item.style.background = '#f8fafc';
      item.style.borderRadius = '12px';
      item.style.border = '1px solid #e2e8f0';
      item.innerHTML = '<div style="font-weight:700; color:#1e293b; margin-bottom:0.25rem;">' + b.name + '</div>' +
                       '<div style="font-size:0.85rem; color:#64748b;">' + b.location + '</div>';
      branchesListContainer.appendChild(item);
    });
  }

  if (branchesCard && branchesModal) {
    branchesCard.addEventListener('click', function() {
      branchesModal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevent scroll
    });
  }

  if (municipalitiesCard && municipalitiesModal) {
    municipalitiesCard.addEventListener('click', function() {
      municipalitiesModal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevent scroll
    });
  }

  if (closeBranches && branchesModal) {
    closeBranches.addEventListener('click', function() {
      branchesModal.style.display = 'none';
      document.body.style.overflow = ''; // Restore scroll
    });
  }

  if (closeMunicipalities && municipalitiesModal) {
    closeMunicipalities.addEventListener('click', function() {
      municipalitiesModal.style.display = 'none';
      document.body.style.overflow = ''; // Restore scroll
    });
  }

  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === branchesModal) {
      branchesModal.style.display = 'none';
      document.body.style.overflow = '';
    }
    if (event.target === municipalitiesModal) {
      municipalitiesModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
});
