'use client'

interface ManualTokenInputProps {
  manualToken: string
  onChange: (value: string) => void
  onSubmit: (token: string) => void
  disabled?: boolean
}

export function ManualTokenInput({
  manualToken,
  onChange,
  onSubmit,
  disabled = false,
}: ManualTokenInputProps) {
  const handleSubmit = () => {
    if (manualToken.trim() && !disabled) {
      onSubmit(manualToken.trim())
    }
  }

  return (
    <div className="w-full flex gap-1.5 pt-2 border-t border-[#E5D5BC] shrink-0">
      <input
        type="text"
        placeholder="Ingresar token o ID manual..."
        value={manualToken}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit()
          }
        }}
        disabled={disabled}
        className="flex-1 h-9 px-3 rounded-xl border border-[#E5D5BC] bg-[#FAF3E7] text-xs outline-none focus:border-[#DE9927] disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={!manualToken.trim() || disabled}
        className="bg-[#0D356A] hover:bg-[#09264D] disabled:opacity-50 text-white font-bold text-xs px-3.5 rounded-xl transition-colors cursor-pointer"
      >
        Marcar
      </button>
    </div>
  )
}
