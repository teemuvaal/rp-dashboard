'use server'

export async function cleanUpNote(note) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: `Format this following note properly, use simple HTML: ${note}` 
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, cleanedNote: data.text };
    } catch (error) {
        console.error('Error cleaning up note:', error);
        return { success: false, error: 'Failed to clean up note' };
    }
}

export async function createSummary({notes}) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: `Create a summary of the session based on the following notes: ${notes}
                Make the summary to a storylike format and highlight key moments and encounters in the summary.
                the summary can be from an all-knowing-perspective.` 
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, cleanedNote: data.text };
    } catch (error) {
        console.error('Error creating a summary', error);
        return { success: false, error: 'Failed to create a summary' };
    }
}