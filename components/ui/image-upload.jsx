import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Camera, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';

export function ImageUpload({
    value,
    onChange,
    disabled,
    className,
}) {
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setError(null);
        
        if (acceptedFiles.length === 0) {
            return;
        }

        const file = acceptedFiles[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        onChange(file);
    }, [onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        maxFiles: 1,
        disabled
    });

    return (
        <div className="space-y-2">
            <div
                {...getRootProps()}
                className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg border border-dashed p-6 cursor-pointer transition-colors',
                    isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50',
                    disabled && 'opacity-50 cursor-not-allowed',
                    className
                )}
            >
                <input {...getInputProps()} />

                {value ? (
                    <>
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                            <Image
                                src={value}
                                alt="Preview"
                                className="object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute -right-2 -top-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-xs text-gray-600">
                        <Camera className="h-8 w-8 mb-2" />
                        <div className="text-center">
                            <p>Drag & drop an image here, or click to select</p>
                            <p className="text-gray-400">PNG, JPG, GIF up to 5MB</p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
} 