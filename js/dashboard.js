document.addEventListener('DOMContentLoaded', () => {
  const contentListDiv = document.getElementById('content-list');
  const logoutBtn = document.getElementById('logout-btn');
  const usernameDisplay = document.getElementById('username-display');

  let authToken = localStorage.getItem('authToken');
  let userId = localStorage.getItem('userId'); // Keep userId for content fetching

  if (!authToken) {
    window.location.href = 'login.html';
    return;
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
  });

  // Function to fetch user details and store userId
  async function fetchUserDetails() {
    try {
      const resp = await fetch('https://api.corpus.swecha.org/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch user details (${resp.status})`);
      }

      const result = await resp.json();
      userId = result.uid || result.id || null; // Assuming user ID is 'uid' or 'id'
      const username = result.username || result.email || 'User'; // Assuming username is 'username' or 'email'
      if (userId) {
        localStorage.setItem('userId', userId);
        console.log('User ID fetched and stored:', userId);
      } else {
        throw new Error('User ID not found in /auth/me response');
      }
      usernameDisplay.innerText = username;
    } catch (err) {
      console.error('Error fetching user details:', err);
      // Redirect to login if user details cannot be fetched
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      window.location.href = 'login.html';
    }
  }

  // Call fetchUserDetails before fetching content
  fetchUserDetails().then(() => {
    fetchUserContent();
  });

  // Function to fetch and display user's uploaded content
  async function fetchUserContent() {
    try {
      if (!userId) {
        console.warn('User ID not available for fetching content. Waiting for fetchUserDetails to complete.');
        return;
      }
      const resp = await fetch(`https://api.corpus.swecha.org/api/v1/users/${userId}/contributions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(`Failed to fetch contributions (${resp.status}): ${errorData.detail || resp.statusText}`);
      }

      const result = await resp.json();
      console.log('User Contributions API Response:', result); // Debugging line
      displayContributions(result);
    } catch (err) {
      console.error('Error fetching user contributions:', err);
      contentListDiv.innerHTML = `<div class="col-12 text-center text-danger">Error loading contributions: ${err.message}</div>`;
    }
  }

  // Function to display content in the dashboard
  function displayContributions(data) {
    contentListDiv.innerHTML = ''; // Clear existing content

    const allContributions = [
      ...(data.audio_contributions || []),
      ...(data.video_contributions || []),
      ...(data.text_contributions || []),
      ...(data.image_contributions || [])
    ];

    if (!allContributions || allContributions.length === 0) {
      contentListDiv.innerHTML = `<div class="col-12 text-center text-muted">No contributions uploaded yet.</div>`;
      return;
    }

    allContributions.forEach(content => {
      const contentCard = document.createElement('div');
      contentCard.className = 'col-md-6 col-lg-4 mb-4';

      let mediaElement = '';
      // The API response for contributions has 'timestamp' instead of 'created_at'
      const uploadedDate = content.timestamp ? new Date(content.timestamp).toLocaleDateString() : 'N/A';

      // Determine media type from the content object itself, or infer from the array it came from
      let mediaType = 'unknown';
      if (data.audio_contributions && data.audio_contributions.some(item => item.id === content.id)) {
          mediaType = 'audio';
          if (content.file_url) mediaElement = `<audio controls src="${content.file_url}" class="w-100 mt-2"></audio>`;
      } else if (data.video_contributions && data.video_contributions.some(item => item.id === content.id)) {
          mediaType = 'video';
          if (content.file_url) mediaElement = `<video controls src="${content.file_url}" class="w-100 mt-2"></video>`;
      } else if (data.image_contributions && data.image_contributions.some(item => item.id === content.id)) {
          mediaType = 'image';
          if (content.file_url) mediaElement = `<img src="${content.file_url}" class="img-fluid mt-2" alt="${content.title}">`;
      } else if (data.text_contributions && data.text_contributions.some(item => item.id === content.id)) {
          mediaType = 'text';
          if (content.file_url) mediaElement = `<a href="${content.file_url}" target="_blank" class="btn btn-sm btn-outline-primary mt-3">View Document</a>`;
      }


      contentCard.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${content.title || 'Untitled'}</h5>
            <p class="card-text text-muted">Category: ${content.category_id || 'N/A'}</p>
            <p class="card-text text-muted">Media Type: ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}</p>
            <p class="card-text text-muted">Uploaded on: ${uploadedDate}</p>
            ${mediaElement}
            <a href="#" class="btn btn-sm btn-outline-primary mt-3">View Details</a>
          </div>
        </div>
      `;
      contentListDiv.appendChild(contentCard);
    });
  }

  // Call fetchUserDetails before fetching content
  fetchUserDetails().then(() => {
    fetchUserContent();
  });
});
