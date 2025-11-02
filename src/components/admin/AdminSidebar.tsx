import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Settings,
  TrendingUp,
  Wallet,
  FileText
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Overview",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Applications",
    url: "/admin/applications",
    icon: FileText,
  },
  {
    title: "Transactions",
    url: "/admin/transactions",
    icon: CreditCard,
  },
  {
    title: "Support Tickets",
    url: "/admin/support",
    icon: MessageSquare,
  },
  {
    title: "Email System",
    url: "/admin/email",
    icon: Settings,
  },
  {
    title: "Wallet Settings",
    url: "/admin/wallets",
    icon: Wallet,
  },
  {
    title: "User Activity",
    url: "/admin/activity",
    icon: TrendingUp,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
