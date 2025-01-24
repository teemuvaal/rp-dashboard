'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetsList from "./AssetsList";
import AddAsset from "./AddAsset";
import { ListFilter, Plus } from "lucide-react";

export default function AssetsPage({ assets, campaignId, error }) {
    return (
        <div className="h-full flex flex-col">
            <Tabs defaultValue="list" className="flex-1">
                <div className="border-b">
                    <TabsList className="w-full justify-start h-12 bg-transparent p-0">
                        <TabsTrigger 
                            value="list"
                            className="data-[state=active]:bg-background relative h-12 rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary"
                        >
                            <ListFilter className="h-4 w-4 mr-2" />
                            Asset List
                        </TabsTrigger>
                        <TabsTrigger 
                            value="add"
                            className="data-[state=active]:bg-background relative h-12 rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="list" className="flex-1 p-6">
                    <AssetsList assets={assets} campaignId={campaignId} error={error} />
                </TabsContent>
                <TabsContent value="add" className="flex-1 p-6">
                    <AddAsset campaignId={campaignId} />
                </TabsContent>
            </Tabs>
        </div>
    );
} 