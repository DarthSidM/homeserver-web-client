import { Navigate } from "react-router-dom"
import HomePage from "./HomePage"

export default function HomePageWrapper() {
	const token = localStorage.getItem("token")

	if (!token) {
		return <Navigate to="/login" replace />
	}

	return <HomePage />
}
