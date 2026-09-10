import apiClient from "./apiClient.js";

// PROFILE
export async function getParentProfile() {
    const response = await apiClient.get("/api/parent/me");
    return response.data;
}

export async function updateParentProfile(data) {
    const response = await apiClient.patch("/api/parent/me", data);
    return response.data;
}

export async function updateParentPassword(data) {
    const response = await apiClient.patch("/api/parent/me/password", data);
    return response.data;
}

// CHILDREN
export async function getChildren() {
    const response = await apiClient.get("/api/parent/children");
    return response.data;
}

export async function getChild(id) {
    const response = await apiClient.get(`/api/parent/children/${id}`);
    return response.data;
}

export async function getChildSessions(id, params) {
    const response = await apiClient.get(`/api/parent/children/${id}/sessions`, { params });
    return response.data;
}

// CLASSES
export async function getClasses(params) {
    const response = await apiClient.get("/api/parent/classes", { params });
    return response.data;
}

// INVOICES
export async function getInvoices(params) {
    const response = await apiClient.get("/api/parent/invoices", { params });
    return response.data;
}

export async function getInvoice(id) {
    const response = await apiClient.get(`/api/parent/invoices/${id}`);
    return response.data;
}

export async function downloadInvoicePdf(id) {
    const response = await apiClient.get(`/api/parent/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
}

export async function sendInvoiceEmail(id, data = {}) {
    const response = await apiClient.post(`/api/parent/invoices/${id}/send-email`, data);
    return response.data;
}
