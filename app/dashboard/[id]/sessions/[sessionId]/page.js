import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  



export default async function SessionPage({ params }) {
    const sessionId = params.sessionId
    const supabase = createClient()
    const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

    if (error) {
        notFound()
    }

    return (
        <>
        <div>Session</div>
        <div>
            {session.id}
        </div>
        </>
    )
}