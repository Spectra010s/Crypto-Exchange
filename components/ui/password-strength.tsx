"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
  onStrengthChange?: (strength: number, isValid: boolean) => void
}

interface PasswordRule {
  id: string
  label: string
  regex: RegExp
  test: (password: string) => boolean
}

const passwordRules: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    regex: /.{8,}/,
    test: (password) => password.length >= 8
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    regex: /[A-Z]/,
    test: (password) => /[A-Z]/.test(password)
  },
  {
    id: "lowercase", 
    label: "One lowercase letter",
    regex: /[a-z]/,
    test: (password) => /[a-z]/.test(password)
  },
  {
    id: "number",
    label: "One number",
    regex: /\d/,
    test: (password) => /\d/.test(password)
  },
  {
    id: "special",
    label: "One special character",
    regex: /[!@#$%^&*(),.?":{}|<>]/,
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
]

export function PasswordStrength({ password, onStrengthChange }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  const [passedRules, setPassedRules] = useState<string[]>([])

  useEffect(() => {
    const passed = passwordRules.filter(rule => rule.test(password)).map(rule => rule.id)
    setPassedRules(passed)
    
    const strengthScore = passed.length
    setStrength(strengthScore)
    
    const isValid = strengthScore >= 4 // Require at least 4 out of 5 rules
    onStrengthChange?.(strengthScore, isValid)
  }, [password, onStrengthChange])

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200"
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    if (strength <= 4) return "bg-orange-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength === 0) return "Enter password"
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  if (!password) return null

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password Strength</span>
          <span className={`font-medium ${
            strength <= 2 ? "text-red-600" :
            strength <= 3 ? "text-yellow-600" :
            strength <= 4 ? "text-orange-600" :
            "text-green-600"
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Password Rules */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Password must contain:</p>
        <div className="space-y-1">
          {passwordRules.map((rule) => {
            const isPassed = passedRules.includes(rule.id)
            return (
              <div key={rule.id} className="flex items-center space-x-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isPassed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                }`}>
                  {isPassed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
                <span className={isPassed ? "text-green-600" : "text-gray-500"}>
                  {rule.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function validatePassword(password: string): { isValid: boolean; strength: number; errors: string[] } {
  const errors: string[] = []
  let strength = 0

  passwordRules.forEach(rule => {
    if (rule.test(password)) {
      strength++
    } else {
      errors.push(rule.label)
    }
  })

  return {
    isValid: strength >= 4,
    strength,
    errors
  }
}