"use client"

import React, { useState } from "react"
import { updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UsernameSetupProps {
  onComplete: () => void
  currentUser: any
}

export function UsernameSetup({ onComplete, currentUser }: UsernameSetupProps) {
  const [username, setUsername] = useState(currentUser?.displayName || "")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    if (username.length < 2) {
      toast({
        title: "Error",
        description: "Username must be at least 2 characters long",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: username.trim()
        })
        
        toast({
          title: "Success",
          description: "Username set successfully!",
        })
        
        onComplete()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set username",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const skipSetup = () => {
    toast({
      title: "Skipped",
      description: "You can set your username later in settings",
    })
    onComplete()
  }

  return (
    <div className="min-h-screen flex items-center justify-center app-background p-4">
      <Card className="w-full max-w-md shadow-xl content-overlay">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Set Your Username</CardTitle>
          <CardDescription>
            Choose a username that will be displayed with your email: {currentUser?.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-gray-500">
                This will be displayed as: {username.trim() || "Your Username"} ({currentUser?.email})
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              disabled={loading}
            >
              {loading ? "Setting..." : (
                <>
                  Set Username
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={skipSetup}
              className="text-purple-600 hover:text-purple-700"
              disabled={loading}
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}