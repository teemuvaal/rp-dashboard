import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

const FAQ = [
    {
        question: "What is this?",
        answer: "This is a question and answer."
    },
    {
        question: "What is this?",
        answer: "This is a question and answer."
    },
    {
        question: "What is this?",
        answer: "You won't believe me. This is a question and answer."
    }
]


export default function LandingPageFAQ() {
    return (
        <div id="faq" className="p-4 bg-gray-100 rounded-md shadow-md border border-gray-200">
            <h2 className="text-3xl font-bold font-serif">FAQ</h2>           
                {FAQ.map((faq, index) => (
                    <Accordion key={index} type="single" collapsible>
                    <AccordionItem key={index} value={faq.question}>
                        <AccordionTrigger key={index}>{faq.question}</AccordionTrigger>
                        <AccordionContent key={index}>{faq.answer}</AccordionContent>
                    </AccordionItem>
                    </Accordion>
                ))}            
        </div>
    )
}