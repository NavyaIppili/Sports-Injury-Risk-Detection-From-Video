const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new Error(`Unable to connect to the authentication service at ${API_BASE_URL}. Make sure the backend is running.`);
  }

  let responseBody;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const message = responseBody?.detail ?? 'Request failed. Please try again.';
    throw new Error(message);
  }

  return responseBody;
}

export function loginUser(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function signupUser(account) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(account),
  });
}
