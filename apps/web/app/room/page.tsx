import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { UserPlusIcon, UsersIcon, PencilIcon, PencilRuler } from "lucide-react"

export default function AppSidebar({
    onLogout,
    ...props
}: React.ComponentProps<typeof Sidebar> & { onLogout?: () => void }) {
    return <div></div>
}
