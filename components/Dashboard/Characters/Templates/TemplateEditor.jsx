'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useRouter } from 'next/navigation';
import { updateCharacterTemplate } from '@/app/dashboard/actions';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';

const FIELD_TYPES = [
    { id: 'string', label: 'Text', defaultProps: {} },
    { id: 'number', label: 'Number', defaultProps: { minimum: 0 } },
    { id: 'string', label: 'Text Area', defaultProps: { format: 'textarea' } },
    { id: 'string', label: 'Select', defaultProps: { enum: [] } },
    { id: 'boolean', label: 'Checkbox', defaultProps: {} },
];

export default function TemplateEditor({ template, campaignId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('fields');
    const [fields, setFields] = useState(() => {
        const schema = template.schema || {
            type: 'object',
            properties: {},
            required: []
        };
        return Object.entries(schema.properties || {}).map(([key, value]) => ({
            id: key,
            ...value,
            required: (schema.required || []).includes(key)
        }));
    });

    const handleAddField = () => {
        const newField = {
            id: `field_${Date.now()}`,
            type: 'string',
            title: 'New Field',
            required: false
        };
        setFields([...fields, newField]);
    };

    const handleFieldChange = (index, updates) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };
        setFields(newFields);
    };

    const handleRemoveField = (index) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFields(items);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Convert fields to JSON Schema format
            const schema = {
                type: 'object',
                properties: {},
                required: []
            };

            const uiSchema = {
                'ui:order': fields.map(f => f.id)
            };

            fields.forEach(field => {
                schema.properties[field.id] = {
                    type: field.type,
                    title: field.title,
                    description: field.description,
                    ...(field.type === 'string' && field.options ? { enum: field.options } : {}),
                    ...(field.type === 'number' ? { minimum: field.minimum, maximum: field.maximum } : {}),
                    ...(field.type === 'string' && field.format === 'textarea' ? { format: 'textarea' } : {})
                };

                if (field.required) {
                    schema.required.push(field.id);
                }

                // Add UI specific configurations
                if (field.type === 'string' && field.format === 'textarea') {
                    uiSchema[field.id] = { 'ui:widget': 'textarea' };
                }
            });

            const formData = new FormData();
            formData.append('templateId', template.id);
            formData.append('name', template.name);
            formData.append('description', template.description);
            formData.append('schema', JSON.stringify(schema));
            formData.append('ui_schema', JSON.stringify(uiSchema));

            const result = await updateCharacterTemplate(formData);
            if (result.error) {
                throw new Error(result.error);
            }

            router.refresh();
        } catch (error) {
            console.error('Error saving template:', error);
            // TODO: Show error message to user
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="fields">Fields</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="fields" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Button onClick={handleAddField}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Field
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="fields">
                                {(provided) => (
                                    <ul 
                                        className="space-y-4"
                                        {...provided.droppableProps} 
                                        ref={provided.innerRef}
                                    >
                                        {fields.map((field, index) => (
                                            <Draggable 
                                                key={field.id} 
                                                draggableId={field.id} 
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <li>
                                                        <Card 
                                                            className="mb-4" 
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                        >
                                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <div {...provided.dragHandleProps}>
                                                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                                <CardTitle className="text-sm font-medium">
                                                                    Field {index + 1}
                                                                </CardTitle>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveField(index)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </CardHeader>
                                                            <CardContent className="space-y-4">
                                                                <div className="grid gap-4">
                                                                    <div className="grid gap-2">
                                                                        <Label>Field Label</Label>
                                                                        <Input
                                                                            value={field.title || ''}
                                                                            onChange={(e) => handleFieldChange(index, { title: e.target.value })}
                                                                            placeholder="Enter field label"
                                                                        />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label>Field Type</Label>
                                                                        <Select
                                                                            value={field.type}
                                                                            onValueChange={(value) => handleFieldChange(index, { type: value })}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select field type" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {FIELD_TYPES.map((type) => (
                                                                                    <SelectItem key={type.id} value={type.id}>
                                                                                        {type.label}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label>Description</Label>
                                                                        <Textarea
                                                                            value={field.description || ''}
                                                                            onChange={(e) => handleFieldChange(index, { description: e.target.value })}
                                                                            placeholder="Enter field description"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Switch
                                                                            checked={field.required}
                                                                            onCheckedChange={(checked) => handleFieldChange(index, { required: checked })}
                                                                        />
                                                                        <Label>Required Field</Label>
                                                                    </div>
                                                                    {field.type === 'select' && (
                                                                        <div className="grid gap-2">
                                                                            <Label>Options (one per line)</Label>
                                                                            <Textarea
                                                                                value={(field.options || []).join('\n')}
                                                                                onChange={(e) => handleFieldChange(index, { 
                                                                                    options: e.target.value.split('\n').filter(Boolean)
                                                                                })}
                                                                                placeholder="Enter options"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {field.type === 'number' && (
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div className="grid gap-2">
                                                                                <Label>Minimum</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={field.minimum || ''}
                                                                                    onChange={(e) => handleFieldChange(index, { 
                                                                                        minimum: parseInt(e.target.value) 
                                                                                    })}
                                                                                />
                                                                            </div>
                                                                            <div className="grid gap-2">
                                                                                <Label>Maximum</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={field.maximum || ''}
                                                                                    onChange={(e) => handleFieldChange(index, { 
                                                                                        maximum: parseInt(e.target.value) 
                                                                                    })}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </TabsContent>

                    <TabsContent value="preview">
                        <Card>
                            <CardHeader>
                                <CardTitle>Character Sheet Preview</CardTitle>
                                <CardDescription>
                                    This is how your character sheet will look to players
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.map((field) => (
                                    <div key={field.id} className="grid gap-2">
                                        <Label>{field.title}</Label>
                                        {field.type === 'text' && (
                                            <Input placeholder={field.description} disabled />
                                        )}
                                        {field.type === 'textarea' && (
                                            <Textarea placeholder={field.description} disabled />
                                        )}
                                        {field.type === 'number' && (
                                            <Input 
                                                type="number" 
                                                placeholder={field.description}
                                                min={field.minimum}
                                                max={field.maximum}
                                                disabled 
                                            />
                                        )}
                                        {field.type === 'select' && (
                                            <Select disabled>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={field.description} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(field.options || []).map((option) => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {field.type === 'boolean' && (
                                            <Switch disabled />
                                        )}
                                        {field.description && (
                                            <p className="text-sm text-gray-500">{field.description}</p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 