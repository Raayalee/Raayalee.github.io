import { apiRequest } from "./client";

export const getApplications = (fromDate) => {
  const query = fromDate ? `?from=${encodeURIComponent(fromDate)}` : "";
  return apiRequest(`/api/applications${query}`);
};

export const saveApplication = (payload) =>
  apiRequest("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload)
  });
