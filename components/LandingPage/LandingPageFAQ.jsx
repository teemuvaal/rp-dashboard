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
        answer: "Get started for free! Subscription plans will be available soon."
    }
]


export default function LandingPageFAQ() {
    return (
        <div id="faq" className="">  
            <h2
            style={{ fontFamily: 'var(--font-departure-mono)' }}
            className="text-2xl md:text-4xl text-foreground mb-6"
            >FAQ</h2>
            <Accordion type="single" collapsible>
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