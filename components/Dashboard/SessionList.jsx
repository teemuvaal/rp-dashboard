'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import dynamic from 'next/dynamic'
import { deleteSession } from '@/app/dashboard/actions'
import { useState } from 'react'
import Link from 'next/link'

const CreateSessionForm = dynamic(() => import('@/components/Dashboard/CreateSessionForm'), { ssr: false })

// Helper function to format date consistently
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return new Date(dateString).toLocaleString('en-GB', options).replace(',', '');
}

function SessionCard({ session, onDelete, isDeleting, campaignId }) {
    return (
        <Card key={session.id}>
            <CardHeader>
                <CardTitle>{session.name}</CardTitle>
                <CardDescription>
                    {formatDate(session.scheduled_date)} - 
                    Duration: {session.duration_minutes} minutes
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>{session.description}</p>
                <p>Status: {session.status}</p>
            </CardContent>
            <CardFooter>
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/${campaignId}/sessions/${session.id}`}>
                        View Session
                    </Link>
                </Button>
                <Button 
                    variant="destructive" 
                    onClick={() => onDelete(session.id)}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete Session'}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function SessionList({ sessions, campaignId }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteSession = async (sessionId) => {
        setIsDeleting(true)
        const result = await deleteSession(sessionId, campaignId)
        setIsDeleting(false)

        if (result.error) {
            alert(result.error)
        }
    }

    const now = new Date()
    const upcomingSessions = sessions.filter(session => new Date(session.scheduled_date) > now)
    const pastSessions = sessions.filter(session => new Date(session.scheduled_date) <= now)

    return (
        <div className="space-y-8 mt-4">
            <Separator />
            <div>
                <h3 className="text-xl font-semibold mb-4">Upcoming Sessions</h3>
                {upcomingSessions.length === 0 ? (
                    <p>No upcoming sessions scheduled.</p>
                ) : (
                    upcomingSessions.map((session) => (
                        <SessionCard 
                            key={session.id} 
                            session={session} 
                            onDelete={handleDeleteSession} 
                            isDeleting={isDeleting}
                            campaignId={campaignId}
                        />
                    ))
                )}
            </div>
            <Separator />
            <div>
                <h3 className="text-xl font-semibold mb-4">Past Sessions</h3>
                {pastSessions.length === 0 ? (
                    <p>No past sessions.</p>
                ) : (
                    pastSessions.map((session) => (
                        <SessionCard 
                            key={session.id} 
                            session={session} 
                            onDelete={handleDeleteSession} 
                            isDeleting={isDeleting} 
                            campaignId={campaignId}
                        />
                    ))
                )}
            </div>
        </div>
    )
}