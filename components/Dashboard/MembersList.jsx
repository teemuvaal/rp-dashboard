'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function MembersList({ members }) {
  const [memberDetails, setMemberDetails] = useState([])

  useEffect(() => {
    async function fetchUserEmails() {
      const supabase = createClient()
      const userIds = members.map(member => member.user_id)

      const { data: users, error } = await supabase
        .from('users')  // Changed from 'auth.users' to 'users'
        .select('id, email')
        .in('id', userIds)

      if (error) {
        console.error('Error fetching user emails:', error)
        return
      }

      const userEmailMap = Object.fromEntries(users.map(user => [user.id, user.email]))

      setMemberDetails(members.map(member => ({
        ...member,
        email: userEmailMap[member.user_id] || 'Unknown'
      })))
    }

    fetchUserEmails()
  }, [members])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Campaign Members</h2>
      <ul className="space-y-2">
        {memberDetails.map((member) => (
          <li key={member.id} className="flex justify-between items-center">
            <span>{member.email}</span>
            <span className="text-sm text-gray-500">{member.role}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}