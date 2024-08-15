import Image from "next/image";

export default function Footer() {
    return (
            <footer className="w-full bg-zinc-900 text-white flex flex-row p-4 h-40 flex-wrap mt-10">
                <div className="basis-1/5 flex flex-row gap-2">
                    <Image src="/dice.png" alt="Logo" width={100} height={100} />
                    <p className="text-sm font-light">
                        <strong>Adventurehub.ai</strong> Plan, manage and run your adventures with help from AI
                    </p>
                </div>
                <div className="basis-2/5">
                    <p>Links</p>
                    <p>About</p>
                    <p>Contact</p>
                </div>
                <div className="basis-2/5">
                    <p>Socials</p>
                    <p>Instagram</p>
                    <p>Facebook</p>
                    <p>X</p>  
                </div>
            </footer>
    )
}