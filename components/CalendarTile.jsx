import { format, isSameDay } from 'date-fns';

export default function CalendarTile({ sessions }) {
    return (
        <div className="space-y-2">
            {sessions.map((session, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${isSameDay(new Date(session.scheduled_date), new Date()) ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="flex-grow">
                        <p className="text-sm font-medium">{session.title}</p>
                        <p className="text-xs text-gray-500">{session.description}</p>
                        <p className="text-xs text-gray-500">{format(new Date(session.scheduled_date), 'PPP')}</p>
                    </div>
                </div>
            ))}
                {sessions.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming sessions</p>
            )}
        </div>
    )
}