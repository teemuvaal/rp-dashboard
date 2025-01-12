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
        answer: "Simply create an account and start creating your own adventures. Invite your friends to start sharing notes, assets and more."
    },
    {
        question: "How much does it cost?",
        answer: "Get started for free! Subscription plans will be available soon."
    },
    {
        question: "What tabletop games are supported?",
        answer: "You can use any tabletop game you want! For now, AI features work best with DnD 5e, but we're working on adding more games soon and ways to link to our AI assistant."
    },
    {
        question: "How does the AI assistant work?",
        answer: "The AI assistant is powered by a large language model and can help you design your adventures and recall key information from your notes. You can decide if it's available for your players to use or not."
    }
]


export default function LandingPageFAQ() {
    return (
        <div id="faq" className="">  
            <h2
            style={{ fontFamily: 'var(--font-departure-mono)' }}
            className="text-2xl md:text-4xl text-foreground mb-6"
            >FAQ</h2>
            <Accordion type="single" collapsible
            style={{ fontFamily: 'var(--font-sans)' }}
            >
                {FAQ.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index + 1}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}