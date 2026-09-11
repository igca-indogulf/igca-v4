import { useState } from 'react'

export function Avatar({ url, name, size = 40 }: { url?: string | null; name: string; size?: number }) {
  const [broken, setBroken] = useState(false)
  const showImage = url && !broken

  return (
    <div
      className="rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-display font-semibold overflow-hidden shrink-0"
      style={{ height: size, width: size, fontSize: size * 0.4 }}
    >
      {showImage
        ? <img src={url} alt={name} className="h-full w-full object-cover" onError={() => setBroken(true)} />
        : (name?.[0]?.toUpperCase() ?? '?')}
    </div>
  )
}
