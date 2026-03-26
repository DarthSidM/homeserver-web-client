import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { FileGrid } from "@/components/file-grid"
import { loadFavourites, handleRename, handleDelete, handleFavourite } from "@/apis/nodeOperations"
import { downloadFile } from "@/apis/fileOperations"

const normalizeNode = (node) => {
	const nodeType = (node.type || node.Type || "").toLowerCase()

	return {
		id: node.id || node.ID,
		parentId: node.parentId || node.ParentID || null,
		userId: node.userId || node.UserID,
		storageId: node.storageId || node.StorageID || null,
		name: node.name || node.Name,
		type: nodeType === "directory" ? "folder" : "file",
		itemCount: 0,
		size: node.size ?? node.Size ?? 0,
		mimeType: node.mimeType || node.MimeType || "",
		updatedAt: node.updatedAt || node.UpdatedAt || node.createdAt || node.CreatedAt,
	}
}

export default function FavouritePage() {
	const [favourites, setFavourites] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [requestError, setRequestError] = useState("")
	const token = localStorage.getItem("token")

	if (!token) {
		return <Navigate to="/login" replace />
	}

	useEffect(() => {
		const loadFavouritesHandler = async () => {
			setIsLoading(true)
			setRequestError("")

			try {
				const nodes = await loadFavourites()
				const normalizedNodes = nodes.map((node) => ({
					...normalizeNode(node),
					isFavourite: true,
				}))
				setFavourites(normalizedNodes)
			} catch (error) {
				const message = error?.response?.data?.error || error?.message || "Failed to load favourites"
				setRequestError(message)
				setFavourites([])
				console.error("Failed to load favourites:", error)
			} finally {
				setIsLoading(false)
			}
		}

		loadFavouritesHandler()
	}, [])

	const handleFavouriteNode = async (item) => {
		try {
			setRequestError("")
			await handleFavourite(item.id)
			const updatedFavourites = favourites.filter((fav) => fav.id !== item.id)
			setFavourites(updatedFavourites)
		} catch (error) {
			const message = error?.response?.data?.error || error?.message || "Failed to add to favourites"
			setRequestError(message)
		}
	}

	const handleRenameNode = async (item) => {
		const newName = window.prompt("Enter new name:", item.name)
		if (newName === null) return

		const trimmedName = newName.trim()
		if (!trimmedName) {
			setRequestError("Name cannot be empty")
			return
		}

		if (trimmedName === item.name) {
			return
		}

		try {
			setRequestError("")
			await handleRename(item.id, trimmedName)
			const updatedFavourites = favourites.map((fav) =>
				fav.id === item.id ? { ...fav, name: trimmedName } : fav
			)
			setFavourites(updatedFavourites)
		} catch (error) {
			const message = error?.response?.data?.error || error?.message || "Failed to rename node"
			setRequestError(message)
		}
	}

	const handleDeleteNode = async (item) => {
		const confirmed = window.confirm(`Delete "${item.name}"?`)
		if (!confirmed) return

		try {
			setRequestError("")
			await handleDelete(item.id)
			const updatedFavourites = favourites.filter((fav) => fav.id !== item.id)
			setFavourites(updatedFavourites)
		} catch (error) {
			const message = error?.response?.data?.error || error?.message || "Failed to delete node"
			setRequestError(message)
		}
	}

	const handleDownloadFile = async (item) => {
		try {
			setRequestError("")
			await downloadFile(item.id, item.name)
		} catch (error) {
			const message = error?.response?.data?.error || error?.message || "Failed to download file"
			setRequestError(message)
		}
	}

	return (
		<div className="flex h-screen flex-col bg-background">
			<Navbar />

			<div className="flex flex-1 overflow-hidden">
				<Sidebar onCreateClick={() => {}} />

				<main className="flex flex-1 flex-col overflow-hidden">
					<div className="border-b border-border px-6 py-4">
						<h1 className="text-xl font-semibold text-foreground">Favourites</h1>
					</div>

					{isLoading ? (
						<div className="flex flex-1 items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						</div>
					) : requestError ? (
						<div className="flex flex-1 items-center justify-center px-6">
							<p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{requestError}</p>
						</div>
					) : favourites.length === 0 ? (
						<div className="flex flex-1 items-center justify-center px-6">
							<p className="text-sm text-muted-foreground">No favourites yet.</p>
						</div>
					) : (
						<FileGrid
							items={favourites}
							onRename={handleRenameNode}
							onDelete={handleDeleteNode}
							onDownload={handleDownloadFile}
							onFavourite={handleFavouriteNode}
						/>
					)}
				</main>
			</div>
		</div>
	)
}
