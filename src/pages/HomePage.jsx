"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { FileGrid } from "@/components/file-grid"
import { CreateModal } from "@/components/create-modal"
import { apiRequest } from "@/lib/api-interceptor"

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [requestError, setRequestError] = useState("")
  const [currentParentId, setCurrentParentId] = useState(null)
  const [pathStack, setPathStack] = useState([])

  const loadNodes = useCallback(async (parentId) => {
    setIsLoading(true)
    setRequestError("")

    try {
      const query = parentId ? `?parent_id=${encodeURIComponent(parentId)}` : "?parent_id="
      const response = await apiRequest(`/nodes${query}`, { method: "GET" })
      const nodes = response?.data?.nodes || []
      setFiles(nodes.map(normalizeNode))
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to load nodes"
      setRequestError(message)
      setFiles([])
      console.error("Failed to load nodes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load nodes when directory context changes.
  useEffect(() => {
    loadNodes(currentParentId)
  }, [currentParentId, loadNodes])

  // Handle file upload
  const handleFileUpload = async (uploadedFiles) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    setIsLoading(true)
    setRequestError("")

    const uploadPath = currentParentId
      ? `/files/upload/${encodeURIComponent(currentParentId)}`
      : "/files/upload"

    try {
      for (const file of uploadedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        await apiRequest(uploadPath, {
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      }

      await loadNodes(currentParentId)
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
      await apiRequest("/directories", {
        method: "POST",
        data: {
          name: trimmedName,
          parent_id: currentParentId,
        },
      })
      await loadNodes(currentParentId)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to create directory"
      setRequestError(message)
    }
  }

  // Handle opening a file or folder
  const handleOpen = (item) => {
    if (item.type === "folder") {
      setPathStack((prev) => [...prev, { id: item.id, name: item.name }])
      setCurrentParentId(item.id)
      return
    } else {
      // TODO: Open file preview or download
      // Example:
      // window.open(`/api/files/${item.id}/preview`)
      console.log("[v0] Opening file:", item.name)
    }
  }

  // Handle file/folder rename
  const handleRename = async (item) => {
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
      await apiRequest(`/nodes/${item.id}`, {
        method: "PATCH",
        data: { new_name: trimmedName },
      })
      await loadNodes(currentParentId)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to rename node"
      setRequestError(message)
    }
  }

  // Handle file/folder deletion
  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete "${item.name}"?`)
    if (!confirmed) return

    try {
      setRequestError("")
      await apiRequest(`/nodes/${item.id}`, {
        method: "DELETE",
      })
      await loadNodes(currentParentId)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to delete node"
      setRequestError(message)
    }
  }

  // Handle file download
  const handleDownload = async (item) => {
    try {
      setRequestError("")

      const response = await apiRequest(`/files/download/${encodeURIComponent(item.id)}`, {
        method: "GET",
        responseType: "blob",
      })

      const contentDisposition = response?.headers?.["content-disposition"] || ""
      const fileNameMatch = contentDisposition.match(/filename="?([^\"]+)"?/i)
      const downloadName = fileNameMatch?.[1] || item.name || "download"

      const blob = new Blob([response.data])
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = downloadName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to download file"
      setRequestError(message)
    }
  }

  const handleGoToRoot = () => {
    setPathStack([])
    setCurrentParentId(null)
  }

  const handleGoToPathIndex = (index) => {
    const nextPath = pathStack.slice(0, index + 1)
    setPathStack(nextPath)
    setCurrentParentId(nextPath[nextPath.length - 1]?.id || null)
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
                onClick={handleGoToRoot}
                className="whitespace-nowrap hover:text-foreground"
              >
                Root
              </button>
              {pathStack.map((entry, index) => (
                <Fragment key={entry.id}>
                  <span>/</span>
                  <button
                    type="button"
                    onClick={() => handleGoToPathIndex(index)}
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
              onRename={handleRename}
              onDelete={handleDelete}
              onDownload={handleDownload}
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
