let rncpTitles = [];
let projectRules = [];
let pools = [];

/**
 * Displays the RNCP form.
 */
function displayRncpForm() {
    const container = document.getElementById('rncpTitles');
    container.innerHTML = '';

    if (!Array.isArray(rncpTitles)) {
        console.error('RNCP Titles data is not loaded properly.');
        return;
    }

    rncpTitles.forEach(title => {
        const titleDiv = document.createElement('div');
        titleDiv.className = 'card mb-4';
        titleDiv.innerHTML = `
            <div class="card-header">
                <h2 class="card-title">${title.title} - ${title.specialty}</h2>
            </div>
            <div class="card-body">
                ${title.categories.map(category => displayCategory(category)).join('')}
            </div>
        `;
        container.appendChild(titleDiv);
    });
}

/**
 * Loads data from JSON files and initializes the form.
 */
function loadData() {
    Promise.all([
        fetch('./rncp.json').then(response => response.json()),
        fetch('./rules.json').then(response => response.json()),
        fetch('./piscines.json').then(response => response.json())
    ]).then(([dataRncpTitles, dataProjectRules, dataPools]) => {
        if (dataRncpTitles && Array.isArray(dataRncpTitles.rncpTitles)) {
            rncpTitles = dataRncpTitles.rncpTitles;
        } else {
            console.error('Invalid RNCP titles data');
        }
        projectRules = dataProjectRules;
        pools = dataPools.piscines;
        displayRncpForm();
    }).catch(error => {
        console.error('Error loading data:', error);
    });
}

/**
 * Truncates text to a specified maximum length.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - The maximum length for the text.
 * @returns {string} - The truncated text.
 */
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    } else {
        return text;
    }
}

/**
 * Displays a project (whether it is part of a pool or not).
 * @param {string} projectName - The name of the project.
 * @param {boolean} isPool - Flag to indicate if the project is part of a pool.
 * @returns {string} - The HTML string for the project.
 */
function displayProject(projectName, isPool = false) {
    let poolProjectsHtml = "";
    let difficulty;
    let poolId = "";

    if (isPool) {
        poolId = projectName.replace(/\s+/g, '-').toLowerCase(); // Create unique identifier
        console.log(pools);
        const poolInfo = pools.find(p => p.title === projectName);
        if (poolInfo) {
            difficulty = poolInfo.projects.reduce((acc, p) => acc + p.difficulty, 0);

            poolProjectsHtml = poolInfo.projects.map(p => {
                return `
                    <tr class="pool-details collapse ${poolId}">
                        <td>${truncateText(p.name, 25)}</td>
                        <td>${p.difficulty}</td>
                        <td><input type="text" class="form-control grade-input" placeholder="" data-difficulty="${p.difficulty}" data-project-name="${p.name}" /></td>
                        <td class="final-score">0</td>
                    </tr>
                `;
            }).join('');
        }

        return `
            <tr class="pool-header">
                <td>${truncateText(projectName, 25)} <i class="fas fa-eye toggle-icon" data-pool-id="${poolId}"></i></td>
                <td>${difficulty}</td>
                <td></td>
                <td class="total-pool-score">0</td>
            </tr>
            ${poolProjectsHtml}
        `;
    } else {
        if (projectName.startsWith('tokenizer')) {
            difficulty = 9450;
        }
        else {
            difficulty = projectRules.find(p => p.name === projectName)?.infos.difficulty || 'N/A';
        }
        return `
            <tr>
                <td>${truncateText(projectName, 25)}</td>
                <td>${difficulty}</td>
                <td><input type="text" class="form-control grade-input" placeholder="" data-difficulty="${difficulty}" data-project-name="${projectName}" /></td>
                <td class="final-score">0</td>
            </tr>
        `;
    }
}

/**
 * Displays a category and its projects.
 * @param {object} category - The category to display.
 * @returns {string} - The HTML string for the category.
 */
