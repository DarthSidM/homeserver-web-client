"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { FileGrid } from "@/components/file-grid"
import { CreateModal } from "@/components/create-modal"
import { loadNodes, handleRename, handleDelete, handleFavourite, loadFavourites } from "@/apis/nodeOperations"
import { uploadFiles, downloadFile } from "@/apis/fileOperations"
import { createDirectory } from "@/apis/directoryOperations"
import { handleGoToRoot, handleGoToPathIndex, openItem } from "@/apis/navigationHelper"

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

export default function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [requestError, setRequestError] = useState("")
  const [currentParentId, setCurrentParentId] = useState(null)
  const [pathStack, setPathStack] = useState([])
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const loadNodesHandler = useCallback(async (parentId) => {
    setIsLoading(true)
    setRequestError("")

    try {
      const [nodes, favouriteNodes] = await Promise.all([
        loadNodes(parentId),
        loadFavourites(),
      ])

      const favouriteIds = new Set(favouriteNodes.map((node) => node.id || node.ID))
      const normalizedNodes = nodes.map((node) => ({
        ...normalizeNode(node),
        isFavourite: favouriteIds.has(node.id || node.ID),
      }))

      setFiles(normalizedNodes)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to load nodes"
      setRequestError(message)
      setFiles([])
      console.error("Failed to load nodes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle search result selection from navbar
  useEffect(() => {
    if (location.state?.selectedNode) {
      const normalizedNode = normalizeNode(location.state.selectedNode)
      openItem(normalizedNode, setPathStack, setCurrentParentId, navigate)
      // Clear the state to prevent re-opening on navigation back
      window.history.replaceState({}, document.title)
    }
  }, [location.state?.selectedNode, navigate])

  // Load nodes when directory context changes.
  useEffect(() => {
    loadNodesHandler(currentParentId)
  }, [currentParentId, loadNodesHandler])

  // Handle file upload
  const handleFileUpload = async (uploadedFiles) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    setIsLoading(true)
    setRequestError("")

    try {
      await uploadFiles(uploadedFiles, currentParentId)
      await loadNodesHandler(currentParentId)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to upload file"
      setRequestError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle directory creation
  const handleCreateDirectory = async (directoryName) => {
    const trimmedName = directoryName?.trim()
    if (!trimmedName) {
      setRequestError("Directory name cannot be empty")
      return
    }

    try {
      setRequestError("")
      await createDirectory(trimmedName, currentParentId)
      await loadNodesHandler(currentParentId)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to create directory"
      setRequestError(message)
    }
  }

  // Handle opening a file or folder
  const handleOpen = (item) => {
    openItem(item, setPathStack, setCurrentParentId, navigate)
  }

  // Handle file/folder rename
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
      await loadNodesHandler(currentParentId)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to rename node"
      setRequestError(message)
    }
  }

  // Handle file/folder deletion
  const handleDeleteNode = async (item) => {
    const confirmed = window.confirm(`Delete "${item.name}"?`)
    if (!confirmed) return

    try {
      setRequestError("")
      await handleDelete(item.id)
      await loadNodesHandler(currentParentId)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to delete node"
      setRequestError(message)
    }
  }

  // Handle marking as favourite
  const handleFavouriteNode = async (item) => {
    try {
      setRequestError("")
      await handleFavourite(item.id)
      // Toggle the favourite status in UI
      const updatedFiles = files.map((file) =>
        file.id === item.id ? { ...file, isFavourite: !file.isFavourite } : file
      )
      setFiles(updatedFiles)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to add to favourites"
      setRequestError(message)
    }
  }

  // Handle file download
  const handleDownloadFile = async (item) => {
    try {
      setRequestError("")
      await downloadFile(item.id, item.name)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to download file"
      setRequestError(message)
    }
  }

  const handleGoToRootClicked = () => {
    handleGoToRoot(setPathStack, setCurrentParentId)
  }

  const handleGoToPathIndexClicked = (index) => {
    handleGoToPathIndex(index, pathStack, setPathStack, setCurrentParentId)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar onCreateClick={() => setIsCreateModalOpen(true)} />

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Breadcrumb / Title */}
          <div className="border-b border-border px-6 py-4">
            <h1 className="text-xl font-semibold text-foreground">My Drive</h1>
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

          {/* File Grid */}
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : requestError ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{requestError}</p>
            </div>
          ) : (
            <FileGrid
              items={files}
              onOpen={handleOpen}
              onRename={handleRenameNode}
              onDelete={handleDeleteNode}
              onDownload={handleDownloadFile}
              onFavourite={handleFavouriteNode}
            />
          )}
        </main>
      </div>

      {/* Create Modal */}
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFileUpload={handleFileUpload}
        onCreateFolder={handleCreateDirectory}
      />
    </div>
  )
}
