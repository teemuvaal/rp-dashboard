'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function ProfileForm({ initialUsername, initialProfilePicture, updateProfile }) {
    const [username, setUsername] = useState(initialUsername)
    const [profilePicture, setProfilePicture] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(initialProfilePicture)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const router = useRouter()

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setProfilePicture(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        const formData = new FormData()
        formData.append('username', username)
        if (profilePicture) {
            formData.append('profilePicture', profilePicture)
        }
        try {
            const result = await updateProfile(formData)
            if (result?.error) {
                console.error('Profile update failed:', result);
                setError(result.error + (result.details ? `: ${result.details.message}` : ''));
                setIsSubmitting(false);
            }
            // The redirect is handled by the server action if successful
        } catch (error) {
            console.error('Error updating profile:', error)
            setError(error.message)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                </label>
                <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                    Profile Picture
                </label>
                <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
            {previewUrl && (
                <div className="mt-2">
                    <img
                        src={previewUrl}
                        alt="Profile picture preview"
                        width={100}
                        height={100}
                        className="rounded-full object-cover"
                    />
                </div>
            )}
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Profile'}
            </Button>
        </form>
    )
}