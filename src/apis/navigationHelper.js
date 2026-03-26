export const handleNavigateToFolder = (item, setPathStack, setCurrentParentId) => {
  if (item.type === "folder") {
    setPathStack((prev) => [...prev, { id: item.id, name: item.name }])
    setCurrentParentId(item.id)
    return true
  }
  return false
}

export const openItem = (item, setPathStack, setCurrentParentId) => {
  const isFolder = handleNavigateToFolder(item, setPathStack, setCurrentParentId)
  if (!isFolder) {
    // TODO: Open file preview or download
    // Example:
    // window.open(`/api/files/${item.id}/preview`)
    console.log("[v0] Opening file:", item.name)
  }
}

export const handleGoToRoot = (setPathStack, setCurrentParentId) => {
  setPathStack([])
  setCurrentParentId(null)
}

export const handleGoToPathIndex = (index, pathStack, setPathStack, setCurrentParentId) => {
  const nextPath = pathStack.slice(0, index + 1)
  setPathStack(nextPath)
  setCurrentParentId(nextPath[nextPath.length - 1]?.id || null)
}
