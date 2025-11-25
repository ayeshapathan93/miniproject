import { LayoutDashboard, BookOpen, ClipboardList, Users, BarChart3, Settings, GraduationCap } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";

const teacherItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Curriculum", url: "/curriculum", icon: BookOpen },
  { title: "Activities", url: "/activities", icon: ClipboardList },
  { title: "Attendance", url: "/attendance", icon: Users },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

const studentItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Curriculum", url: "/curriculum", icon: BookOpen },
  { title: "Activities", url: "/activities", icon: ClipboardList },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  
  const items = profile?.role === "teacher" ? teacherItems : studentItems;
  const currentPath = location.pathname;

  const getNavCls = (isActive: boolean) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2 border-b">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {state !== "collapsed" && <span className="font-bold text-lg">ActivityWise</span>}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => getNavCls(isActive)}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
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
