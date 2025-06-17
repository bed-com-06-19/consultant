document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('Access denied. Please log in.');
      window.location.href = 'login.html';
      return;
    }
  
    // Load settings and login logs
    loadSecuritySettings(token);
    loadLoginLogs(token);
  
    // Toggle sidebar button
    const toggleBtn = document.getElementById('toggleSidebar');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('collapsed');
      };
    }
  
    // Save settings button
    const saveBtn = document.getElementById('saveSettings');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => saveSettings(token));
    }
  });
  
  // Load security settings from backend
  async function loadSecuritySettings(token) {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!res.ok) throw new Error('Failed to fetch settings');
  
      const settings = await res.json();
  
      document.getElementById('enable2FA').checked = !!settings.enable2FA;
      document.getElementById('sessionTimeout').value = settings.sessionTimeout || 30;
      document.getElementById('passwordPolicy').value = settings.passwordPolicy || '';
    } catch (err) {
      console.error('Security settings error:', err);
      alert('Error loading security settings.');
    }
  }
  
  // Save security settings to backend
  async function saveSettings(token) {
    const enable2FA = document.getElementById('enable2FA').checked;
    const sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
    const passwordPolicy = document.getElementById('passwordPolicy').value;
  
    const settings = { enable2FA, sessionTimeout, passwordPolicy };
  
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
  
      if (res.ok) {
        alert('Security settings saved successfully!');
      } else {
        const data = await res.json();
        alert('Failed to save: ' + (data.error || res.statusText));
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving security settings.');
    }
  }
  
  // Load login history logs from backend
  async function loadLoginLogs(token) {
    try {
      const res = await fetch('/api/admin/login-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!res.ok) throw new Error('Failed to fetch login logs');
  
      const logs = await res.json();
  
      const formattedLogs = logs.map(log =>
        `${log.username} logged in at ${new Date(log.timestamp).toLocaleString()}`
      ).join('\n');
  
      document.getElementById('loginLogs').value = formattedLogs;
    } catch (err) {
      console.error('Error loading login logs:', err);
      document.getElementById('loginLogs').value = 'Failed to load logs.';
    }
  }
  