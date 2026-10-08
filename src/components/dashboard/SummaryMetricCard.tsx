interface SummaryMetricCardProps {
  label: string
  value: number | string
  badgeText: string
  valueColor?: string
  badgeClassName?: string
}

export function SummaryMetricCard({
  label,
  value,
  badgeText,
  valueColor = 'text-[#0D356A]',
  badgeClassName = 'font-manrope font-bold text-[9px]',
}: SummaryMetricCardProps) {
  return (
    <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
      <span className="font-manrope font-semibold text-[11px] text-[#5C6B7C]">
        {label}
      </span>
      <div className="flex items-baseline justify-between mt-2">
        <span className={`font-google-sans font-black text-[24px] ${valueColor}`}>
          {value}
        </span>
        <span className={badgeClassName}>
          {badgeText}
        </span>
      </div>
    </div>
  )
}
