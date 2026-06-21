import ky from "ky";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = ky.create({
  prefixUrl: API_URL,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        request.headers.set("X-Request-Id", crypto.randomUUID());
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401) return response;

        try {
          const refreshResponse = await fetch(`${API_URL}/api/v1/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          if (refreshResponse.ok) {
            const data = (await refreshResponse.json()) as { accessToken: string };
            localStorage.setItem("accessToken", data.accessToken);
            request.headers.set("Authorization", `Bearer ${data.accessToken}`);
            return ky(request);
          }
        } catch {
          // Refresh failed — clear state and redirect
        }

        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return response;
      },
    ],
  },
});
