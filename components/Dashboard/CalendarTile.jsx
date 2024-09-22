import { format, isSameDay } from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  

// logic for the calendar tile, show only next sessions and 1 previous session with proper headings
export default function CalendarTile({ sessions }) {

    const now = new Date()
    const upcomingSessions = sessions.filter(session => new Date(session.scheduled_date) > now)
    const pastSessions = sessions.filter(session => new Date(session.scheduled_date) <= now)

    return (
        <div className="space-y-2">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                {upcomingSessions.slice(0, 3).map((session, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded-md shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${isSameDay(new Date(session.scheduled_date), new Date()) ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="flex-grow">
                        <p className="text-sm font-medium">{session.title}</p>
                        <p className="text-xs">{session.description}</p>
                        <p className="text-xs">{format(new Date(session.scheduled_date), 'PPP')}</p>
                    </div>
                </div>
            ))}
            {upcomingSessions.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming sessions</p>
            )}
            <p
            className="text-sm font-medium mt-4"
            >Previous Sessions</p>
            {pastSessions.slice(0, 2).map((session, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded-md shadow-sm">
                    <div className={`w-2 h-2 rounded-full bg-red-500`}></div>
                    <div className="flex-grow">
                        <p className="text-sm font-medium">{session.title}</p>
                        <p className="text-xs text-gray-500">{session.description}</p>
                        <p className="text-xs text-gray-500">{format(new Date(session.scheduled_date), 'PPP')}</p>
                    </div>
                </div>
            ))}
            {pastSessions.length === 0 && (
                <p className="text-sm text-gray-500">No past sessions</p>
                )}
                </CardContent>
            </Card>
        </div>
    )
}