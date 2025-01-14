import requests
import json
from urllib.parse import urlencode
import time
from creds import base_url, get_access_token

def get_student_data(student_login, token):
    """
    Fetches data for a specific student from the 42 API.
    Args: student_login (str): The login of the student.
          token (str): The access token for authentication.
    Returns: dict: A dictionary containing the student's data if successful, or None on failure.
    """
    student_endpoint = f'{base_url}/v2/users/{student_login}'
    headers = {'Authorization': f'Bearer {token}'}

    try:
        response = requests.get(student_endpoint, headers=headers)
        response.raise_for_status()
    except requests.HTTPError as http_err:
        print(f'Error HTTP : {http_err}')
        print(response.text)
        return None
    except Exception as err:
        print(f'Error : {err}')
        return None

    return response.json()

def get_student_projects(student_login, token):
    """
    Fetches all project data for a specific student from the 42 API.
    Args: student_login (str): The login of the student.
          token (str): The access token for authentication.
    Returns: list: A list of dictionaries, each representing a project associated with the student.
    """
    projects = []
    page = 1
    per_page = 100
    has_next_page = True

    while has_next_page:
        start_time = time.time()

        projects_endpoint = f'{base_url}/v2/users/{student_login}/projects_users'
        params = {
            'page': page,
            'per_page': per_page
        }
        headers = {'Authorization': f'Bearer {token}'}
        encoded_params = urlencode(params)
        full_url = f'{projects_endpoint}?{encoded_params}'

        try:
            response = requests.get(full_url, headers=headers)
            response.raise_for_status()
        except requests.HTTPError as http_err:
            print(f'Error HTTP : {http_err}')
            print(response.text)
            break
        except Exception as err:
            print(f'Error : {err}')
            print(response.text)
            break
        else:
            projects_data = response.json()
            projects.extend(projects_data)
            if len(projects_data) < per_page:
                has_next_page = False

        elapsed_time = time.time() - start_time
        if elapsed_time < 0.60:
            time.sleep(0.60 - elapsed_time)

        page += 1

    return projects

def filter_students_data(students):
    """
    Filters and formats student data for storage.
    This function filters student data to include only relevant information, such as:
    - Login
    - Small version of the profile image
    - Projects associated with the `cursus_ids` value of 21.
    The filtered data is saved in `data/data.json`.
    Args: students (list): A list of dictionaries containing student data.
    """
    filtered_students = []
    for student in students:
        filtered_student = {}
        filtered_student['login'] = student['login']
        filtered_student['image_link'] = student['image']['versions']['small']
        filtered_projects = []
        for project in student['projects']:
            if 21 in project['cursus_ids']:
                filtered_project = {
                    'status': project['status'],
                    'name': project['project']['name'],
                    'updated_at': project['updated_at'],
                    'final_mark': project['final_mark']}
                filtered_projects.append(filtered_project)
        filtered_student['projects'] = filtered_projects
        filtered_students.append(filtered_student)

    with open('data/data.json', 'w') as file:
        json.dump(filtered_students, file, indent=4)

def main():
    """
    Main entry point for the script.
    - Prompts the user for a student login.
    - Retrieves the student's data from the 42 API.
    - Fetches all projects associated with the student.
    - Filters and saves the data to `data/data.json`.
    """
    token = get_access_token()
    student_login = input("Please enter the login of the student: ")
    print(f"Getting data for student {student_login}...")
    student_data = get_student_data(student_login, token)

    if not student_data:
        print("Failed to retrieve student data.")
        return

    print(f"Student {student_login} found.")
    student_projects = get_student_projects(student_login, token)

    student_data['projects'] = student_projects
    filter_students_data([student_data])
    print(f"Data for student {student_login} saved to data/data.json.")

if __name__ == "__main__":
    main()
