import {
    AudioWaveform,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    Notebook,
    Users,
    ChartBar,
    Library,
    Settings,
} from "lucide-react"

export const getMainNavigation = (params) => [
    {
        title: "Notes",
        url: `/dashboard/${params.id}/notes`,
        icon: Notebook,
        isActive: true,
        items: [
            {
                title: "Add Note",
                type: "component",
                component: "AddNoteButton",
                props: {
                    campaignId: params.id,
                    type: "ghost"
                }
            },
            {
                title: "Recent Notes",
                type: "component",
                component: "NavNotes",
                props: {
                    campaignId: params.id
                }
            }
        ]
    },
    {
        title: "Sessions",
        url: `/dashboard/${params.id}/sessions`,
        icon: Bot,
        items: [
            {
                title: "Upcoming",
                url: `/dashboard/${params.id}/sessions/#upcoming-sessions`,
            },
            {
                title: "Past Sessions",
                url: `/dashboard/${params.id}/sessions/#past-sessions`,
            },
        ]
    },
    {
        title: "Assets",
        url: `/dashboard/${params.id}/assets`,
        icon: Library,
        items: [
            {
                title: "Recent Assets",
                type: "component",
                component: "NavAssets",
                props: {
                    campaignId: params.id
                }
            }
        ]
    },
]

export const getToolsNavigation = (params) => [
    {
        name: "Members",
        url: `/dashboard/${params.id}/members`,
        icon: Users,
    },
    {
        name: "Polls",
        url: `/dashboard/${params.id}/polls`,
        icon: ChartBar,
    },
    {
        name: "Campaign Settings",
        url: `/dashboard/${params.id}/details`,
        icon: Settings2,
    },
] 