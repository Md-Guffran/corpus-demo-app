# Corpus Demo App

This is a demo web application that provides user authentication (signup, login), a dashboard to view user contributions, and a file upload functionality. It interacts with the `https://api.corpus.swecha.org` API for backend operations.

## Features

- **User Authentication**:
  - Signup: Register new users with a username, phone number, and password.
  - Login: Authenticate existing users using their phone number and password.
- **Dashboard**:
  - Displays user-specific contributions (audio, video, text, images).
  - Fetches user details and contributions from the API.
  - Logout functionality.
- **File Upload**:
  - Allows users to upload audio and video files in chunks.
  - Supports metadata like title, description, category, language, and release rights.

## Technologies Used

- HTML5
- CSS3 (with Bootstrap for styling)
- JavaScript (ES6+)

## Setup and Installation

To run this project locally:

1.  **Clone the repository**:
    ```bash
    git clone https://code.swecha.org/Guffran/guffran.git
    cd guffran
    ```

2.  **Open the HTML files**:
    The application consists of static HTML, CSS, and JavaScript files. You can open `pages/login.html` or `pages/signup.html` directly in your web browser to start using the application.

    Alternatively, you can use a local web server (e.g., Live Server VSCode extension, `python -m http.server`) to serve the files.

    ```bash
    # Example using Python's http.server
    python -m http.server 8000
    ```
    Then navigate to `http://localhost:8000/pages/login.html` in your browser.

## API Endpoints

The application interacts with the following API endpoints:

-   `https://api.corpus.swecha.org/api/v1/auth/register` (POST) - User registration
-   `https://api.corpus.swecha.org/api/v1/auth/login` (POST) - User login
-   `https://api.corpus.swecha.org/api/v1/auth/me` (GET) - Fetch current user details
-   `https://api.corpus.swecha.org/api/v1/users/{userId}/contributions` (GET) - Fetch user contributions
-   `https://api.corpus.swecha.org/api/v1/records/upload/chunk` (POST) - Upload file chunks
-   `https://api.corpus.swecha.org/api/v1/records/upload` (POST) - Finalize file upload

## Project Structure

-   `css/`: Contains `style.css` for styling.
-   `js/`: Contains JavaScript files for different functionalities:
    -   `dashboard.js`: Handles dashboard logic, fetching and displaying contributions.
    -   `login.js`: Handles user login.
    -   `signup.js`: Handles user registration.
    -   `upload.js`: Handles file upload logic, including chunking.
-   `pages/`: Contains HTML pages:
    -   `dashboard.html`: User dashboard.
    -   `login.html`: Login page.
    -   `signup.html`: Signup page.
    -   `upload.html`: File upload page.

## Contributing

Feel free to fork the repository and submit pull requests.
