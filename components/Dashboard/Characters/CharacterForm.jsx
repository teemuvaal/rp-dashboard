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
import { Switch } from "@/components/ui/switch";
import { useRouter } from 'next/navigation';
import { createCharacter } from '@/app/dashboard/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export default function CharacterForm({ templates, campaignId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [portrait, setPortrait] = useState(null);
    const [portraitPreview, setPortraitPreview] = useState(null);

    // When template changes, reset form data and errors
    const handleTemplateChange = (templateId) => {
        const template = templates.find(t => t.id === templateId);
        setSelectedTemplate(template);
        setFormData({});
        setErrors({});
    };

    const validateFormData = (data, schema) => {
        try {
            // Log validation inputs
            console.log('Validating data:', data);
            console.log('Against schema:', schema);

            const validate = ajv.compile(schema);
            const valid = validate(data);
            
            if (!valid) {
                console.error('Validation errors:', validate.errors);
                const newErrors = {};
                validate.errors.forEach(error => {
                    // Convert JSON pointer to field name
                    const field = error.instancePath.replace(/^\//, '') || error.params.missingProperty;
                    newErrors[field] = `${error.message}${error.params ? ` (${JSON.stringify(error.params)})` : ''}`;
                });
                return newErrors;
            }
            
            return null;
        } catch (error) {
            console.error('Schema validation error:', error);
            return { _schema: 'Invalid schema format' };
        }
    };

    const handlePortraitChange = (file) => {
        if (file) {
            setPortrait(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPortraitPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPortrait(null);
            setPortraitPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Log the form data and schema for debugging
            console.log('Form Data:', formData);
            console.log('Template Schema:', selectedTemplate.schema);

            // Validate form data against JSON schema
            const validationErrors = validateFormData(formData, selectedTemplate.schema);
            if (validationErrors) {
                console.error('Validation Errors:', validationErrors);
                setErrors(validationErrors);
                setLoading(false);
                return;
            }

            // Convert form data to match schema types
            const processedData = Object.entries(formData).reduce((acc, [key, value]) => {
                const fieldSchema = selectedTemplate.schema.properties[key];
                if (fieldSchema) {
                    if (fieldSchema.type === 'number') {
                        acc[key] = value === '' ? null : Number(value);
                    } else if (fieldSchema.type === 'boolean') {
                        acc[key] = Boolean(value);
                    } else {
                        acc[key] = value === '' ? null : value;
                    }
                }
                return acc;
            }, {});

            console.log('Processed Data:', processedData);

            const submitData = new FormData();
            submitData.append('campaignId', campaignId);
            submitData.append('templateId', selectedTemplate.id);
            submitData.append('data', JSON.stringify(processedData));
            
            // Add portrait if one was selected
            if (portrait) {
                submitData.append('portrait', portrait);
            }

            const result = await createCharacter(submitData);
            console.log('Create Character Result:', result);

            if (result.error) {
                throw new Error(result.error);
            }

            if (!result.character?.id) {
                throw new Error('No character ID returned from server');
            }

            router.push(`/dashboard/${campaignId}/characters/${result.character.id}`);
        } catch (error) {
            console.error('Error creating character:', error);
            setErrors({ 
                submit: error.message || 'Failed to create character. Please try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    // Add debug output for template data
    console.log('Selected Template:', selectedTemplate);

    const renderField = (id, field) => {
        const value = formData[id] ?? '';  // Use nullish coalescing to handle 0 values
        const error = errors[id];
        const commonProps = {
            id: id,
            name: id,  // Add name prop for form field identification
            value: value,
            onChange: (e) => {
                const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                const updatedData = { ...formData, [id]: newValue };
                setFormData(updatedData);
                if (errors[id]) {
                    const newErrors = { ...errors };
                    delete newErrors[id];
                    setErrors(newErrors);
                }
            },
            'aria-invalid': error ? 'true' : undefined,
            className: error ? 'border-red-500' : undefined
        };

        return (
            <div key={id} className="grid gap-2">
                <Label htmlFor={id}>
                    {field.title}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === 'string' && !field.enum && (
                    field.format === 'textarea' ? (
                        <Textarea 
                            {...commonProps} 
                            placeholder={field.description || 'Enter text here'}
                        />
                    ) : (
                        <Input 
                            {...commonProps} 
                            type="text" 
                            placeholder={field.description || 'Enter text here'}
                        />
                    )
                )}

                {field.type === 'number' && (
                    <Input 
                        {...commonProps}
                        type="number"
                        min={field.minimum}
                        max={field.maximum}
                        placeholder={field.description || 'Enter a number'}
                        value={value.toString()}  // Ensure number is converted to string
                    />
                )}

                {field.type === 'boolean' && (
                    <div className="flex items-center space-x-2">
                        <Switch 
                            {...commonProps}
                            id={id}
                            checked={!!value}
                            onCheckedChange={(checked) => {
                                setFormData({ ...formData, [id]: checked });
                                if (errors[id]) {
                                    const newErrors = { ...errors };
                                    delete newErrors[id];
                                    setErrors(newErrors);
                                }
                            }}
                        />
                        <Label htmlFor={id}>{field.description || 'Toggle'}</Label>
                    </div>
                )}

                {field.type === 'string' && field.enum && (
                    <Select
                        value={value || ''}
                        onValueChange={(newValue) => {
                            setFormData({ ...formData, [id]: newValue });
                            if (errors[id]) {
                                const newErrors = { ...errors };
                                delete newErrors[id];
                                setErrors(newErrors);
                            }
                        }}
                    >
                        <SelectTrigger id={id}>
                            <SelectValue placeholder={field.description || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.enum.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
                
                {field.description && !error && (
                    <p className="text-sm text-gray-500">{field.description}</p>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Select Template</CardTitle>
                    <CardDescription>
                        Choose a template for your character
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Select
                        value={selectedTemplate.id}
                        onValueChange={handleTemplateChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Character Portrait</CardTitle>
                    <CardDescription>
                        Upload a portrait for your character (optional)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ImageUpload
                        value={portraitPreview}
                        onChange={handlePortraitChange}
                        className="w-40 h-40"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Character Details</CardTitle>
                    <CardDescription>
                        {selectedTemplate.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(selectedTemplate.schema.properties).map(([id, field]) => 
                        renderField(id, field)
                    )}
                </CardContent>
            </Card>

            {errors.submit && (
                <div className="text-sm text-red-500 mt-2">
                    {errors.submit}
                </div>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Character'}
                </Button>
            </div>
        </form>
    );
} 