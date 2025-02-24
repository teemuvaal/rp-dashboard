'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotesList from "./NotesList";
import AddNoteButton from "./AddNoteButton";
import { ListFilter, Plus } from "lucide-react";

export default function NotesPage({ notes, campaignId, error }) {
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
                            Notes List
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
                    <NotesList notes={notes} campaignId={campaignId} error={error} />
                </TabsContent>
                <TabsContent value="add" className="flex-1 p-6">
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <h2 className="text-lg font-medium">Create a New Note</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            Create a new note to share information with your campaign members.
                            Notes can be private or public, and can be edited later.
                        </p>
                        <AddNoteButton campaignId={campaignId} type="default" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 