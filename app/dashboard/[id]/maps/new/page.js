import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateMapForm from "@/components/Dashboard/Maps/CreateMapForm";

export default function NewMapPage({ params }) {
    return (
        <div className="max-w-2xl mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Map</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateMapForm campaignId={params.id} />
                </CardContent>
            </Card>
        </div>
    );
} 