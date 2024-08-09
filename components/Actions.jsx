import { Button } from "@/components/ui/button"


export default function Actions() {
    return (
        <div className="w-full flex flex-row p-4 gap-2">
            <span>
                <Button>Add Note</Button>
            </span>
            <span>
                <Button variant="outline">View Notes</Button>
            </span>
            <span>
                <Button variant="outline">Edit</Button>
            </span>
        </div>
    )
}