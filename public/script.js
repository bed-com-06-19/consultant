let token = '';
let role = '';

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  const msg = document.getElementById('login-message');

  if (res.ok) {
    token = data.token;
    role = data.role;
    msg.textContent = 'Login successful';
    showRoleUI();
  } else {
    msg.textContent = data.message || 'Login failed';
  }
}

function showRoleUI() {
  document.getElementById('login-section').style.display = 'none';

  if (role === 'user') {
    document.getElementById('user-section').style.display = 'block';
  } else if (role === 'admin') {
    document.getElementById('admin-section').style.display = 'block';
  }
}

async function createAppointment() {
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value;

  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ date, description })
  });

  const data = await res.json();
  alert(data.message || data.error);
}
