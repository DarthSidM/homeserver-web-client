"use client"

import { NavLink } from "react-router-dom"
import { Plus, Home, Star, Trash2, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"

// Navigation items for the sidebar
const navItems = [
  { icon: Home, label: "My Drive", href: "/" },
  { icon: Star, label: "Favourites", href: "/favourites" },
  // { icon: Trash2, label: "Trash", href: "/trash" },
]

export function Sidebar({ onCreateClick }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Create Button */}
      <div className="p-4">
        <Button
          onClick={onCreateClick}
          className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Create</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors ${
                    isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "text-sidebar-foreground" : "text-muted-foreground"}`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Storage Info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <HardDrive className="h-5 w-5" />
          <div className="flex-1">
            <div className="mb-1 flex justify-between">
              <span>Storage</span>
              {/* TODO: Fetch actual storage usage from API */}
              <span>2.5 GB of 15 GB</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              {/* TODO: Calculate percentage from actual usage */}
              <div 
                className="h-full rounded-full bg-primary" 
                style={{ width: "17%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
