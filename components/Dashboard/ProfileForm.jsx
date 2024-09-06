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
        const formData = new FormData()
        formData.append('username', username)
        if (profilePicture) {
            formData.append('profilePicture', profilePicture)
        }
        try {
            await updateProfile(formData)
            // The redirect is now handled by the server action
        } catch (error) {
            console.error('Error updating profile:', error)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
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