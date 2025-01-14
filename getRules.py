import requests
import json
from urllib.parse import urlencode
from creds import base_url, get_access_token

def filter_project_data(projects):
    """
    Filters and formats raw project data into a structured format.
    Args: projects (list): A list of raw project data from the 42 API.
    Returns: list: A list of dictionaries containing filtered and formatted project data, including:
                - `name`: The name of the project.
                - `infos`: A dictionary with the project's description, estimated time, and difficulty.
                - `project_sessions_rules`: A dictionary with formatted rule descriptions.
    """
    filtered_projects = []
    for project in projects:
        filtered_project = {
            'name': project['project'].get('name', None),
            'infos': {
                'description': project.get('description', None),
                'estimate_time': project.get('estimate_time', None),
                'difficulty': project['project'].get('difficulty', None)
            },
            'project_sessions_rules': format_rules(project.get('project_sessions_rules', []))
        }
        filtered_projects.append(filtered_project)
    return filtered_projects

def format_rules(rules):
    """
    Formats project session rules into a human-readable structure.
    Args: rules (list): A list of rules associated with a project session.
    Returns: dict: A dictionary containing formatted rule descriptions. Each rule is keyed by a unique identifier
                (e.g., "Kind rule1") and contains a description with dynamic placeholders replaced.
    """
    rule_descriptions = {}
    for i, rule in enumerate(rules, start=1):
        kind = rule['rule'].get('kind', '').capitalize()
        description = rule['rule'].get('description', '')
        params = rule.get('params', [])

        if rule['rule'].get('internal_name') == "GroupSizeBetweenNAndM":
            n_value, m_value = (param.get('value', '') for param in params)
            description = description.replace('%{n}', n_value).replace('%{m}', m_value)
        elif rule['rule'].get('internal_name') == "MatchingDelay":
            pass
        else:
            for param in params:
                placeholder = description.find("%{")
                if placeholder != -1:
                    end = description.find("}", placeholder)
                    param_value = param.get('value', '')
                    description = description[:placeholder] + param_value + description[end+1:]

        rule_key = f'{kind} rule{i}'
        rule_descriptions[rule_key] = description

    return rule_descriptions

def get_projects():
    """
    Retrieves all project sessions from the 42 API for a specific campus.
    Fetches data in a paginated manner and combines all results.
    Returns: list: A list of raw project session data.
    Raises: Exception: If the request to fetch projects fails.
    """
    token = get_access_token()
    endpoint = f'{base_url}/v2/project_sessions/'
    params = {
        'filter[campus_id]': '41',
        'page[size]': 100,
        'page[number]': 1
    }
    headers = {
        'Authorization': f'Bearer {token}'
    }
    all_projects = []
    while True:
        print(f'Getting projects page {params["page[number]"]}...')
        response = requests.get(endpoint, params=params, headers=headers)
        if response.status_code != 200:
            print(response.json())
            raise Exception('Failed to get projects')

        data = response.json()
        all_projects.extend(data)

        if 'next' not in response.links:
            break

        params['page[number]'] += 1

    return all_projects

def main():
    """
    Main entry point for the script.
    - Fetches all project session data from the 42 API.
    - Filters and formats the project data.
    - Saves the filtered data to `data/rules.json` in JSON format.
    """
    projects = get_projects()
    projects = filter_project_data(projects)
    with open('data/rules.json', 'w') as f:
        json.dump(projects, f, indent=4)

if __name__ == '__main__':

    main()
