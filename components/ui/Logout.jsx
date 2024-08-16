'use client'
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

export default function Logout() {
    const supabase = createClient()
    const Logout = async () => {
        const { data, error } = await supabase.auth.signOut()
    }
    return (
        <Button onClick={Logout}>Logout</Button>
    )
}