const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export const getAuthToken = () => localStorage.getItem("authToken");

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem("authToken");
};

export const apiRequest = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || "Request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};
