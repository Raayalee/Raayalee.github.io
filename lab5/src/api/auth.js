import { apiRequest } from "./client";

export const registerUser = (email, password) =>
  apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

export const loginUser = (email, password) =>
  apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

export const getProfile = () => apiRequest("/api/auth/profile");
