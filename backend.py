from flask import Flask, send_from_directory, redirect, jsonify
import os
from datetime import datetime, timedelta
from threading import Thread

def update_students_data_async():
    """
    Executes the script `getDatas.py` asynchronously to update student data.
    This function calls the script using the `os.system` command to fetch
    and store updated data for students.
    """
    os.system("python3 getDatas.py")

def update_rules_data():
    """
    Executes the script `getRules.py` to update the rules data.
    This function calls the script using the `os.system` command to fetch
    and store updated rules data.
    """
    os.system("python3 getRules.py")

app = Flask(__name__)


# Scripts --------------------------------------------------------------------

@app.route('/rules.js')
def rules_script():
    """
    Serves the JavaScript file `rules.js`.
    Returns: Response: The `rules.js` file from the `scripts` directory.
    """
    return send_from_directory('.', 'scripts/rules.js')

@app.route('/index.js')
def index_script():
    """
    Serves the JavaScript file `index.js`.
    Returns: Response: The `index.js` file from the `scripts` directory.
    """
    return send_from_directory('.', 'scripts/index.js')

@app.route('/rncp.js')
def rncp_script():
    """
    Serves the JavaScript file `rncp.js`.
    Returns: Response: The `rncp.js` file from the `scripts` directory.
    """
    return send_from_directory('.', 'scripts/rncp.js')

# Data -----------------------------------------------------------------------

@app.route('/rules.json')
def rules_json():
    """
    Serves the JSON file `rules.json`.
    Returns: Response: The `rules.json` file from the `data` directory.
    """
    return send_from_directory('.', 'data/rules.json')

@app.route('/rncp.json')
def rncp_json():
    """
    Serves the JSON file `rncp.json`.
    Returns: Response: The `rncp.json` file from the `data` directory.
    """
    return send_from_directory('.', 'data/rncp.json')

@app.route('/piscines.json')
def piscines_json():
    """
    Serves the JSON file `piscines.json`.
    Returns: Response: The `piscines.json` file from the `data` directory.
    """
    return send_from_directory('.', 'data/piscines.json')

@app.route('/data.json')
def data_json():
    """
    Serves the JSON file `data.json`.
    Returns: Response: The `data.json` file from the `data` directory.
    """
    return send_from_directory('.', 'data/data.json')


# Pages ----------------------------------------------------------------------

@app.route('/')
def home():
    """
    Serves the `index.html` file.
    Returns: Response: The `index.html` file from the root directory.
    """
    return send_from_directory('./templates', 'index.html')

@app.route('/rules')
def rules():
    """
    Serves the `rules.html` file.
    Returns: Response: The `rules.html` file from the root directory.
    """
    return send_from_directory('templates', 'rules.html')

@app.route('/rncp')
def rncp():
    """
    Serves the `rncp.html` file.
    Returns: Response: The `rncp.html` file from the root directory.
    """
    return send_from_directory('templates', 'rncp.html')

def checkJsonBeforeStart():
    """
    Checks if the JSON files are present before starting the server.
    If the JSON files are not present, the function creates them.
    If the JSON files are present, the function asks the user if they want to update the data.json file.
    """
    if not os.path.exists('./data/rules.json'):
        print ("No rules.json file found, creating one...")
        update_rules_data()
    if not os.path.exists('./data/data.json'):
        print ("No data.json file found, creating one...")
        update_students_data_async()
    else:
        lastModified = datetime.fromtimestamp(os.path.getmtime('./data/data.json'))
        print("Last data.json modification: ", lastModified)
        r = input("Would you like to update the data.json file? (y/n)")
        if r == 'y':
            update_students_data_async()
        else:
            print("Starting server...")

def main():
    checkJsonBeforeStart()
    app.run(host='0.0.0.0', debug=False)

if __name__ == '__main__':
    main()
