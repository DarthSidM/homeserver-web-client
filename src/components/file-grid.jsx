"use client"

import { 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio,
  FileCode,
  FileArchive,
  Folder,
  MoreVertical,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Get appropriate icon based on file type
function getFileIcon(type, mimeType) {
  if (type === "folder") return Folder
  
  if (mimeType) {
    if (mimeType.startsWith("image/")) return FileImage
    if (mimeType.startsWith("video/")) return FileVideo
    if (mimeType.startsWith("audio/")) return FileAudio
    if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText
    if (mimeType.includes("zip") || mimeType.includes("archive") || mimeType.includes("compressed")) return FileArchive
    if (mimeType.includes("javascript") || mimeType.includes("json") || mimeType.includes("html") || mimeType.includes("css")) return FileCode
  }
  
  return File
}

// Format file size for display
function formatFileSize(bytes) {
  if (!bytes) return ""
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function FileItem({ item, onOpen, onRename, onDelete, onDownload, onFavourite }) {
  const Icon = getFileIcon(item.type, item.mimeType)
  const isFolder = item.type === "folder"

  return (
    <div
      className="group relative flex flex-col items-center rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
      onDoubleClick={() => onOpen?.(item)}
    >
      {/* Favourite Button */}
      <div className="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
          onClick={() => onFavourite?.(item)}
        >
          <Star className="h-4 w-4" />
          <span className="sr-only">Add to Favourites</span>
        </Button>
      </div>

      {/* Icon */}
      <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-lg ${isFolder ? "bg-primary/10" : "bg-muted"}`}>
        <Icon className={`h-8 w-8 ${isFolder ? "text-primary" : "text-muted-foreground"}`} />
      </div>

      {/* Name */}
      <p className="mb-1 w-full truncate text-center text-sm font-medium text-card-foreground">
        {item.name}
      </p>

      {/* Meta info */}
      <p className="text-xs text-muted-foreground">
        {isFolder 
          ? `${item.itemCount || 0} items` 
          : formatFileSize(item.size)}
      </p>

      {/* Actions Menu */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpen?.(item)}>
              {isFolder ? "Open" : "Preview"}
            </DropdownMenuItem>
            {!isFolder && (
              <DropdownMenuItem onClick={() => onDownload?.(item)}>
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onRename?.(item)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(item)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function FileGrid({ items, onOpen, onRename, onDelete, onDownload, onFavourite }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Folder className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h3 className="mb-2 text-lg font-medium text-foreground">No files yet</h3>
        <p className="text-sm text-muted-foreground">
          {"Click the \"Create\" button to upload files or create folders"}
        </p>
      </div>
    )
  }

  // Separate folders and files, folders first
  const folders = items.filter((item) => item.type === "folder")
  const files = items.filter((item) => item.type !== "folder")
  const sortedItems = [...folders, ...files]

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Section: Folders */}
      {folders.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Folders</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {folders.map((folder) => (
              <FileItem
                key={folder.id}
                item={folder}
                onOpen={onOpen}
                onRename={onRename}
                onDelete={onDelete}
                onDownload={onDownload}
                onFavourite={onFavourite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section: Files */}
      {files.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Files</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {files.map((file) => (
              <FileItem
                key={file.id}
                item={file}
                onOpen={onOpen}
                onRename={onRename}
                onDelete={onDelete}
                onDownload={onDownload}
                onFavourite={onFavourite}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
