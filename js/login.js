document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const statusDiv = document.getElementById('status');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const resp = await fetch('https://api.corpus.swecha.org/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: phone, password: password })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(`Login failed (${resp.status}): ${errorData.message || resp.statusText}`);
      }

      const result = await resp.json();
      console.log('Login API Response:', result); // Log the full response
      const authToken = result.access_token || result.token || result.authToken || null;

      if (!authToken) {
        throw new Error('No auth token received');
      }

      localStorage.setItem('authToken', authToken);
      console.log('Auth Token stored:', authToken);
      statusDiv.className = 'mt-3 text-center text-success';
      statusDiv.innerText = 'Logged in successfully! Redirecting to dashboard...';
      window.location.href = 'dashboard.html'; // Redirect to dashboard page
    } catch (err) {
      statusDiv.className = 'mt-3 text-center text-danger';
      statusDiv.innerText = 'Error during sign in: ' + err.message;
    }
  });
});
