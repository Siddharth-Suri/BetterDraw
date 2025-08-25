import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Wifi, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Hero115Props {
    icon?: React.ReactNode
    heading: string
    description: string
    button: {
        text: string
        icon?: React.ReactNode
        url: string
    }
    trustText?: string
    imageSrc?: string
    imageAlt?: string
}

const Hero115 = ({
    icon = <Wifi className="size-6" />,
    heading = "Blocks built with Shadcn & Tailwind",
    description = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
    button = {
        text: "Discover Features",
        icon: <Zap className="ml-2 size-4" />,
        url: "https://www.shadcnblocks.com",
    },
    trustText = "Hated by many , Trusted by none ",
    imageSrc = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    imageAlt = "placeholder",
}: Hero115Props) => {
    return (
        <section className="overflow-hidden py-32">
            <div className="container">
                <div className="flex flex-col gap-5">
                    <div className="relative flex flex-col gap-5">
                        <div
                            style={{
                                transform: "translate(-50%, -50%)",
                            }}
                            className="absolute top-1/2 left-1/2 -z-10 mx-auto size-[800px] rounded-full border [mask-image:linear-gradient(to_top,transparent,transparent,white,white,white,transparent,transparent)] p-16 md:size-[1300px] md:p-32"
                        >
                            <div className="size-full rounded-full border p-16 md:p-32">
                                <div className="size-full rounded-full border"></div>
                            </div>
                        </div>
                        <span className="mx-auto flex size-20  items-center justify-center rounded-full ">
                            <a
                                href="https://github.com/Siddharth-Suri/BetterDraw"
                                target="_blank"
                            >
                                {icon}
                            </a>
                        </span>
                        <h2 className="mx-auto max-w-5xl text-center text-3xl font-medium text-balance md:text-6xl">
                            {heading}
                        </h2>
                        <p className="mx-auto max-w-3xl text-center text-muted-foreground md:text-lg">
                            {description}
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 pt-3 pb-12">
                            <Button size="lg" asChild>
                                <a href={button.url}>
                                    {button.text} {button.icon}
                                </a>
                            </Button>
                            {trustText && (
                                <div className="pt-1.5 text-xs text-muted-foreground">
                                    {trustText}
                                </div>
                            )}
                        </div>
                    </div>
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        className="mx-auto h-full max-h-[524px] w-full max-w-5xl rounded-2xl object-cover"
                    />
                </div>
            </div>
        </section>
    )
}

export { Hero115 }

export function GitHub() {
    return (
        <div className="bg-white rounded-2xl border-0">
            <img src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"></img>
        </div>
    )
}
export function RightUpArrow() {
    return (
        <div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                />
            </svg>
        </div>
    )
}

export default function Home() {
    return (
        <div className="flex items-center justify-center">
            <Hero115
                icon={<GitHub />}
                heading="Hermit : The Real Time Secure Chat App"
                description="Blazingly fast and scalable — powered by Next.js, WebSockets, Redis, PostgreSQL, Node.js, Tailwind, and Shadcn UI."
                button={{
                    text: "Get Started",
                    icon: <RightUpArrow />,
                    url: "/auth",
                }}
                imageSrc="/shiba.jpg"
            />
        </div>
    )
}
