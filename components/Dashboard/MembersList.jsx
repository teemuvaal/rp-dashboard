import Image from 'next/image'

export default function MembersList({ members }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Campaign Members</h2>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex justify-between items-center">
            <div className="flex items-center">
              {member.profile_picture ? (
                <Image 
                  src={member.profile_picture} 
                  alt={member.username || 'User'} 
                  width={32} 
                  height={32} 
                  className="rounded-full mr-2"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                  {(member.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <span>{member.username || 'Unknown User'}</span>
            </div>
            <span className="text-sm text-gray-500">{member.role}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}