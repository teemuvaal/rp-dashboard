import { Button } from "@/components/ui/button"

export default function Actions({ actions }) {
    return (
        <div className="w-full flex flex-wrap justify-start items-center p-2 sm:p-4 gap-2">
            {actions.map((action, index) => (
                <Button key={index} variant={action.variant} className="text-sm sm:text-base">
                    {action.label}
                </Button>
            ))}
        </div>
    )
}