const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getToken = () => localStorage.getItem("token");

const request = async (path, options = {}) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);
    return data;
};

export const api = {
    // Auth
    validateEmail: (email) => request("/api/auth/validate-email", { method: "POST", body: { email } }),
    signup: (body) => request("/api/auth/signup", { method: "POST", body }),
    login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
    me: () => request("/api/auth/me"),

    // Profile
    getProfile: (userId) => request(`/api/profiles/${userId}`),
    updateProfile: (userId, data) => request(`/api/profiles/${userId}`, { method: "PATCH", body: data }),

    // Admin
    getHostels: () => request("/api/admin/hostels"),
    createHostel: (body) => request("/api/admin/hostels", { method: "POST", body }),
    deleteHostel: (id) => request(`/api/admin/hostels/${id}`, { method: "DELETE" }),
    getHostelEmails: (id) => request(`/api/admin/hostels/${id}/emails`),
    importStudents: (body) => request("/api/admin/import-students", { method: "POST", body }),

    // Forum
    getPosts: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return request(`/api/forum/posts${q ? `?${q}` : ""}`);
    },
    createPost: (body) => request("/api/forum/posts", { method: "POST", body }),
    getPost: (id) => request(`/api/forum/posts/${id}`),
    updatePost: (id, body) => request(`/api/forum/posts/${id}`, { method: "PATCH", body }),
    deletePost: (id) => request(`/api/forum/posts/${id}`, { method: "DELETE" }),
    addComment: (postId, body) => request(`/api/forum/posts/${postId}/comments`, { method: "POST", body }),
    deleteComment: (id) => request(`/api/forum/comments/${id}`, { method: "DELETE" }),

    // Notifications
    getNotifications: () => request("/api/notifications"),
    markRead: (notification_ids) => request("/api/notifications/reads", { method: "POST", body: { notification_ids } }),
    broadcastNotification: (body) => request("/api/notifications", { method: "POST", body }),

    // Billing & Rebates
    getBillingSummary: () => request("/api/billing/summary"),
    getMyRebates: () => request("/api/billing/rebates"),
    applyRebate: (body) => request("/api/billing/rebates", { method: "POST", body }),
    getMyExtras: () => request("/api/billing/extras"),
    getAllRebates: () => request("/api/billing/rebates/all"),
    updateRebateStatus: (id, body) => request(`/api/billing/rebates/${id}`, { method: "PATCH", body }),
    deleteRebate: (id) => request(`/api/billing/rebates/${id}`, { method: "DELETE" }),

    // Extras Billing (Munimji/Admin)
    searchStudents: (q) => request(`/api/billing/students/search?q=${encodeURIComponent(q)}`),
    billExtras: (body) => request("/api/billing/extras", { method: "POST", body }),
    getRecentExtras: () => request("/api/billing/extras/recent"),
};

export const setToken = (token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
};

export default api;
