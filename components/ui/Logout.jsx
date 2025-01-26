'use client'
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

export default function Logout() {
    const supabase = createClient()
    const Logout = async () => {
        try {
            const { data, error } = await supabase.auth.signOut()
            if (error) {
                console.error(error)
            }
        } catch (error) {
            console.error(error)
        }
        router.push('/login')
    }
    return (
        <Button onClick={Logout}>Logout</Button>
    )
}