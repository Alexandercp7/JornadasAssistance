'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, Role } from '@/store/useAuthStore'
import { RoleSelectionStep } from '@/components/auth/RoleSelectionStep'
import { PinKeypadStep } from '@/components/auth/PinKeypadStep'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setPin('')
    setError(false)
  }

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num
      setPin(nextPin)
      setError(false)
      if (nextPin.length === 4) {
        verifyPin(nextPin)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError(false)
  }

  const verifyPin = async (inputPin: string) => {
    setIsLoading(true)
    setError(false)
    try {
      const isValid = await login(selectedRole, inputPin)
      if (isValid) {
        router.push('/dashboard')
      } else {
        setError(true)
        setPin('')
      }
    } catch {
      setError(true)
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col bg-background text-foreground transition-colors">
      <div
        className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-6 ${
          selectedRole ? 'justify-start pt-14' : ''
        }`}
      >
        <div className="w-full max-w-sm space-y-6">
          {!selectedRole ? (
            <RoleSelectionStep onSelectRole={handleRoleSelect} />
          ) : (
            <PinKeypadStep
              selectedRole={selectedRole}
              pin={pin}
              error={error}
              isLoading={isLoading}
              onInputDigit={handlePinInput}
              onDeleteDigit={handleDelete}
              onCancel={() => setSelectedRole(null)}
            />
          )}
        </div>
      </div>
    </main>
  )
}