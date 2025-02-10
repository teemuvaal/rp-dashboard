import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CreateCharacterButton({ campaignId }) {
    return (
        <Link href={`/dashboard/${campaignId}/characters/new`}>
            <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Character
            </Button>
        </Link>
    );
} 