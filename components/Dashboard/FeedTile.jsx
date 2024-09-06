import { formatDistanceToNow, parseISO } from 'date-fns';

export default function FeedTile({ title, content, author, createdAt }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        
        try {
            let date;
            if (typeof dateString === 'string') {
                // Try parsing as ISO string
                date = parseISO(dateString);
                if (isNaN(date.getTime())) {
                    // If parsing fails, try creating a new Date object
                    date = new Date(dateString);
                }
            } else if (dateString instanceof Date) {
                date = dateString;
            } else {
                // If it's neither a string nor a Date object, create a new Date
                date = new Date(dateString);
            }

            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }

            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            console.error('Error parsing date:', error);
            return 'Unknown date';
        }
    };

    return (
        <div className="border border-gray-300 rounded-sm p-2 mb-2 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
                <div className="rounded-full bg-gray-300 w-8 h-8 flex-shrink-0">
                    {/* You can replace this with an actual avatar image */}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm sm:text-base">{title || 'Untitled'}</h3>
                        <span className="text-xs text-gray-500">
                            {formatDate(createdAt)}
                        </span>
                    </div>
                    <p className="text-sm font-light text-gray-700 mb-1">{content || 'No content'}</p>
                    <p className="text-xs text-gray-500">Posted by: {author || 'Unknown'}</p>
                </div>
            </div>
        </div>
    )
}