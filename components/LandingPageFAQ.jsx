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
        <div id="faq" className="p-4 bg-gray-100 rounded-md shadow-md border border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-4">FAQ</h2>           
            {FAQ.map((faq, index) => (
                <Accordion key={index} type="single" collapsible className="mb-2">
                <AccordionItem value={faq.question}>
                    <AccordionTrigger className="text-sm sm:text-base">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base">{faq.answer}</AccordionContent>
                </AccordionItem>
                </Accordion>
            ))}            
        </div>
    )
}