'use client'

import { useState } from 'react'
import { useDashboardSession } from '@/hooks/useDashboardSession'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardLoading } from '@/components/dashboard/DashboardLoading'
import { QrScannerModal } from '@/components/attendance/QrScannerModal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isVerifying } = useDashboardSession()
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)

  if (isVerifying) {
    return <DashboardLoading />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6ECD9] text-[#0D356A]">
      <DashboardHeader onOpenScanner={() => setIsQrScannerOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 pb-24 sm:pb-8">
        {children}
      </main>

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
      />
    </div>
  )
}