import { useEffect, useRef, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { apiRequest } from "@/lib/api-interceptor"

const waitForDocsApi = async (timeoutMs = 8000) => {
  const intervalMs = 100
  const maxTries = Math.ceil(timeoutMs / intervalMs)

  for (let i = 0; i < maxTries; i += 1) {
    if (window.DocsAPI && typeof window.DocsAPI.DocEditor === "function") {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error("OnlyOffice DocsAPI is not loaded. Check the script in index.html.")
}

export default function EditorPage() {
  const { fileId } = useParams()
  const [error, setError] = useState("")
  const editorRef = useRef(null)
  const didInitRef = useRef(false)
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  async function openEditor(targetFileId) {
    const response = await apiRequest(`/files/${encodeURIComponent(targetFileId)}/editor-config`, {
      method: "GET",
    })
    const rawConfig = response.data || {}

    if (!rawConfig?.documentType || !rawConfig?.document?.url || !rawConfig?.editorConfig?.callbackUrl) {
      throw new Error("Invalid editor configuration from server")
    }

    const editorConfig = {
      ...rawConfig,
      type: rawConfig.type || (window.innerWidth < 768 ? "mobile" : "desktop"),
      editorConfig: {
        ...(rawConfig.editorConfig || {}),
        mode: rawConfig?.editorConfig?.mode || "edit",
      },
    }

    await waitForDocsApi()

    editorRef.current = new window.DocsAPI.DocEditor("editor", editorConfig)
  }

  useEffect(() => {
    let isDisposed = false

    const initializeEditor = async () => {
      if (!fileId || didInitRef.current) return
      didInitRef.current = true

      try {
        setError("")
        await openEditor(fileId)
      } catch (initError) {
        if (!isDisposed) {
          setError(initError?.response?.data?.error || initError?.message || "Failed to load editor")
        }
      }
    }

    initializeEditor()

    return () => {
      isDisposed = true
      if (editorRef.current && typeof editorRef.current.destroyEditor === "function") {
        editorRef.current.destroyEditor()
      }
      editorRef.current = null
      didInitRef.current = false
    }
  }, [fileId])

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-base font-semibold text-foreground">OnlyOffice Editor</h1>
        <Link to="/" className="text-sm text-primary hover:underline">
          Back to Drive
        </Link>
      </div>

      {error ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        </div>
      ) : (
        <div id="editor" style={{ height: "100vh" }} />
      )}
    </div>
  )
}
