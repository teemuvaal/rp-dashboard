'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { removeCampaignMember } from '@/app/dashboard/actions';
import { useRouter } from 'next/navigation';

export default function MembersList({ members, campaignId, isOwner }) {
  const { toast } = useToast();
  const router = useRouter();
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const handleRemoveMember = async (memberId) => {
    if (removingMemberId) return; // Prevent multiple clicks

    setRemovingMemberId(memberId);
    try {
      const formData = new FormData();
      formData.append('campaignId', campaignId);
      formData.append('memberId', memberId);

      const result = await removeCampaignMember(formData);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Member removed successfully",
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member",
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Campaign Members</h2>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex justify-between items-center p-2 hover:bg-accent rounded-md group">
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{member.role}</span>
              {isOwner && member.role !== 'owner' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMemberId === member.id}
                >
                  <X className="h-4 w-4 text-red-500 hover:text-red-700" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}