import axios from 'axios'

const host = import.meta.env.VITE_API_HOST || 'https://ecole.ccib38.fr';

const baseURL = host;

const TOKEN_KEY = "auth_token";


export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}


const apiClient = axios.create({
    baseURL: baseURL,
});

apiClient.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Non authorise — redirection vers login')
        }
        return Promise.reject(error)
    }
)

export default apiClient