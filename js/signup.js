document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const usernameInput = document.getElementById('username');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const statusDiv = document.getElementById('status');

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const resp = await fetch('https://api.corpus.swecha.org/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, phone, password })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(`Registration failed (${resp.status}): ${errorData.detail || errorData.message || resp.statusText}`);
      }

      const result = await resp.json();
      console.log('Registration API Response:', result);
      statusDiv.className = 'mt-3 text-center text-success';
      statusDiv.innerText = 'Registration successful! Redirecting to login...';
      window.location.href = 'login.html';
    } catch (err) {
      statusDiv.className = 'mt-3 text-center text-danger';
      statusDiv.innerText = 'Error during registration: ' + err.message;
    }
  });
});
