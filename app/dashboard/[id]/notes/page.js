import { fetchNotes } from '@/app/dashboard/actions'
import NotesList from '@/components/Dashboard/NotesList'
import AddNoteButton from '@/components/Dashboard/AddNoteButton'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default async function NotesPage({ params }) {
    const { notes, error } = await fetchNotes(params.id)

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <Card>
        <div className='flex flex-col'>
            <span className='p-4 flex flex-col gap-2'>
                <span>
                    <AddNoteButton campaignId={params.id} />
                </span>
                <p className='text-sm text-gray-500'>
                    Here you can create notes. Notes can be private or shared with all campaign members.
                </p>
            </span>
            <NotesList initialNotes={notes} campaignId={params.id} />
        </div>
        </Card>
    )
}