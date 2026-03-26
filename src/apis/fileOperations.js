import { apiRequest } from "@/lib/api-interceptor"

export const uploadFiles = async (uploadedFiles, currentParentId) => {
  const uploadPath = currentParentId
    ? `/files/upload/${encodeURIComponent(currentParentId)}`
    : "/files/upload"

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
}

export const downloadFile = async (itemId, itemName) => {
  const response = await apiRequest(`/files/download/${encodeURIComponent(itemId)}`, {
    method: "GET",
    responseType: "blob",
  })

  const contentDisposition = response?.headers?.["content-disposition"] || ""
  const fileNameMatch = contentDisposition.match(/filename="?([^\"]+)"?/i)
  const downloadName = fileNameMatch?.[1] || itemName || "download"

  const blob = new Blob([response.data])
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = blobUrl
  link.download = downloadName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}
