import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function ManageTemplatesButton({ campaignId }) {
    return (
        <Link href={`/dashboard/${campaignId}/characters/templates`}>
            <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Manage Templates
            </Button>
        </Link>
    );
} 