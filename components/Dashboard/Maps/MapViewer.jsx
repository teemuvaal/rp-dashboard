'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createHotspot, updateHotspot, deleteHotspot } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { 
    MapPin, 
    Castle, 
    Trees, 
    Home, 
    Mountain, 
    Skull, 
    Tent, 
    Ship, 
    Trash2 
} from 'lucide-react';

// Move HOTSPOT_ICONS outside component to prevent recreation
const HOTSPOT_ICONS = {
    location: { icon: MapPin, label: 'Location' },
    quest: { icon: Skull, label: 'Quest' },
    danger: { icon: Skull, label: 'Danger' },
    treasure: { icon: MapPin, label: 'Treasure' },
    npc: { icon: Home, label: 'NPC' },
    shop: { icon: Home, label: 'Shop' },
    temple: { icon: Castle, label: 'Temple' },
    castle: { icon: Castle, label: 'Castle' },
    cave: { icon: Mountain, label: 'Cave' },
    camp: { icon: Tent, label: 'Camp' }
};

// Create a simple component for icon option
const IconOption = React.memo(({ icon: Icon, label }) => (
    <div className="flex items-center">
        <Icon className="w-4 h-4 mr-2" />
        {label}
    </div>
));
IconOption.displayName = 'IconOption';

// Create a separate component for icon select content
const IconSelectContent = React.memo(() => (
    <SelectContent>
        {Object.entries(HOTSPOT_ICONS).map(([key, { icon: Icon, label }]) => (
            <SelectItem key={key} value={key}>
                <IconOption icon={Icon} label={label} />
            </SelectItem>
        ))}
    </SelectContent>
));
IconSelectContent.displayName = 'IconSelectContent';

