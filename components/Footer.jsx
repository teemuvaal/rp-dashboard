import Image from "next/image";

export default function Footer() {
    return (
            <footer className="w-full bg-zinc-900 text-white flex flex-row p-4 md:h-40 flex-wrap mt-10 justify-between">
                <div className="flex flex-row gap-2 w-60">
                    <Image src="/dice.png" alt="Logo" height={100} width={100}/>
                    <p className="text-sm font-light">
                        <strong>Adventurehub.ai</strong> Plan, manage and run your adventures with help from AI
                    </p>
                </div>
                <div className="basis-1/5">
                    <p><a href="#faq">FAQ</a></p>
                    <p><a href="#about">About</a></p>
                    <p><a href="#contact">Contact</a></p>
                </div>
                <div className="basis-2/5">
                    <p>Find us in:</p>
                    <p>Instagram</p>
                    <p>Facebook</p>
                    <p>X</p>  
                </div>
            </footer>
    )
}