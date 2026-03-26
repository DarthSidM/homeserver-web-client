import { useEffect, useState } from "react"
import { Fragment, useCallback } from "react"
import { Navigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { FileGrid } from "@/components/file-grid"
import { loadFavourites, handleRename, handleDelete, handleFavourite, loadNodes } from "@/apis/nodeOperations"
import { downloadFile } from "@/apis/fileOperations"
import { openItem, handleGoToRoot, handleGoToPathIndex } from "@/apis/navigationHelper"

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
	const [currentParentId, setCurrentParentId] = useState("")
	const [pathStack, setPathStack] = useState([])
	const token = localStorage.getItem("token")

	if (!token) {
		return <Navigate to="/login" replace />
	}

	useEffect(() => {
		const loadFavouritesHandler = async () => {
			setIsLoading(true)
			setRequestError("")

			try {
				const [allFavourites, nodesInDirectory] = await Promise.all([
					loadFavourites(),
					loadNodes(currentParentId),
				])

				// Create a set of favourite IDs for efficient lookup
				const favouriteIds = new Set(allFavourites.map((node) => node.id || node.ID))

				// Filter nodes to show only those that are marked as favourite
				const favouritesInDirectory = nodesInDirectory.filter((node) =>
					favouriteIds.has(node.id || node.ID)
				)

				const normalizedNodes = favouritesInDirectory.map((node) => ({
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
	}, [currentParentId])

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

	// Handle opening a file or folder
	const handleOpen = (item) => {
		openItem(item, setPathStack, setCurrentParentId)
	}

	const handleGoToRootClicked = () => {
		handleGoToRoot(setPathStack, setCurrentParentId)
	}

	const handleGoToPathIndexClicked = (index) => {
		handleGoToPathIndex(index, pathStack, setPathStack, setCurrentParentId)
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
						<div className="mt-2 flex items-center gap-2 overflow-x-auto text-sm text-muted-foreground">
							<button
								type="button"
								onClick={handleGoToRootClicked}
								className="whitespace-nowrap hover:text-foreground"
							>
								Root
							</button>
							{pathStack.map((entry, index) => (
								<Fragment key={entry.id}>
									<span>/</span>
									<button
										type="button"
										onClick={() => handleGoToPathIndexClicked(index)}
										className="whitespace-nowrap hover:text-foreground"
									>
										{entry.name}
									</button>
								</Fragment>
							))}
						</div>
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
							onOpen={handleOpen}
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
