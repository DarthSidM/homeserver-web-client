import { apiRequest } from "@/lib/api-interceptor"

export const loadNodes = async (parentId) => {
  const query = parentId ? `?parent_id=${encodeURIComponent(parentId)}` : "?parent_id="
  const response = await apiRequest(`/nodes${query}`, { method: "GET" })
  return response?.data?.nodes || []
}

export const loadFavourites = async () => {
  const response = await apiRequest("/nodes/favourites/", { method: "GET" })
  return response?.data?.nodes || []
}

export const handleRename = async (itemId, newName) => {
  await apiRequest(`/nodes/${itemId}`, {
    method: "PATCH",
    data: { new_name: newName },
  })
}

export const handleDelete = async (itemId) => {
  await apiRequest(`/nodes/${itemId}`, {
    method: "DELETE",
  })
}

export const handleFavourite = async (itemId) => {
  await apiRequest(`/nodes/favourites/?node_id=${encodeURIComponent(itemId)}`, {
    method: "POST",
  })
}
