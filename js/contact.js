document.addEventListener('DOMContentLoaded', function () {
  var userName = localStorage.getItem('userName');
  if (!userName) {
    window.location.href = 'index.html';
    return;
  }
  var userNameEl = document.getElementById('user-name');
  if (userNameEl) userNameEl.textContent = userName;

  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('userName');
      window.location.href = 'index.html';
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
    navDotsDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
    navDotsDropdown.querySelectorAll('.nav-dots-item').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = this.getAttribute('data-action');
        navDotsDropdown.classList.remove('is-open');
        if (action === 'home') window.location.href = 'dashboard.html';
        else if (action === 'records') window.location.href = 'records.html';
        else if (action === 'analytics') window.location.href = 'analytics.html';
        else if (action === 'teams') window.location.href = 'teams.html';
        else if (action === 'etc') window.location.href = 'about.html';
        else if (action === 'contact') window.location.href = 'contact.html';
      });
    });
  }

  function copyText(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(function(){});
  }
  function getText(elId) {
    var el = document.getElementById(elId);
    return el ? el.textContent.trim() : '';
  }

  var bannerCallBtn = document.getElementById('call-now-btn');
  var bannerEmailBtn = document.getElementById('email-support-btn');
  if (bannerCallBtn) bannerCallBtn.addEventListener('click', function(){ window.location.href = 'tel:+63561234567'; });
  if (bannerEmailBtn) bannerEmailBtn.addEventListener('click', function(){ window.location.href = 'mailto:support@samelcodos.ph'; });

  document.querySelectorAll('.contact-action').forEach(function(btn){
    btn.addEventListener('click', function(){
      var action = this.getAttribute('data-action');
      if (action === 'open-website') window.open('https://www.samelcodos.com', '_blank', 'noopener');
      else if (action === 'copy-website') copyText(getText('website-text'));
      else if (action === 'email-support') window.location.href = 'mailto:support@samelcodos.ph';
      else if (action === 'copy-email') copyText(getText('email-text'));
      else if (action === 'call-phone') window.location.href = 'tel:+63561234567';
      else if (action === 'copy-phone') copyText(getText('phone-text'));
      else if (action === 'add-contacts') {
        var v = 'BEGIN:VCARD\nVERSION:3.0\nFN:SAMELCO II Support\nTEL;TYPE=work,voice:+63 56 123 4567\nEMAIL:support@samelcodos.ph\nEND:VCARD';
        var blob = new Blob([v], { type: 'text/vcard' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'samelcodos-support.vcf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      }
    });
  });

  var contactForm = document.getElementById('contact-form');
  var copyMessageBtn = document.getElementById('copy-message-btn');
  function buildMessage() {
    var name = document.getElementById('msg-name') ? document.getElementById('msg-name').value.trim() : '';
    var account = document.getElementById('msg-account') ? document.getElementById('msg-account').value.trim() : '';
    var email = document.getElementById('msg-email') ? document.getElementById('msg-email').value.trim() : '';
    var body = document.getElementById('msg-body') ? document.getElementById('msg-body').value.trim() : '';
    var lines = [];
    if (name) lines.push('Name: ' + name);
    if (account) lines.push('Account: ' + account);
    if (email) lines.push('Email: ' + email);
    if (body) lines.push('Message: ' + body);
    return lines.join('\n');
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      var name = document.getElementById('msg-name').value.trim();
      var account = document.getElementById('msg-account').value.trim();
      var email = document.getElementById('msg-email').value.trim();
      var body = document.getElementById('msg-body').value.trim();
      
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : 'Send Email';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      // 1. Save to Supabase database
      try {
        var supabaseCfg = window.SAMELCO_SUPABASE;
        if (supabaseCfg && supabaseCfg.url) {
          var dbRes = await fetch(supabaseCfg.url + '/rest/v1/contact_messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseCfg.anonKey,
              'Authorization': 'Bearer ' + supabaseCfg.anonKey
            },
            body: JSON.stringify({
              name: name,
              account_number: account,
              email: email,
              message: body
            })
          });
          if (!dbRes.ok) {
            console.error('Failed to save message to database:', await dbRes.text());
          }
        }
      } catch (dbErr) {
        console.error('Database error:', dbErr);
      }

      // 2. Send email via EmailJS
      if (typeof emailjs !== 'undefined') {
        emailjs.send(
          'service_xtzxndr', // Service ID
          'YOUR_TEMPLATE_ID', // Replace with your actual template ID for the Contact Form
          {
            from_name: name,
            from_email: email,
            account_number: account,
            message: body,
            reply_to: email
          }
        ).then(function() {
          alert('Message sent successfully!');
          contactForm.reset();
        }).catch(function(error) {
          console.error('Failed to send email:', error);
          if (error && error.text && error.text.includes('template ID not found')) {
            alert('Failed to send message: The template ID not found. To find this ID, visit https://dashboard.emailjs.com/admin/templates\n\nPlease replace "YOUR_TEMPLATE_ID" in js/contact.js with your actual template ID.');
          } else {
            alert('Failed to send message via EmailJS: ' + (error.text || JSON.stringify(error)));
          }
        }).finally(function() {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
      } else {
        alert('EmailJS is not loaded. Message saved to database only.');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }
  if (copyMessageBtn) {
    copyMessageBtn.addEventListener('click', function(){
      var msg = buildMessage();
      copyText(msg);
    });
  }
});
