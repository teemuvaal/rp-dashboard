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
import { updateCharacter } from '@/app/dashboard/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

export default function CharacterSheet({ character, template, canEdit }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(character.data || {});
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('characterId', character.id);
            submitData.append('data', JSON.stringify(formData));

            const result = await updateCharacter(submitData);
            if (result.error) {
                throw new Error(result.error);
            }

            router.refresh();
        } catch (error) {
            console.error('Error updating character:', error);
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    const renderField = (id, field) => {
        const value = formData[id] || '';
        const error = errors[id];
        const commonProps = {
            id: id,
            value: value,
            onChange: (e) => {
                const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                setFormData({ ...formData, [id]: newValue });
                if (errors[id]) {
                    const newErrors = { ...errors };
                    delete newErrors[id];
                    setErrors(newErrors);
                }
            },
            disabled: !canEdit,
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
                        <Textarea {...commonProps} placeholder={field.description} />
                    ) : (
                        <Input {...commonProps} type="text" placeholder={field.description} />
                    )
                )}

                {field.type === 'number' && (
                    <Input 
                        {...commonProps}
                        type="number"
                        min={field.minimum}
                        max={field.maximum}
                        placeholder={field.description}
                    />
                )}

                {field.type === 'boolean' && (
                    <div className="flex items-center space-x-2">
                        <Switch 
                            {...commonProps}
                            checked={!!value}
                        />
                        <Label htmlFor={id}>{field.description}</Label>
                    </div>
                )}

                {field.enum && (
                    <Select
                        value={value}
                        onValueChange={(value) => {
                            if (canEdit) {
                                setFormData({ ...formData, [id]: value });
                                if (errors[id]) {
                                    const newErrors = { ...errors };
                                    delete newErrors[id];
                                    setErrors(newErrors);
                                }
                            }
                        }}
                        disabled={!canEdit}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={field.description} />
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
                    <CardTitle>Character Sheet</CardTitle>
                    <CardDescription>
                        {template.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(template.schema.properties).map(([id, field]) => 
                        renderField(id, field)
                    )}

                    {errors.submit && (
                        <div className="text-sm text-red-500 mt-2">
                            {errors.submit}
                        </div>
                    )}

                    {canEdit && (
                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </form>
    );
} 