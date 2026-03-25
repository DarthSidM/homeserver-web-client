"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { FileGrid } from "@/components/file-grid"
import { CreateModal } from "@/components/create-modal"

// Demo data - replace with actual API data
const DEMO_FILES = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    itemCount: 12,
    updatedAt: "2024-03-15",
  },
  {
    id: "2",
    name: "Photos",
    type: "folder",
    itemCount: 48,
    updatedAt: "2024-03-14",
  },
  {
    id: "3",
    name: "Projects",
    type: "folder",
    itemCount: 5,
    updatedAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Annual Report 2024.pdf",
    type: "file",
    mimeType: "application/pdf",
    size: 2456789,
    updatedAt: "2024-03-12",
  },
  {
    id: "5",
    name: "Presentation.pptx",
    type: "file",
    mimeType: "application/vnd.ms-powerpoint",
    size: 5678901,
    updatedAt: "2024-03-11",
  },
  {
    id: "6",
    name: "vacation-photo.jpg",
    type: "file",
    mimeType: "image/jpeg",
    size: 3456789,
    updatedAt: "2024-03-08",
  },
  {
    id: "7",
    name: "meeting-notes.txt",
    type: "file",
    mimeType: "text/plain",
    size: 12345,
    updatedAt: "2024-03-07",
  },
  {
    id: "8",
    name: "project-backup.zip",
    type: "file",
    mimeType: "application/zip",
    size: 15678901,
    updatedAt: "2024-03-05",
  },
]

export default function HomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load files on mount
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call to fetch files
        // Example:
        // const response = await fetch('/api/files', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // })
        // const data = await response.json()
        // setFiles(data.files)

        // Simulate API delay for demo
        await new Promise((resolve) => setTimeout(resolve, 500))
        setFiles(DEMO_FILES)
      } catch (error) {
        console.error("Failed to load files:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFiles()
  }, [])

  // Handle file upload
  const handleFileUpload = async (uploadedFiles) => {
    // TODO: After uploading to server, refresh the file list
    // Example:
    // await fetch('/api/files/upload', { ... })
    // await loadFiles() // Refresh the list

    // For demo: add mock files to the list
    const newFiles = uploadedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: "file",
      mimeType: file.type,
      size: file.size,
      updatedAt: new Date().toISOString(),
    }))
    setFiles((prev) => [...newFiles, ...prev])
    console.log("[v0] Files uploaded:", uploadedFiles)
  }

  // Handle folder creation
  const handleCreateFolder = async (folderName) => {
    // TODO: After creating folder on server, refresh the file list
    // Example:
    // await fetch('/api/folders', { ... })
    // await loadFiles() // Refresh the list

    // For demo: add mock folder to the list
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      type: "folder",
      itemCount: 0,
      updatedAt: new Date().toISOString(),
    }
    setFiles((prev) => [newFolder, ...prev])
    console.log("[v0] Folder created:", folderName)
  }

  // Handle opening a file or folder
  const handleOpen = (item) => {
    if (item.type === "folder") {
      // TODO: Navigate to folder or load folder contents
      // Example:
      // router.push(`/folder/${item.id}`)
      // or: loadFolderContents(item.id)
      console.log("[v0] Opening folder:", item.name)
    } else {
      // TODO: Open file preview or download
      // Example:
      // window.open(`/api/files/${item.id}/preview`)
      console.log("[v0] Opening file:", item.name)
    }
  }

  // Handle file/folder rename
  const handleRename = async (item) => {
    // TODO: Show rename dialog and update via API
    // Example:
    // const newName = prompt('Enter new name:', item.name)
    // if (newName) {
    //   await fetch(`/api/files/${item.id}`, {
    //     method: 'PATCH',
    //     body: JSON.stringify({ name: newName })
    //   })
    //   await loadFiles()
    // }
    console.log("[v0] Rename requested for:", item.name)
  }

  // Handle file/folder deletion
  const handleDelete = async (item) => {
    // TODO: Confirm and delete via API
    // Example:
    // if (confirm(`Delete "${item.name}"?`)) {
    //   await fetch(`/api/files/${item.id}`, { method: 'DELETE' })
    //   await loadFiles()
    // }
    
    // For demo: remove from list
    setFiles((prev) => prev.filter((f) => f.id !== item.id))
    console.log("[v0] Deleted:", item.name)
  }

  // Handle file download
  const handleDownload = async (item) => {
    // TODO: Trigger file download from API
    // Example:
    // const response = await fetch(`/api/files/${item.id}/download`)
    // const blob = await response.blob()
    // const url = window.URL.createObjectURL(blob)
    // const a = document.createElement('a')
    // a.href = url
    // a.download = item.name
    // a.click()
    console.log("[v0] Download requested for:", item.name)
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
            {/* TODO: Add breadcrumb navigation for nested folders */}
            {/* Example:
            <Breadcrumb>
              <BreadcrumbItem href="/">My Drive</BreadcrumbItem>
              <BreadcrumbItem href="/folder/1">Documents</BreadcrumbItem>
              <BreadcrumbItem>Reports</BreadcrumbItem>
            </Breadcrumb>
            */}
          </div>

          {/* File Grid */}
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
        onCreateFolder={handleCreateFolder}
      />
    </div>
  )
}
