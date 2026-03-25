import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
const TOKEN_KEY = "token"

const api = axios.create({
	baseURL: API_BASE_URL,
})

const decodeJwtPayload = (token) => {
	try {
		const parts = token.split(".")
		if (parts.length < 2) return null

		const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
		return JSON.parse(payload)
	} catch {
		return null
	}
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || null

export const clearAuth = () => {
	localStorage.removeItem(TOKEN_KEY)
}

export const redirectToLogin = () => {
	if (window.location.pathname !== "/login") {
		window.location.href = "/login"
	}
}

export const logoutAndRedirect = () => {
	clearAuth()
	setTimeout(() => {
		redirectToLogin()
	}, 50)
}

export const isTokenExpired = (token, leewaySeconds = 30) => {
	if (!token) return true

	const payload = decodeJwtPayload(token)
	if (!payload || !payload.exp) return true

	const expMs = payload.exp * 1000
	const nowMs = Date.now()
	return nowMs + leewaySeconds * 1000 >= expMs
}

export const hasValidToken = () => {
	const token = getStoredToken()
	const valid = Boolean(token) && !isTokenExpired(token)

	if (!valid && token) {
		clearAuth()
	}

	return valid
}

export const ensureAuthenticated = () => {
	if (!hasValidToken()) {
		redirectToLogin()
		return false
	}

	return true
}

api.interceptors.request.use(
	(config) => {
		const token = getStoredToken()

		if (token && isTokenExpired(token)) {
			logoutAndRedirect()
			return Promise.reject(new axios.Cancel("Token expired"))
		}

		if (token) {
			config.headers = config.headers || {}
			config.headers.Authorization = `Bearer ${token}`
		}

		return config
	},
	(error) => Promise.reject(error),
)

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (axios.isCancel(error)) return Promise.reject(error)

		const status = error?.response?.status
		if (status === 401 || status === 403) {
			logoutAndRedirect()
		}

		return Promise.reject(error)
	},
)

export const apiRequest = (path, options = {}) => {
	const { auth = true, headers = {}, ...rest } = options

	if (!auth) {
		return api.request({
			url: path,
			headers,
			...rest,
		})
	}

	if (!ensureAuthenticated()) {
		return Promise.reject(new Error("Session expired. Please login again."))
	}

	return api.request({
		url: path,
		headers,
		...rest,
	})
}

export { API_BASE_URL }
export default api
