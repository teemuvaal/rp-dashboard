import { fetchNotes } from '@/app/dashboard/actions'
import NotesPage from '@/components/Dashboard/NotesPage'
import { Card } from '@/components/ui/card'

export default async function NotesPageRoute({ params }) {
    const { notes, error } = await fetchNotes(params.id)

    return (
        <Card className="flex-1">
            <NotesPage notes={notes} campaignId={params.id} error={error} />
        </Card>
    )
}