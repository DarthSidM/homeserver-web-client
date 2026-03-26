import { apiRequest } from "@/lib/api-interceptor"

export const createDirectory = async (directoryName, currentParentId) => {
  await apiRequest("/directories", {
    method: "POST",
    data: {
      name: directoryName,
      parent_id: currentParentId,
    },
  })
}
