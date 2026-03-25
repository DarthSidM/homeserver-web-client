"use client"

import { useNavigate } from "react-router-dom"
import { Cloud, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navbar() {
  const navigate = useNavigate()

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
      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files and folders..."
            className="w-full bg-input pl-10"
            // TODO: Add search functionality
            // onChange={(e) => handleSearch(e.target.value)}
          />
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
