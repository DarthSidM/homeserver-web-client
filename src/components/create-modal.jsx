"use client"

import { useRef, useState } from "react"
import { FolderPlus, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateModal({ isOpen, onClose, onFileUpload, onCreateFolder }) {
  const [view, setView] = useState("options") // "options" | "folder"
  const [folderName, setFolderName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileSelect = async (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // TODO: Add your file upload API call here
      // Example:
      // const formData = new FormData()
      // for (const file of files) {
      //   formData.append('files', file)
      // }
      // const response = await fetch('/api/files/upload', {
      //   method: 'POST',
      //   body: formData,
      // })
      // const data = await response.json()
      
      // Call parent handler with selected files
      onFileUpload?.(Array.from(files))
      onClose()
    }
  }

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return

    setIsCreating(true)
    try {
      // TODO: Add your create folder API call here
      // Example:
      // const response = await fetch('/api/folders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: folderName }),
      // })
      // const data = await response.json()
      // if (!response.ok) throw new Error(data.message)

      // Simulate API delay for demo
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Call parent handler with folder name
      onCreateFolder?.(folderName)
      setFolderName("")
      setView("options")
      onClose()
    } catch (error) {
      console.error("Failed to create folder:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setView("options")
    setFolderName("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground">
            {view === "options" ? "Create New" : "New Folder"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {view === "options" ? (
          <div className="flex flex-col gap-3">
            {/* Upload File Option */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Upload File</p>
                <p className="text-sm text-muted-foreground">
                  Upload files from your device
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              // TODO: Add accepted file types if needed
              // accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            />

            {/* Create Folder Option */}
            <button
              onClick={() => setView("folder")}
              className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FolderPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">New Folder</p>
                <p className="text-sm text-muted-foreground">
                  Create a new folder to organize files
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="folderName" className="text-foreground">
                Folder Name
              </Label>
              <Input
                id="folderName"
                type="text"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="bg-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder()
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setView("options")}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!folderName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
