'use client'
export default function DownloadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6" onClick={e => e.stopPropagation()}>
        <p>İndir</p>
      </div>
    </div>
  )
}
