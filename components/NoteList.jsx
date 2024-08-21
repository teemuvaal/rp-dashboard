import NoteList from "@/components/NoteList";

export default async function CampaignNotes({ params }) {
    // Fetch notes for the campaign
    const notes = await fetchNotes(params.id);

    return <NoteList notes={notes} />;
}