function displayCategory(category) {
    const projectsHtml = category.projects.map(project => {
        let isPool = project.startsWith("piscine");
        return displayProject(project, isPool);
    }).join('');

    return `
        <div class="card mb-3 category-card" data-min-projects="${category.minProjects}" data-min-exp="${category.minExp}">
            <div class="card-header">
                ${category.name}<br><span class="projects-completed">0</span>/${category.minProjects} projects   <br><span class="total-exp">0</span>/${category.minExp} exp
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 70%;">Name</th>
                            <th style="width: 8%;">Exp</th>
                            <th style="width: 14%;">Grade</th>
                            <th style="width: 8%;">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${projectsHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Updates the total experience and projects for a category.
 * @param {HTMLElement} categoryCard - The category card element to update.
 */
function updateTotalExpAndProjects(categoryCard) {
    let totalExp = 0;
    let projectsCompleted = 0;

    const poolHeaders = categoryCard.querySelectorAll('.pool-header');
    poolHeaders.forEach(poolHeader => {
        let totalPoolScore = 0;
        let gradeAssigned = false;
        let nextRow = poolHeader.nextElementSibling;
        while (nextRow && !nextRow.classList.contains('pool-header')) {
            const input = nextRow.querySelector('.grade-input');
            const finalScore = parseFloat(nextRow.querySelector('.final-score').textContent) || 0;
            if (input && input.value !== "") {
                gradeAssigned = true;
            }
            totalPoolScore += finalScore;
            nextRow = nextRow.nextElementSibling;
        }
        if (gradeAssigned) {
            projectsCompleted += 1;
        }
        poolHeader.querySelector('.total-pool-score').textContent = totalPoolScore;
    });

    const normalProjects = categoryCard.querySelectorAll('tr:not(.pool-header)');
    normalProjects.forEach(tr => {
        const input = tr.querySelector('.grade-input');
        if (input && input.value !== "") {
            const grade = parseFloat(input.value);
            const difficulty = parseFloat(input.dataset.difficulty);
            if (!isNaN(grade)) {
                totalExp += Math.round((grade / 100) * difficulty);
                if (!tr.classList.contains('pool-details'))
                    projectsCompleted++;
            }
        }
    });

    const totalExpElement = categoryCard.querySelector('.total-exp');
    const projectsCompletedElement = categoryCard.querySelector('.projects-completed');
    totalExpElement.textContent = totalExp;
    projectsCompletedElement.textContent = projectsCompleted;

    const minProjects = parseInt(categoryCard.dataset.minProjects, 10);
    const minExp = parseInt(categoryCard.dataset.minExp, 10);

    if (projectsCompleted >= minProjects && totalExp >= minExp) {
        categoryCard.classList.remove('category-incomplete');
        categoryCard.classList.add('category-complete');
    } else {
        categoryCard.classList.remove('category-complete');
        categoryCard.classList.add('category-incomplete');
    }
}

/**
 * Automatically fills in the grades for a specific student.
 * @param {string} studentLogin - The login of the student.
 */
function autoFillGrades(studentLogin) {
    document.querySelectorAll('.grade-input').forEach(input => {
        input.value = "";
        const finalScoreCell = input.parentElement.nextElementSibling;
        finalScoreCell.textContent = "0";
    });
    fetch('./data.json')
        .then(response => response.json())
        .then(studentsData => {
            const student = studentsData.find(s => s.login === studentLogin);
            if (student) {
                student.projects.forEach(project => {
                    if (project.status === 'finished' && project.final_mark !== null) {
                        const inputElements = document.querySelectorAll(`.grade-input[data-project-name="${project.name}"]`);
                        inputElements.forEach(input => {
                            input.value = project.final_mark;
                            const finalScoreCell = input.parentElement.nextElementSibling;
                            const difficulty = parseFloat(input.dataset.difficulty);
                            const finalScore = Math.round((project.final_mark / 100) * difficulty);
                            finalScoreCell.textContent = finalScore;
                        });
                    }
                });
            }
            document.querySelectorAll('.category-card').forEach(categoryCard => {
                updateTotalExpAndProjects(categoryCard);
            });
        })
        .catch(error => {
            console.error('Error loading student data:', error);
        });
}

/**
 * Loads the list of students and populates the student selector.
 */
function loadStudentList() {
    fetch('./data.json')
        .then(response => response.json())
        .then(studentsData => {
            const selectStudent = document.getElementById('selectStudent');
            studentsData.sort((a, b) => a.login.localeCompare(b.login));

            // Si un seul étudiant est dans la liste, on cache le sélecteur
            if (studentsData.length === 1) {
                selectStudent.style.display = 'none'; // Masquer le sélecteur
                autoFillGrades(studentsData[0].login); // Remplir les grades de l'unique étudiant
            } else {
                // Sinon, on affiche le sélecteur et on ajoute les options
                studentsData.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.login;
                    option.textContent = student.login;
                    selectStudent.appendChild(option);
                });

                // Si un utilisateur est déjà sélectionné, on charge les grades
                if (selectStudent.value) {
                    autoFillGrades(selectStudent.value);
                }
            }
        })
        .catch(error => {
            console.error('Error loading student list:', error);
        });
}

/**
 * Toggles the visibility of the pool projects.
 * @param {string} poolId - The ID of the pool to toggle.
 */
function togglePool(poolId) {
    const details = document.querySelectorAll(`.${poolId}`);
    details.forEach(detail => {
        detail.classList.toggle('collapse');
    });
}

/**
 * Initializes the RNCP form by loading data and setting up event listeners.
 */
function initRNCP() {
    loadData();
    loadStudentList();

    const selectStudent = document.getElementById('selectStudent');
    if (selectStudent) {
        selectStudent.addEventListener('change', (e) => {
            const studentLogin = e.target.value;
            autoFillGrades(studentLogin);
        });
    } else {
        console.error("Element 'selectStudent' not found!");
    }
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toggle-icon')) {
            const poolId = e.target.dataset.poolId;
            togglePool(poolId);
        }
    });
    document.getElementById('selectStudent').addEventListener('change', (e) => {
        const studentLogin = e.target.value;
        autoFillGrades(studentLogin);
    });
}
