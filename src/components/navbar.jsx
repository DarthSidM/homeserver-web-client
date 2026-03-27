"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Cloud, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchNodes } from "@/apis/nodeOperations"
import { handleNavigateToFolder, openItem } from "@/apis/navigationHelper"

export function Navbar() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  // Handle search input
  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim()) {
      setShowResults(true)
      const results = await searchNodes(query)
      setSearchResults(results)
    } else {
      setShowResults(false)
      setSearchResults([])
    }
  }

  // Handle search result click
  const handleResultClick = (item) => {
    setSearchQuery("")
    setShowResults(false)
    setSearchResults([])
    
    // Navigate to home and handle opening/navigating
    navigate("/", { state: { selectedNode: item } })
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    
    localStorage.removeItem('token')
    
    // Redirect to login page
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Cloud className="h-7 w-7 text-primary" />
        <span className="text-xl font-semibold text-foreground">CloudVault</span>
      </div>

      {/* Search Bar - Hidden on mobile */}
      <div className="hidden max-w-md flex-1 px-8 md:block" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files and folders..."
            className="w-full bg-input pl-10"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchQuery && setShowResults(true)}
          />
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.ID}
                  onClick={() => handleResultClick(item)}
                  className="w-full text-left px-4 py-2 hover:bg-accent flex items-center gap-3 border-b border-border last:border-b-0 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.Name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.Type === "directory" ? "📁 Folder" : "📄 File"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showResults && searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 px-4 py-3 text-center text-sm text-muted-foreground">
              No files or folders found
            </div>
          )}
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        {/* TODO: Add user avatar/profile here */}
        {/* Example:
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        */}
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
