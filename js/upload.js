document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload-form');
  const audioFileInput = document.getElementById('audio-file');
  const videoFileInput = document.getElementById('video-file');
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');
  const categoryIdInput = document.getElementById('category-id');
  const locationInput = document.getElementById('location'); // Get location input
  const languageInput = document.getElementById('language');
  const releaseRightsInput = document.getElementById('release-rights');
  const statusDiv = document.getElementById('status');

  // Auto-detect location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      // You might want to use a reverse geocoding service here to get a human-readable address
      // For now, we'll just put the coordinates
      locationInput.value = `${lat}, ${lon}`;
    }, (error) => {
      console.error('Error getting geolocation:', error);
      statusDiv.className = 'mt-3 text-center text-warning';
      statusDiv.innerText = 'Could not auto-detect location. Please enter it manually.';
    });
  } else {
    statusDiv.className = 'mt-3 text-center text-warning';
    statusDiv.innerText = 'Geolocation is not supported by your browser. Please enter location manually.';
  }

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    statusDiv.className = 'mt-3 text-center text-danger';
    statusDiv.innerText = 'You are not logged in. Redirecting to login page...';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return;
  }

  // Simple UUID generator (for demonstration, in a real app use crypto.randomUUID or a library)
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

  async function uploadFileInChunks(file, authToken, statusDiv) {
    const fileSize = file.size;
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    const uploadUuid = generateUUID();
    const filename = file.name;

    statusDiv.innerText = `Starting upload for ${filename}...`;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(fileSize, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('filename', filename);
      formData.append('chunk_index', i);
      formData.append('total_chunks', totalChunks);
      formData.append('upload_uuid', uploadUuid);

      try {
        statusDiv.innerText = `Uploading ${filename} chunk ${i + 1}/${totalChunks}...`;
        const resp = await fetch('https://api.corpus.swecha.org/api/v1/records/upload/chunk', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        });

        if (!resp.ok) {
          const errorData = await resp.json();
          throw new Error(`Chunk upload failed for ${filename} chunk ${i + 1} (${resp.status}): ${errorData.message || resp.statusText}`);
        }
      } catch (err) {
        throw new Error(`Error during chunk upload for ${filename}: ${err.message}`);
      }
    }
    statusDiv.innerText = `Finished uploading ${filename}!`;
    return uploadUuid; // Return the UUID for potential finalization or tracking
  }

  uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const audioFile = audioFileInput.files[0];
    const videoFile = videoFileInput.files[0];
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const location = locationInput.value.trim();
    const categoryId = categoryIdInput.value;
    const language = languageInput.value;
    const releaseRights = releaseRightsInput.value;

    if (!audioFile && !videoFile) {
      statusDiv.className = 'mt-3 text-center text-warning';
      statusDiv.innerText = 'Please provide an audio or video file to upload.';
      return;
    }

    if (!title || !categoryId || !language || !releaseRights || !location) {
      statusDiv.className = 'mt-3 text-center text-warning';
      statusDiv.innerText = 'Please fill in all required metadata fields (Title, Category, Language, Release Rights, Location).';
      return;
    }

    try {
      statusDiv.className = 'mt-3 text-center text-info';
      statusDiv.innerText = 'Processing uploads... ⏳';

      let fileToUpload = audioFile || videoFile; // Prioritize video if both are present, or just take the one that exists
      let mediaType = audioFile ? 'audio' : 'video';

      if (videoFile && audioFile) {
        statusDiv.innerText += "\nWarning: Both audio and video files provided. Only one will be processed for finalization.";
        fileToUpload = videoFile; // Prioritize video for finalization
        mediaType = 'video';
      }

      const uploadUuid = await uploadFileInChunks(fileToUpload, authToken, statusDiv);

      // Assuming user_id is available in localStorage from login response
      const userId = localStorage.getItem('userId');
      console.log('User ID retrieved from localStorage in upload.js:', userId);
      if (!userId) {
        // If userId is not in localStorage, redirect to dashboard to fetch it
        window.location.href = 'dashboard.html';
        return;
      }

      // Finalize the upload
      statusDiv.innerText = 'Finalizing upload...';
      const finalizeFormData = new URLSearchParams();
      finalizeFormData.append('title', title);
      if (description) {
        finalizeFormData.append('description', description);
      }
      finalizeFormData.append('category_id', categoryId);
      finalizeFormData.append('user_id', userId);
      finalizeFormData.append('media_type', mediaType);
      finalizeFormData.append('upload_uuid', uploadUuid);
      finalizeFormData.append('filename', fileToUpload.name);
      finalizeFormData.append('total_chunks', Math.ceil(fileToUpload.size / CHUNK_SIZE));
      finalizeFormData.append('release_rights', releaseRights);
      finalizeFormData.append('location', location);
      finalizeFormData.append('language', language);
      finalizeFormData.append('use_uid_filename', 'false'); // Default to false

      console.log('Finalize Request Body:', finalizeFormData.toString()); // Debugging line

      const finalizeResp = await fetch('https://api.corpus.swecha.org/api/v1/records/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: finalizeFormData.toString()
      });

      if (!finalizeResp.ok) {
        const errorData = await finalizeResp.json();
        throw new Error(`Finalization failed (${finalizeResp.status}): ${errorData.message || finalizeResp.statusText}`);
      }

      const finalResult = await finalizeResp.json();
      statusDiv.className = 'mt-3 text-center text-success';
      statusDiv.innerText = 'Upload and Finalization successful! 🎉 Server says: ' + JSON.stringify(finalResult);
      uploadForm.reset(); // Clear form after successful upload
    } catch (err) {
      statusDiv.className = 'mt-3 text-center text-danger';
      statusDiv.innerText = 'Error during upload: ' + err.message;
    }
  });
});
