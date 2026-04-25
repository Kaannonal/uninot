import { Note } from '@/types'
import NoteCard from './NoteCard'

export default function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return <p className="text-center text-gray-500 py-12">Henüz not bulunamadı.</p>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map(note => <NoteCard key={note.id} note={note} />)}
    </div>
  )
}
