'use client'

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { Check, X } from 'lucide-react'
import { AttendanceStatus } from '@/store/useAttendanceStore'

interface FloatingAttendanceToolbarProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: AttendanceStatus
  onSelectStatus: (status: AttendanceStatus) => void
  memberName: string
  sessionLabel: string
  anchorEl?: HTMLElement | null
  anchorRect?: DOMRect | null
}

const STATUS_CONFIG: {
  status: AttendanceStatus
  symbol: string
  bgClass: string
  borderClass: string
  textClass: string
}[] = [
    {
      status: 'PRESENT',
      symbol: '✓',
      bgClass: 'bg-[#1F6B5C] hover:bg-[#185549]',
      borderClass: 'border-[#1F6B5C]',
      textClass: 'text-[#F3E7C8]',
    },
    {
      status: 'LATE',
      symbol: 'R',
      bgClass: 'bg-[#D87532] hover:bg-[#C26526]',
      borderClass: 'border-[#D87532]',
      textClass: 'text-[#F3E7C8]',
    },
    {
      status: 'LATE_JUSTIFIED',
      symbol: 'RJ',
      bgClass: 'bg-[#C87D2F] hover:bg-[#B36F27]',
      borderClass: 'border-[#C87D2F]',
      textClass: 'text-[#F3E7C8]',
    },
    {
      status: 'ABSENT',
      symbol: '✗',
      bgClass: 'bg-[#7A2634] hover:bg-[#641E2A]',
      borderClass: 'border-[#7A2634]',
      textClass: 'text-[#F3E7C8]',
    },
    {
      status: 'ABSENT_JUSTIFIED',
      symbol: 'FJ',
      bgClass: 'bg-[#9E3B4D] hover:bg-[#882F3F]',
      borderClass: 'border-[#9E3B4D]',
      textClass: 'text-[#F3E7C8]',
    },
  ]

