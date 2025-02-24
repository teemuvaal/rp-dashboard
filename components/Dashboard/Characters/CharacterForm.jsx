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
import { Switch } from "@/components/ui/switch";
import { useRouter } from 'next/navigation';
import { createCharacter } from '@/app/dashboard/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Create a more forgiving Ajv instance
const ajv = new Ajv({
    allErrors: true,
    strict: false, // More lenient parsing
    strictSchema: false, // Don't be strict about schema format
    strictTypes: false // Don't be strict about types
});
addFormats(ajv);

export default function CharacterForm({ templates, campaignId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [portrait, setPortrait] = useState(null);
    const [portraitPreview, setPortraitPreview] = useState(null);
    const [schemaValidated, setSchemaValidated] = useState(false);

    // Validate template schema structure
    useEffect(() => {
        console.log('Templates received:', templates);
        console.log('Initial selected template:', selectedTemplate);
        
        if (selectedTemplate && selectedTemplate.schema) {
            console.log('Template schema properties:', selectedTemplate.schema.properties);
            console.log('Template required fields:', selectedTemplate.schema.required || []);
            
            // Check if schema has required properties structure
            if (!selectedTemplate.schema.properties || 
                typeof selectedTemplate.schema.properties !== 'object' ||
                Object.keys(selectedTemplate.schema.properties).length === 0) {
                console.error('Invalid template schema: missing or empty properties object');
                setErrors({ _schema: 'This template has an invalid schema structure. Please edit the template first.' });
            } else {
                setSchemaValidated(true);
            }
        }
    }, [selectedTemplate]);

    // When template changes, reset form data and errors
    const handleTemplateChange = (templateId) => {
        const template = templates.find(t => t.id === templateId);
        console.log('Template changed to:', template);
        setSelectedTemplate(template);
        setFormData({});
        setErrors({});
        setSchemaValidated(false);
    };

    // Create a safe schema for validation
    const prepareSafeSchema = (schema) => {
        // Make a deep copy to avoid modifying the original
        const safeSchema = JSON.parse(JSON.stringify(schema));
        
        // Ensure it has the basic required structure
        if (!safeSchema.type) safeSchema.type = 'object';
        if (!safeSchema.properties) safeSchema.properties = {};
        
        // Clean up any properties that might cause issues
        Object.entries(safeSchema.properties).forEach(([key, prop]) => {
            // Ensure each property has a type
            if (!prop.type) {
                safeSchema.properties[key].type = 'string';
            }
            
            // Handle enum arrays properly
            if (prop.enum && !Array.isArray(prop.enum)) {
                safeSchema.properties[key].enum = [];
            }
        });
        
        return safeSchema;
    };

    const validateFormData = (data, originalSchema) => {
        try {
            // Prepare a safer version of the schema
            const schema = prepareSafeSchema(originalSchema);
            
            // Log validation inputs
            console.log('Validating data:', data);
            console.log('Original schema:', originalSchema);
            console.log('Prepared safe schema:', schema);

            // Try to compile the schema first to catch compilation errors
            let validate;
            try {
                validate = ajv.compile(schema);
            } catch (compileError) {
                console.error('Schema compilation error:', compileError);
                return { _schema: `Schema error: ${compileError.message}` };
            }

            // Now run the validation
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
            return { _schema: `Schema validation failed: ${error.message}` };
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

            // Add name field if missing (many systems expect characters to have names)
            const processedData = { ...formData };
            if (!processedData.name && processedData.characterName) {
                processedData.name = processedData.characterName;
            } else if (!processedData.name) {
                // Default name if none is specified
                processedData.name = "Unnamed Character";
            }

            // Skip validation if needed - remove this in production
            const skipValidation = false;
            let validationErrors = null;
            
            if (!skipValidation) {
                // Validate form data against JSON schema
                validationErrors = validateFormData(processedData, selectedTemplate.schema);
                if (validationErrors) {
                    console.error('Validation Errors:', validationErrors);
                    setErrors(validationErrors);
                    setLoading(false);
                    return;
                }
            }

            // Convert form data to match schema types
            const finalData = Object.entries(processedData).reduce((acc, [key, value]) => {
                const fieldSchema = selectedTemplate.schema.properties[key];
                if (fieldSchema) {
                    if (fieldSchema.type === 'number') {
                        acc[key] = value === '' ? null : Number(value);
                    } else if (fieldSchema.type === 'boolean') {
                        acc[key] = Boolean(value);
                    } else {
                        acc[key] = value === '' ? null : value;
                    }
                } else {
                    // Include fields even if not in schema
                    acc[key] = value;
                }
                return acc;
            }, {});

            console.log('Processed Data:', finalData);

            const submitData = new FormData();
            submitData.append('campaignId', campaignId);
            submitData.append('templateId', selectedTemplate.id);
            submitData.append('data', JSON.stringify(finalData));
            
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
        console.log(`Rendering field - ID: ${id}, Field:`, field);
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

    // Helper function to add a name field if template doesn't have one
    const ensureNameField = () => {
        if (!selectedTemplate?.schema?.properties?.name && 
            !selectedTemplate?.schema?.properties?.characterName) {
            return (
                <div className="grid gap-2 mb-4">
                    <Label htmlFor="name">
                        Character Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter character name"
                        className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                </div>
            );
        }
        return null;
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
                    {errors._schema && (
                        <div className="text-sm text-red-500 mb-4 p-3 bg-red-50 rounded-md">
                            {errors._schema}
                        </div>
                    )}
                    
                    {schemaValidated && (
                        <>
                            {ensureNameField()}
                            {Object.entries(selectedTemplate.schema.properties).map(([id, field]) => 
                                renderField(id, field)
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {errors.submit && (
                <div className="text-sm text-red-500 mt-2">
                    {errors.submit}
                </div>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={loading || !schemaValidated}>
                    {loading ? 'Creating...' : 'Create Character'}
                </Button>
            </div>
        </form>
    );
} 