// Create a separate dialog component for hotspot form
const HotspotFormDialog = React.memo(({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData = null,
    onDelete = null 
}) => {
    const [selectedIcon, setSelectedIcon] = useState(initialData?.icon_type || 'location');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Hotspot' : 'Add Hotspot'}
                    </DialogTitle>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <Input
                        name="title"
                        placeholder="Hotspot Title"
                        defaultValue={initialData?.title}
                        required
                    />
                    <Textarea
                        name="description"
                        placeholder="Description"
                        defaultValue={initialData?.description}
                        required
                    />
                    <div className="space-y-2">
                        <input 
                            type="hidden" 
                            name="iconType" 
                            value={selectedIcon}
                        />
                        <div className="grid grid-cols-5 gap-2">
                            {Object.entries(HOTSPOT_ICONS).map(([key, { icon: Icon, label }]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                                        selectedIcon === key 
                                            ? 'border-primary bg-primary/10' 
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => setSelectedIcon(key)}
                                >
                                    <Icon className="w-4 h-4 mb-1" />
                                    <span className="text-xs">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {initialData ? (
                        <div className="flex justify-between">
                            <Button 
                                type="button" 
                                variant="destructive"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                            <Button type="submit">Update</Button>
                        </div>
                    ) : (
                        <Button type="submit" className="w-full">Create</Button>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
});
HotspotFormDialog.displayName = 'HotspotFormDialog';

export default function MapViewer({ map }) {
    const [hotspots, setHotspots] = useState(map.map_hotspots || []);
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const [isAddingHotspot, setIsAddingHotspot] = useState(false);
    const [newHotspotPosition, setNewHotspotPosition] = useState(null);
    const imageRef = useRef(null);
    const { toast } = useToast();

    const handleMapClick = useCallback((e) => {
        if (!isAddingHotspot) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setNewHotspotPosition({ x, y });
    }, [isAddingHotspot]);

    const handleCreateHotspot = useCallback(async (formData) => {
        try {
            // Ensure position values are valid numbers
            if (!newHotspotPosition || typeof newHotspotPosition.x !== 'number' || typeof newHotspotPosition.y !== 'number') {
                throw new Error('Invalid hotspot position');
            }

            // Append all form data
            formData.append('mapId', map.id);
            formData.append('positionX', newHotspotPosition.x.toString());
            formData.append('positionY', newHotspotPosition.y.toString());

            const result = await createHotspot(formData);
            
            if (result.error) {
                throw new Error(result.error);
            }

            setHotspots(prev => [...prev, result.hotspot]);
            setIsAddingHotspot(false);
            setNewHotspotPosition(null);

            toast({
                title: 'Success',
                description: 'Hotspot created successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create hotspot',
                variant: 'destructive',
            });
        }
    }, [map.id, newHotspotPosition, toast]);

    const handleUpdateHotspot = useCallback(async (formData) => {
        try {
            formData.append('hotspotId', selectedHotspot.id);
            
            const result = await updateHotspot(formData);
            
            if (result.error) {
                throw new Error(result.error);
            }

            setHotspots(prev => prev.map(h => 
                h.id === selectedHotspot.id ? result.hotspot : h
            ));
            setSelectedHotspot(null);

            toast({
                title: 'Success',
                description: 'Hotspot updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update hotspot',
                variant: 'destructive',
            });
        }
    }, [selectedHotspot, toast]);

    const handleDeleteHotspot = useCallback(async () => {
        if (!selectedHotspot) return;

        try {
            const formData = new FormData();
            formData.append('hotspotId', selectedHotspot.id);
            
            const result = await deleteHotspot(formData);
            
            if (result.error) {
                throw new Error(result.error);
            }

            setHotspots(prev => prev.filter(h => h.id !== selectedHotspot.id));
            setSelectedHotspot(null);

            toast({
                title: 'Success',
                description: 'Hotspot deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete hotspot',
                variant: 'destructive',
            });
        }
    }, [selectedHotspot, toast]);

    // Memoize the hotspots rendering
    const renderedHotspots = useMemo(() => (
        <TooltipProvider>
            {hotspots.map((hotspot) => {
                const Icon = HOTSPOT_ICONS[hotspot.icon_type]?.icon || MapPin;
                return (
                    <Tooltip key={hotspot.id}>
                        <TooltipTrigger asChild>
                            <button
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent ${
                                    selectedHotspot?.id === hotspot.id ? 'bg-accent' : 'bg-background'
                                }`}
                                style={{
                                    left: `${hotspot.position_x * 100}%`,
                                    top: `${hotspot.position_y * 100}%`,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedHotspot(hotspot);
                                }}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{hotspot.title}</p>
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </TooltipProvider>
    ), [hotspots, selectedHotspot]);

    return (
        <div className="relative w-full h-full">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                    variant={isAddingHotspot ? 'secondary' : 'default'}
                    onClick={() => setIsAddingHotspot(!isAddingHotspot)}
                >
                    {isAddingHotspot ? 'Cancel' : 'Add Hotspot'}
                </Button>
            </div>

            {/* Map Image with Hotspots */}
            <div 
                className="relative w-full h-full rounded-lg overflow-hidden"
                onClick={handleMapClick}
                ref={imageRef}
            >
                <Image
                    src={map.image_url}
                    alt={map.title}
                    fill
                    className="object-contain"
                    priority
                />

                {renderedHotspots}

                {/* New Hotspot Preview */}
                {isAddingHotspot && newHotspotPosition && (
                    <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 p-1 rounded-full bg-accent animate-pulse"
                        style={{
                            left: `${newHotspotPosition.x * 100}%`,
                            top: `${newHotspotPosition.y * 100}%`,
                        }}
                    >
                        <MapPin className="w-4 h-4" />
                    </div>
                )}
            </div>

            {/* Hotspot Form Dialogs */}
            <HotspotFormDialog
                isOpen={isAddingHotspot && !!newHotspotPosition}
                onClose={() => {
                    setIsAddingHotspot(false);
                    setNewHotspotPosition(null);
                }}
                onSubmit={handleCreateHotspot}
            />

            <HotspotFormDialog
                isOpen={!!selectedHotspot}
                onClose={() => setSelectedHotspot(null)}
                onSubmit={handleUpdateHotspot}
                onDelete={handleDeleteHotspot}
                initialData={selectedHotspot}
            />
        </div>
    );
} 