import { fetchCampaignMaps } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

export default async function MapsPage({ params }) {
    const { maps, error } = await fetchCampaignMaps(params.id);
    
    if (error) {
        return <div>Error loading maps: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Campaign Maps</h1>
                <Button asChild>
                    <Link href={`/dashboard/${params.id}/maps/new`}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Map
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maps?.map((map) => (
                    <Link 
                        key={map.id} 
                        href={`/dashboard/${params.id}/maps/${map.id}`}
                        className="group relative"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                            <Image
                                src={map.image_url}
                                alt={map.title}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 p-4 flex flex-col justify-end">
                                <h3 className="text-lg font-semibold text-white">{map.title}</h3>
                                <p className="text-sm text-white/80">
                                    {format(new Date(map.created_at), 'PPP')}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {maps?.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No maps yet. Create your first map!</p>
                </div>
            )}
        </div>
    );
} 