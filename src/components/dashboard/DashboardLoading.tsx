import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6ECD9] text-[#0D356A] space-y-4">
      <div className="relative w-16 h-16 rounded-full border-2 border-[#DE9927] p-1 bg-white shadow-md animate-pulse">
        <Image
          src="/logo.png"
          alt="Logo MJVC"
          fill
          priority
          sizes="64px"
          className="object-cover rounded-full"
        />
      </div>
      <div className="flex items-center gap-2 text-[#0D356A] text-sm font-bold">
        <Loader2 className="w-4 h-4 animate-spin text-[#DE9927]" />
        <span>Cargando sistema MJVC...</span>
      </div>
    </div>
  )
}
