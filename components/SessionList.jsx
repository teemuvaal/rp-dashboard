import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import dynamic from 'next/dynamic'

const CreateSessionForm = dynamic(() => import('@/components/CreateSessionForm'), { ssr: false })

export default function SessionList({ sessions, campaignId }) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Sessions</h2>
            <div>
                <CreateSessionForm campaignId={campaignId} />
            </div>
            {sessions.length === 0 ? (
                <p>No sessions scheduled yet.</p>
            ) : (
                sessions.map((session) => (
                    <Card key={session.id}>
                        <CardHeader>
                            <CardTitle>{session.name}</CardTitle>
                            <CardDescription>
                                {new Date(session.scheduled_date).toLocaleString()} - 
                                Duration: {session.duration_minutes} minutes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>{session.description}</p>
                            <p>Status: {session.status}</p>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}