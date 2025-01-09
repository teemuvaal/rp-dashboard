import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

const FAQ = [
    {
        question: "What is AdventureHub.ai?",
        answer: "AdventureHub.ai is a platform for creating and sharing adventures for any roleplaying game."
    },
    {
        question: "How do I get started?",
        answer: "Simply create an account and start creating your own adventures. Invite your friends to play your adventure with you."
    },
    {
        question: "How much does it cost?",
        answer: "It's free!"
    }
]


export default function LandingPageFAQ() {
    return (
        <div id="faq" className="">  
            <h2>FAQ</h2>
        </div>
    )
}