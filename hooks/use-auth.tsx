"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut, updateProfile as firebaseUpdateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  updateProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  updateProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const updateProfile = async (profile: { displayName?: string; photoURL?: string }) => {
    if (!user) {
      throw new Error("No user is currently signed in")
    }

    try {
      await firebaseUpdateProfile(user, profile)
      // Trigger a re-render by updating the user state
      setUser({ ...user, ...profile })
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, loading, logout, updateProfile }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
