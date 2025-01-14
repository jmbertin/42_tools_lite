let projects = [];

/**
 * Initializes the rules page by loading project data, displaying projects,
 * and setting up event listeners for user interactions.
 * The function fetches project rules from `rules.json`, displays them dynamically,
 * and attaches event listeners for search, sorting, and filtering functionalities.
 */
function initRulesPage() {
    fetch('./rules.json')
        .then(response => response.json())
        .then(data => {
            projects = data;
            displayProjects(projects);
        })
        .catch(error => console.error('Error loading data:', error));

    document.getElementById('projectSearchBox').addEventListener('input', searchProjects);
    document.getElementById('sortSelect').addEventListener('change', sortProjects);
    document.getElementById('includeSoloProjects').addEventListener('change', filterProjects);
    document.getElementById('includeGroupProjects').addEventListener('change', filterProjects);
};

/**
 * Displays the list of projects in the provided container.
 * @param {Array} data - The list of project objects to display.
 * For each project, it dynamically creates a card with project details,
 * such as name, difficulty, type (solo or group), and estimated time.
 * Rules are displayed under a collapsible section for each project.
 */
function displayProjects(data) {
    const container = document.getElementById('projectsList');
    container.innerHTML = '';
    data.forEach((project, index) => {
        const projectType = getProjectType(project.project_sessions_rules);
        const timeBadge = `<span class="badge badge-pill badge-primary">${project.infos.estimate_time}</span>`;
        const projectDiv = document.createElement('div');
        projectDiv.className = 'card mb-3 shadow-sm';
        projectDiv.innerHTML = `
            <div class="card-header">
                <h5 class="card-title">
                    ${project.name}
                    <span class="badge badge-pill badge-info">${project.infos.difficulty} exp</span>
                    ${projectType.badge}
                    ${timeBadge}
                </h5>
            </div>
            <div class="card-body">
                <p class="card-text">${project.infos.description}</p>
                <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                    Voir les règles
                </button>
                <div class="collapse" id="collapse${index}">
                    ${groupRulesByCategory(project.project_sessions_rules)}
                </div>
            </div>`;
        container.appendChild(projectDiv);
    });
    const projectCountElement = document.getElementById('projectCount');
    projectCountElement.textContent = `(Projets affichés : ${data.length})`;

    container.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON' && event.target.getAttribute('data-toggle') === 'collapse') {
            const targetSelector = event.target.getAttribute('data-target');
            const target = document.querySelector(targetSelector);
            if (target) {
                target.classList.toggle('show');
            }
        }
    });
}

/**
 * Determines the type of a project based on its session rules.
 * @param {Object} rules - The project session rules object.
 * @returns {Object} - An object containing the badge HTML for the project type.
 */
function getProjectType(rules) {
    for (let rule in rules) {
        if (rule.startsWith("Group_validation")) {
            const groupInfo = rules[rule].match(/contain between (\d+) and (\d+) students/);
            if (groupInfo) {
                return { badge: `<span class="badge badge-pill badge-warning">Groupe ${groupInfo[1]}/${groupInfo[2]}</span>` };
            }
        }
    }
    return { badge: `<span class="badge badge-pill badge-success">Solo</span>` };
}

/**
 * Groups project rules by category and formats them as an HTML string.
 * @param {Object} rules - The project session rules object.
 * @returns {string} - The HTML string containing grouped rules by category.
 */
function groupRulesByCategory(rules) {
    const categories = { 'Correction': [], 'Inscription': [], 'Autres': [] };
    Object.entries(rules).forEach(([key, value]) => {
        const category = key.split(' ')[0];
        categories[category] ? categories[category].push(`${key}: ${value}`) : categories['Autres'].push(`${key}: ${value}`);
    });

    return Object.entries(categories).map(([category, rules]) =>
        `<h6>${category}</h6><ul>${rules.map(rule => `<li>${rule}</li>`).join('')}</ul>`
    ).join('');
}

/**
 * Filters projects based on the search term entered in the search box.
 * The function matches the project name or description with the search term
 * and updates the displayed projects.
 */
function searchProjects() {
    const searchTerm = document.getElementById('projectSearchBox').value.toLowerCase();
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm) ||
        project.infos.description.toLowerCase().includes(searchTerm)
    );
    displayProjects(filteredProjects);
}

/**
 * Sorts projects based on the selected criteria in the sort dropdown.
 * Sorting options include difficulty (ascending or descending) and alphabetical order.
 * The sorted projects are then displayed.
 */
function sortProjects() {
    const sortBy = document.getElementById('sortSelect').value;
    let sortedProjects = [...projects];
    if (sortBy === "difficultyAscending") {
        sortedProjects.sort((a, b) => a.infos.difficulty - b.infos.difficulty);
    } else if (sortBy === "difficultyDescending") {
        sortedProjects.sort((a, b) => b.infos.difficulty - a.infos.difficulty);
    } else if (sortBy === "alphabetical") {
        sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
    }
    displayProjects(sortedProjects);
}

/**
 * Filters projects based on their type (solo or group).
 * The function checks the selected checkboxes for solo and group projects
 * and filters the displayed projects accordingly.
 */
function filterProjects() {
    const includeSolo = document.getElementById('includeSoloProjects').checked;
    const includeGroup = document.getElementById('includeGroupProjects').checked;

    const filteredProjects = projects.filter(project => {
        const isGroupProject = Object.keys(project.project_sessions_rules)
            .some(rule => rule.startsWith("Group_validation"));
        return (includeGroup && isGroupProject) || (includeSolo && !isGroupProject);
    });

    displayProjects(filteredProjects);
}
