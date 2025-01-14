/**
 * Loads a specific page dynamically into the content container.
 *
 * @param {string} page - The name of the page to load (e.g., 'rules', 'rncp').
 *
 * The function fetches the content of the specified page and updates the
 * inner HTML of the element with the ID 'content'. After loading, it initializes
 * any required scripts or logic specific to the loaded page.
 * - If the page is 'rules', it calls `initRulesPage`.
 * - If the page is 'rncp', it calls `initRNCP`.
 *
 * Errors during the fetch process are logged to the console.
 */
function loadPage(page) {
    fetch(`/${page}`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
            if (page === 'rules') {
                initRulesPage();
            }
            if (page === 'rncp') {
                initRNCP();
            }
        })
        .catch(error => console.error('Loading page error:', error));
}

/**
 * Executes inline scripts contained within a specific container.
 *
 * @param {HTMLElement} container - The HTML container element whose scripts should be executed.
 *
 * The function iterates over all `<script>` elements within the provided container,
 * creates new `<script>` elements, and appends them to the container. This ensures
 * that inline JavaScript is re-evaluated and executed dynamically.
 */
function executeScripts(container) {
    const scripts = container.getElementsByTagName("script");
    for (let script of scripts) {
        const newScript = document.createElement("script");
        newScript.text = script.text;
        container.appendChild(newScript).parentNode.removeChild(newScript);
    }
}

/**
 * Initializes the page by dynamically loading the 'rncp' page on window load.
 *
 * The `window.onload` event triggers the `loadPage` function to load the 'rncp' page
 * as the default content when the page is first loaded.
 */
window.onload = () => {
    loadPage('rncp');
};
