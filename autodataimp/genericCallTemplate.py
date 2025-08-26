import requests
import json
import os

def make_api_request(url, method="POST", headers=None, data=None, params=None):
    """
    Makes a generic API request to a specified URL.

    Args:
        url (str): The API endpoint URL.
        method (str): The HTTP method to use (e.g., "GET", "POST", "PUT", "DELETE").
                      Defaults to "POST".
        headers (dict, optional): A dictionary of HTTP headers to send with the request.
                                  Defaults to None.
        data (dict or str, optional): The data payload to send with the request.
                                      For POST/PUT, this will be JSON-encoded if a dict.
                                      Defaults to None.
        params (dict, optional): A dictionary of URL parameters to send with the request.
                                 Defaults to None.

    Returns:
        dict: The JSON response from the API, or an error dictionary if the request failed.
    """
    if headers is None:
        headers = {}

    # Ensure Content-Type is set for JSON data if a dictionary is provided
    if isinstance(data, dict) and 'Content-Type' not in headers:
        headers['Content-Type'] = 'application/json'
        data_to_send = json.dumps(data)
    else:
        data_to_send = data

    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, data=data_to_send, params=params)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=headers, data=data_to_send, params=params)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, params=params)
        else:
            return {"success": False, "error": f"Unsupported HTTP method: {method}"}

        # Raise an HTTPError for bad responses (4xx or 5xx)
        response.raise_for_status()

        # Attempt to parse JSON response. Some APIs might return non-JSON on success.
        try:
            return response.json()
        except json.JSONDecodeError:
            print(f"Warning: Response is not valid JSON. Status: {response.status_code}")
            print(f"Raw response content: {response.text}")
            return {"success": True, "message": "Request successful, but response is not JSON.", "raw_response": response.text}

    except requests.exceptions.ConnectionError as e:
        print(f"Error: Could not connect to {url}. Please check the URL and network connection.")
        return {"success": False, "error": f"Connection failed: {e}"}
    except requests.exceptions.HTTPError as e:
        print(f"Error: HTTP request failed with status {e.response.status_code} for {url}.")
        print(f"Details: {e}")
        print(f"Response content: {e.response.text}")
        return {"success": False, "error": f"HTTP Error: {e.response.status_code} - {e.response.text}"}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"success": False, "error": f"Unexpected error: {e}"}

if __name__ == "__main__":
    # --- Example Usage: Pushing data to a generic API endpoint ---

    # 1. Define your API endpoint URL
    # Replace with the actual URL you want to send data to
    TARGET_API_URL = "https://jsonplaceholder.typicode.com/posts" # Example public API for testing POST

    # 2. Define your headers (e.g., for authentication, content type)
    # If your API requires an API key or token, add it here.
    # Example for an API key: {"Authorization": "Bearer YOUR_API_TOKEN"}
    # Example for a custom header: {"X-Custom-Header": "MyValue"}
    # Content-Type for JSON is automatically added if 'data' is a dict and not already set.
    CUSTOM_HEADERS = {
        # "X-API-Key": os.getenv("MY_API_KEY", "YOUR_API_KEY_HERE")
    }

    # 3. Define the data payload you want to send (as a Python dictionary)
    # This dictionary will be converted to JSON automatically.
    DATA_TO_PUSH = {
        "title": "My New Item",
        "body": "This is the content of the new item.",
        "userId": 1
    }

    print(f"Attempting to push data to: {TARGET_API_URL}")
    print(f"Data: {DATA_TO_PUSH}")

    # Make a POST request to create a new item
    post_result = make_api_request(
        url=TARGET_API_URL,
        method="POST",
        headers=CUSTOM_HEADERS,
        data=DATA_TO_PUSH
    )

    if post_result.get("success"):
        print("\nData pushed successfully!")
        print(f"Response: {json.dumps(post_result, indent=2)}")
    else:
        print("\nFailed to push data.")
        print(f"Error details: {post_result.get('error', 'Unknown error')}")

    print("\n--- Example Usage: Fetching data (GET request) ---")
    # Example for fetching data from a generic API endpoint
    FETCH_API_URL = "https://jsonplaceholder.typicode.com/posts/1" # Example public API for testing GET
    GET_PARAMS = {"_limit": 1} # Example URL parameters

    get_result = make_api_request(
        url=FETCH_API_URL,
        method="GET",
        headers=CUSTOM_HEADERS,
        params=GET_PARAMS
    )

    if get_result.get("success"):
        print("\nData fetched successfully!")
        print(f"Response: {json.dumps(get_result, indent=2)}")
    else:
        print("\nFailed to fetch data.")
        print(f"Error details: {get_result.get('error', 'Unknown error')}")

