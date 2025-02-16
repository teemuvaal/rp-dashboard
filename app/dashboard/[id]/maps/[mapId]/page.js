import { fetchMapDetails } from "@/app/dashboard/actions";
import MapViewer from "@/components/Dashboard/Maps/MapViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function MapDetailPage({ params }) {
    const { map, error } = await fetchMapDetails(params.mapId);
    
    if (error) {
        return <div>Error loading map: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={`/dashboard/${params.id}/maps`}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Maps
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{map.title}</h1>
                    {map.description && (
                        <p className="text-muted-foreground">{map.description}</p>
                    )}
                </div>
            </div>

            <div className="aspect-[16/9] relative">
                <MapViewer map={map} />
            </div>
        </div>
    );
} 