export function FloatingAttendanceToolbar({
  isOpen,
  onClose,
  currentStatus,
  onSelectStatus,
  memberName,
  sessionLabel,
  anchorEl,
  anchorRect: initialAnchorRect,
}: FloatingAttendanceToolbarProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [measuredHeight, setMeasuredHeight] = useState<number>(95)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(
    initialAnchorRect || (anchorEl ? anchorEl.getBoundingClientRect() : null)
  )

  // Medir la altura real del toolbar una vez montado
  useLayoutEffect(() => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect()
      if (rect.height > 0) {
        setMeasuredHeight(rect.height)
      }
    }
  }, [isOpen])

  // Actualizar la posición del ancla en tiempo real cuando se produce scroll o resize
  const updateAnchorPosition = useCallback(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      // Si el elemento fue completamente escroleado fuera de la ventana visible, cerramos
      if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        rect.right < 0 ||
        rect.left > window.innerWidth
      ) {
        onClose()
      } else {
        setAnchorRect(rect)
      }
    } else if (initialAnchorRect) {
      setAnchorRect(initialAnchorRect)
    }
  }, [anchorEl, initialAnchorRect, onClose])

  // Manejar eventos de scroll, resize y teclado
  useEffect(() => {
    if (!isOpen) return

    updateAnchorPosition()

    const handleScrollOrResize = () => {
      updateAnchorPosition()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, updateAnchorPosition, onClose])

  if (!isOpen || !anchorRect) return null

  const toolbarWidth = 230
  const GAP = 12 // Separación garantizada para jamás tapar el elemento seleccionado
  const VIEWPORT_PADDING = 12

  const spaceAbove = anchorRect.top
  const spaceBelow = window.innerHeight - anchorRect.bottom

  // Decidir si va arriba o abajo asegurando que NO tape el elemento seleccionado
  let placeAbove = spaceAbove >= measuredHeight + GAP + VIEWPORT_PADDING || spaceAbove >= spaceBelow

  let calculatedTop: number

  if (placeAbove) {
    calculatedTop = anchorRect.top - measuredHeight - GAP
    // Si se sale de la parte superior pero abajo cabe completo
    if (calculatedTop < VIEWPORT_PADDING && spaceBelow >= measuredHeight + GAP + VIEWPORT_PADDING) {
      placeAbove = false
      calculatedTop = anchorRect.bottom + GAP
    } else if (calculatedTop < VIEWPORT_PADDING) {
      calculatedTop = Math.min(VIEWPORT_PADDING, anchorRect.top - measuredHeight - 6)
    }
  } else {
    calculatedTop = anchorRect.bottom + GAP
    // Si se sale de la parte inferior pero arriba cabe completo
    if (calculatedTop + measuredHeight > window.innerHeight - VIEWPORT_PADDING && spaceAbove >= measuredHeight + GAP + VIEWPORT_PADDING) {
      placeAbove = true
      calculatedTop = anchorRect.top - measuredHeight - GAP
    } else if (calculatedTop + measuredHeight > window.innerHeight - VIEWPORT_PADDING) {
      calculatedTop = Math.max(window.innerHeight - measuredHeight - VIEWPORT_PADDING, anchorRect.bottom + 6)
    }
  }

  // Centrado horizontal en relación al sello, con límite en los bordes de la pantalla
  const centeredLeft = anchorRect.left + anchorRect.width / 2 - toolbarWidth / 2
  const clampedLeft = Math.max(
    VIEWPORT_PADDING,
    Math.min(centeredLeft, window.innerWidth - toolbarWidth - VIEWPORT_PADDING)
  )

  // Posición de la flecha indicadora para apuntar directamente al centro del sello
  const arrowLeft = Math.max(
    16,
    Math.min(anchorRect.left + anchorRect.width / 2 - clampedLeft, toolbarWidth - 16)
  )

  return (
    <>
      {/* Telón transparente para capturar clics fuera */}
      <div
        className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Toolbar Flotante */}
      <div
        ref={popoverRef}
        role="toolbar"
        aria-label="Opciones de asistencia"
        className="fixed z-50 bg-[#FAF3E7] rounded-2xl border-2 border-[#DE9927] shadow-xl p-2.5 animate-in fade-in zoom-in-95 duration-150 select-none"
        style={{
          top: `${calculatedTop}px`,
          left: `${clampedLeft}px`,
          width: `${toolbarWidth}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flecha indicadora que apunta al sello seleccionado */}
        {placeAbove ? (
          <div
            className="absolute -bottom-1.5 w-3 h-3 bg-[#FAF3E7] border-b-2 border-r-2 border-[#DE9927] rotate-45 -translate-x-1/2 pointer-events-none"
            style={{ left: `${arrowLeft}px` }}
          />
        ) : (
          <div
            className="absolute -top-1.5 w-3 h-3 bg-[#FAF3E7] border-t-2 border-l-2 border-[#DE9927] rotate-45 -translate-x-1/2 pointer-events-none"
            style={{ left: `${arrowLeft}px` }}
          />
        )}

        {/* Cabecera del Toolbar: Nombre e Info */}
        <div className="flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b border-[#E5D5BC]">
          <div className="min-w-0 pr-1">
            <span className="font-manrope font-bold text-[11px] text-[#0D356A] truncate block leading-tight">
              {memberName}
            </span>
            <span className="text-[9px] text-[#DE9927] font-semibold leading-none">
              Sesión: {sessionLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-4 h-4 rounded-full flex items-center justify-center text-[#0D356A]/60 hover:text-[#0D356A] hover:bg-[#E5D5BC]/50 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Botones del Toolbar sin texto (solo sellos circulares) */}
        <div className="flex items-center justify-between gap-1">
          {STATUS_CONFIG.map((item) => {
            const isCurrent = currentStatus === item.status

            return (
              <button
                key={item.status}
                type="button"
                onClick={() => {
                  onSelectStatus(item.status)
                  onClose()
                }}
                className={`relative p-0.5 rounded-full transition-all duration-100 cursor-pointer active:scale-90 flex items-center justify-center ${isCurrent
                    ? 'ring-2 ring-[#0D356A] ring-offset-1 scale-110 shadow-md'
                    : 'hover:scale-108'
                  }`}
              >
                {/* Sello circular con símbolo */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-manrope font-extrabold border shadow-xs transition-transform ${item.bgClass} ${item.borderClass} ${item.textClass}`}
                >
                  {item.symbol}
                </div>

                {/* Indicador de estado actual */}
                {isCurrent && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0D356A] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2 h-2 stroke-[3]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
