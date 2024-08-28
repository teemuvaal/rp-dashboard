'use client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function CreateNote() {
    return (
        <div>
            <form className="flex flex-col gap-4">
                <Input type="text" placeholder="Title" />
                <Textarea placeholder="Note" />
                <Button type="submit">Create</Button>
            </form>
        </div>
    )
}