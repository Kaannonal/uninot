'use client'

import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Button } from '@/components/ui/button'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export default function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages]   = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }, [])

  const onDocumentLoadError = useCallback(() => {
    setLoading(false)
    setError(true)
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border text-sm text-gray-500">
        PDF yüklenemedi.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {loading && (
        <div className="flex items-center justify-center h-64 w-full bg-gray-50 rounded-lg border text-sm text-gray-400">
          PDF yükleniyor…
        </div>
      )}

      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
        className={loading ? 'hidden' : ''}
      >
        <Page
          pageNumber={pageNumber}
          width={Math.min(typeof window !== 'undefined' ? window.innerWidth - 64 : 700, 800)}
          className="shadow-md rounded"
          renderTextLayer
          renderAnnotationLayer
        />
      </Document>

      {!loading && numPages > 0 && (
        <div className="flex items-center gap-3 text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
          >
            ← Önceki
          </Button>
          <span className="text-muted-foreground">
            {pageNumber} / {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
          >
            Sonraki →
          </Button>
        </div>
      )}
    </div>
  )
}
