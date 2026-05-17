// src/api/authApi.js
import apiClient, { saveToken, removeToken } from "./apiClient.js";

export async function login(credentials) {
    const response = await apiClient.post("/api/login", credentials);

    const token = response.data.token || response.data.tokens;

    if (!token) {
        throw new Error("Token not found in login response");
    }

    saveToken(token);
    return response.data;
}

export async function register(payload) {
    const formData = new FormData();

    formData.append("firstName", payload.firstName);
    formData.append("lastName", payload.lastName);
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    formData.append("company", payload.company || "");
    formData.append("preferredLanguage", payload.preferredLanguage || "fr");

    if (Array.isArray(payload.roles)) {
        payload.roles.forEach((role) => {
            formData.append("roles[]", role);
        });
    }

    if (payload.picture instanceof File) {
        formData.append("picture", payload.picture);
    }

    const response = await apiClient.post("/register", formData);

    return response.data;
}

export async function getCurrentUser() {
    try {
        const response = await apiClient.get("/api/me");
        return response.data;
    } catch (e) {
        if (e.response?.status === 404 || e.response?.status === 401) {
            return {};
        }
        throw e;
    }
}

export async function updateProfile(profileData) {
    const hasPictureFile = profileData.picture instanceof File;

    if (hasPictureFile) {
        const formData = new FormData();

        if (profileData.firstName !== undefined) {
            formData.append("firstName", profileData.firstName ?? "");
        }

        if (profileData.lastName !== undefined) {
            formData.append("lastName", profileData.lastName ?? "");
        }

        if (profileData.email !== undefined) {
            formData.append("email", profileData.email ?? "");
        }

        if (profileData.company !== undefined) {
            formData.append("company", profileData.company ?? "");
        }

        if (profileData.preferredLanguage !== undefined) {
            formData.append("preferredLanguage", profileData.preferredLanguage ?? "fr");
        }

        if (Array.isArray(profileData.roles)) {
            profileData.roles.forEach((role) => {
                formData.append("roles[]", role);
            });
        }

        formData.append("picture", profileData.picture);

        const response = await apiClient.patch("/api/me", formData);

        return response.data;
    }

    const response = await apiClient.patch("/api/me", {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        company: profileData.company,
        preferredLanguage: profileData.preferredLanguage,
        roles: profileData.roles,
    });

    return response.data;
}

export function logout() {
    removeToken();
}