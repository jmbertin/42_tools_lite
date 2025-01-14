import requests

base_url = 'https://api.intra.42.fr'
client_id = "YOUR_CLIENT_ID"
client_secret = "YOUR_CLIENT_SECRET"

def get_access_token():
    """
    Retrieves an access token from the 42 API.
    Uses the client credentials from `client_id` and `client_secret` to
    obtain an access token via the OAuth2 client credentials grant.
    Returns: str: The access token.
    Raises:  Exception: If the token request fails, an exception is raised with the error details.
    """
    auth_endpoint = f'{base_url}/oauth/token'
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret
    }
    response = requests.post(auth_endpoint, data=data)
    if response.status_code == 200:
        return response.json()['access_token']
    else:
        print(response.text)
        raise Exception('Failed to get access token')
