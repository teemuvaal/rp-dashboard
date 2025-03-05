'use client';

import { useState, useEffect } from 'react';
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
import { GripVertical, Plus, Save, Trash2, AlertCircle } from 'lucide-react';

const FIELD_TYPES = [
    { id: 'string', label: 'Text', defaultProps: { type: 'string' } },
    { id: 'number', label: 'Number', defaultProps: { type: 'number', minimum: 0 } },
    { id: 'textarea', label: 'Text Area', defaultProps: { type: 'string', format: 'textarea' } },
    { id: 'select', label: 'Select', defaultProps: { type: 'string', enum: [] } },
    { id: 'boolean', label: 'Checkbox', defaultProps: { type: 'boolean' } },
];

// Generate a safe field ID from the title
const generateFieldId = (title, existingIds = []) => {
    if (!title) return `field_${Date.now()}`;
    
    // Convert to lowercase, replace spaces and special chars with underscores
    let id = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Ensure ID doesn't already exist
    if (existingIds.includes(id)) {
        id = `${id}_${Date.now()}`;
    }
    
    return id;
};

// Validate the generated schema to catch issues before saving
const validateSchema = (schema) => {
    try {
        // Check for required properties
        if (!schema.type || schema.type !== 'object') {
            return { valid: false, error: 'Schema must have type "object"' };
        }

        if (!schema.properties || typeof schema.properties !== 'object') {
            return { valid: false, error: 'Schema must have a properties object' };
        }

        if (Object.keys(schema.properties).length === 0) {
            return { valid: false, error: 'Schema must have at least one property' };
        }

        // Check each property
        for (const [key, prop] of Object.entries(schema.properties)) {
            if (!prop.type) {
                return { valid: false, error: `Property "${key}" is missing a type` };
            }
            
            if (prop.type === 'string' && prop.enum && !Array.isArray(prop.enum)) {
                return { valid: false, error: `Property "${key}" has invalid enum (not an array)` };
            }
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, error: `Schema validation error: ${error.message}` };
    }
};

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
        
        console.log('Loading template schema:', schema);
        
        return Object.entries(schema.properties || {}).map(([key, value]) => ({
            id: key,
            ...value,
            type: getFieldType(value),
            required: (schema.required || []).includes(key),
            options: value.enum || []
        }));
    });

    // Helper function to determine the field type from schema
    function getFieldType(schemaValue) {
        if (schemaValue.type === 'string') {
            if (schemaValue.format === 'textarea') return 'textarea';
            if (schemaValue.enum && schemaValue.enum.length > 0) return 'select';
            return 'string';
        }
        return schemaValue.type || 'string';
    }

    // Debug log the initial fields and template
    useEffect(() => {
        console.log('Template Editor - Initial template:', template);
        console.log('Template Editor - Initial fields:', fields);
    }, []);

    const handleAddField = () => {
        // Get existing IDs to avoid duplicates
        const existingIds = fields.map(f => f.id);
        
        const newField = {
            id: `field_${Date.now()}`,
            type: 'string',
            title: 'New Field',
            description: '',
            required: false
        };
        console.log('Adding new field:', newField);
        setFields([...fields, newField]);
    };

    const handleFieldChange = (index, updates) => {
        const newFields = [...fields];
        const fieldToUpdate = newFields[index];
        
        // If title changed and ID is still a default one, update ID as well
        if (updates.title && fieldToUpdate.id.startsWith('field_')) {
            const existingIds = fields.map(f => f.id);
            updates.id = generateFieldId(updates.title, existingIds);
        }
        
        // If field type changed, update with any default properties
        if (updates.type && updates.type !== fieldToUpdate.type) {
            const fieldType = FIELD_TYPES.find(t => t.id === updates.type);
            if (fieldType) {
                updates = { ...fieldType.defaultProps, ...updates };
            }
        }
        
        newFields[index] = { ...fieldToUpdate, ...updates };
        console.log(`Updated field at index ${index}:`, newFields[index]);
        setFields(newFields);
    };

    const handleRemoveField = (index) => {
        const newFields = [...fields];
        console.log(`Removing field at index ${index}:`, newFields[index]);
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
            // Check if any fields have missing required properties
            const hasInvalidFields = fields.some(field => !field.title || !field.id);
            if (hasInvalidFields) {
                throw new Error('All fields must have a title');
            }

            // Ensure there's at least one 'name' field for characters
            const hasNameField = fields.some(field => 
                field.id === 'name' || field.id === 'characterName'
            );

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
                const baseSchema = {
                    title: field.title,
                    description: field.description,
                };

                // Set the type and additional properties based on the field type
                switch (field.type) {
                    case 'string':
                        schema.properties[field.id] = {
                            ...baseSchema,
                            type: 'string'
                        };
                        break;
                    case 'textarea':
                        schema.properties[field.id] = {
                            ...baseSchema,
                            type: 'string',
                            format: 'textarea'
                        };
                        break;
                    case 'select':
                        schema.properties[field.id] = {
                            ...baseSchema,
                            type: 'string',
                            enum: Array.isArray(field.options) ? field.options : []
                        };
                        break;
                    case 'number':
                        schema.properties[field.id] = {
                            ...baseSchema,
                            type: 'number',
                            ...(field.minimum !== undefined ? { minimum: field.minimum } : {}),
                            ...(field.maximum !== undefined ? { maximum: field.maximum } : {})
                        };
                        break;
                    case 'boolean':
                        schema.properties[field.id] = {
                            ...baseSchema,
                            type: 'boolean'
                        };
                        break;
                    default:
                        console.warn(`Unknown field type: ${field.type} for field:`, field);
                        // Default to string if type is unknown
                        schema.properties[field.id] = {
                            ...baseSchema,
                            type: 'string'
                        };
                }

                if (field.required) {
                    schema.required.push(field.id);
                }

                // Add UI specific configurations
                if (field.type === 'textarea') {
                    uiSchema[field.id] = { 'ui:widget': 'textarea' };
                }
            });

            // Add a name field if one doesn't exist
            if (!hasNameField) {
                schema.properties['name'] = {
                    title: 'Character Name',
                    description: 'The name of your character',
                    type: 'string'
                };
                schema.required.push('name');
                uiSchema['ui:order'] = ['name', ...uiSchema['ui:order']];
            }

            // Validate schema before saving
            const validation = validateSchema(schema);
            if (!validation.valid) {
                throw new Error(`Invalid schema: ${validation.error}`);
            }

            console.log('Generated schema:', schema);
            console.log('Generated uiSchema:', uiSchema);

            const formData = new FormData();
            formData.append('templateId', template.id);
            formData.append('name', template.name);
            formData.append('description', template.description);
            formData.append('schema', JSON.stringify(schema));
            formData.append('ui_schema', JSON.stringify(uiSchema));

            const result = await updateCharacterTemplate(formData);
            console.log('Template update result:', result);
            
            if (result.error) {
                throw new Error(result.error);
            }

            router.refresh();
        } catch (error) {
            console.error('Error saving template:', error);
            alert(`Error saving template: ${error.message}`);
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

                        {!fields.some(f => f.id === 'name' || f.id === 'characterName') && (
                            <div className="flex p-3 bg-amber-50 text-amber-800 rounded-md mb-4 items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                <span className="text-sm">It's recommended to add a name field for your characters. A default one will be added if none exists.</span>
                            </div>
                        )}

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
                                                                    Field {index + 1}: {field.title || 'Untitled'}
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
                                                                        <p className="text-xs text-gray-500">Field ID: {field.id}</p>
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
                                        {field.type === 'string' && (
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