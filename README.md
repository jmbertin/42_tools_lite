# 42 Tools Lite

42 Tools Lite is a web-based project management tool designed to interact with the 42 API, providing functionality to fetch, filter, and display data related to projects rules and RNCP titles. The project uses Flask for the backend and JavaScript for the frontend.

# 42 Tools Lite

42 Tools Lite is a web-based project management tool designed to interact with the 42 API. It provides functionality to fetch, filter, and display data related to project rules and RNCP titles. This tool was developed as part of my academic journey at 42, aiming to optimize and streamline my progress throughout the curriculum.

By leveraging the capabilities of Flask for the backend and JavaScript for the frontend, 42 Tools Lite became a valuable resource for managing the vast array of projects and requirements inherent to the 42 cursus. It embodies practical solutions to real challenges I faced during my studies.

---

## Features

- Filter and format project rules for better readability.
- Serve dynamic pages for managing RNCP titles and project rules.
- Integrate seamlessly with the 42 API using OAuth2 for secure data access.

---

## Project Structure
```
.
├── backend.py          # Main Flask server for serving data and pages
├── creds.py            # Stores API credentials (client_id, client_secret, base_url)
├── data/
│   ├── data.json       # Stores filtered student data (created at first launch)
│   ├── rules.json      # Stores formatted project rules (created at first launch)
│   ├── rncp.json       # RNCP title data
│   ├── piscines.json   # Data for specific "piscine" sessions
├── scripts/
│   ├── index.js        # Frontend logic for the homepage
│   ├── rules.js        # JavaScript for handling project rules display
│   ├── rncp.js         # JavaScript for managing RNCP title data
├── templates/
│   ├── index.html      # Homepage for managing student and project data
│   ├── rules.html      # Page for viewing and filtering project rules
│   ├── rncp.html       # Page for RNCP title management
├── getDatas.py         # Script for fetching student data from the API
└── getRules.py         # Script for fetching project rules from the API
```

---

## Requirements

- **Python**: >= 3.7
- **Flask**: `pip install flask`
- **Requests**: `pip install requests`

---


## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/42-tools-lite.git
   cd 42-tools-lite
   ```

**2. Add your API credentials to creds.py:**

   ```python
   client_id = "YOUR_CLIENT_ID"
   client_secret = "YOUR_CLIENT_SECRET"
   base_url = "https://api.intra.42.fr"
   ```

You can get one here : https://profile.intra.42.fr/oauth/applications (Register new app)

**3. Start the Flask server:**

   ```bash
   python3 backend.py
   ```

**4. Access the application in your browser at http://127.0.0.1:5000.**
