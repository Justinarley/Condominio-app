import {
  User,
  Home,
  Users,
  Building2,
  LayoutDashboard,
  LogOut,
  Shield,
  Building,
} from "lucide-react";
import { Dropdown } from "antd";
import { useRouter } from "next/router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { JSX } from "react";

export default function Navbar() {
  const router = useRouter();
  const user = useCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const menuItems = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: "Perfil",
      onClick: handleProfile,
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      danger: true,
      label: "Cerrar sesión",
      onClick: handleLogout,
    },
  ];

  const NavItem = ({
    icon,
    label,
    path,
  }: {
    icon: JSX.Element;
    label: string;
    path: string;
  }) => (
    <div
      className="flex items-center gap-2 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-transform hover:scale-105 hover:bg-sky-700 cursor-pointer"
      onClick={() => router.push(path)}
    >
      {icon}
      <span>{label}</span>
    </div>
  );

  return (
    <nav className="bg-sky-600 px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex gap-2 items-center cursor-pointer">
          <Building2 size={24} className="text-white" />
          <span className="text-base font-semibold text-white tracking-wide">
            App
          </span>
        </div>

        <div className="flex gap-2">
          {user?.role === "super_admin" && (
            <>
              <NavItem
                icon={<LayoutDashboard size={18} className="text-white" />}
                label="Dashboard"
                path="/superadmin/dashboard"
              />
              <NavItem
                icon={<Users size={18} className="text-white" />}
                label="Administradores"
                path="/superadmin/admins"
              />
              <NavItem
                icon={<Building2 size={18} className="text-white" />}
                label="Condominios"
                path="/superadmin/condominios"
              />
            </>
          )}
          {user?.role === "admin" && (
            <>
              <NavItem
                icon={<LayoutDashboard size={18} className="text-white" />}
                label="Dashboard"
                path="/admin/dashboard"
              />
              <NavItem
                icon={<Users size={18} className="text-white" />}
                label="Propietarios"
                path="/admin/propietarios"
              />
              <NavItem
                icon={<Shield size={18} className="text-white" />}
                label="Guardias"
                path="/admin/security"
              />
              <NavItem
                icon={<Home size={18} className="text-white" />}
                label="Mis Condominios"
                path="/admin/condominios"
              />
              <NavItem
                icon={<Building size={18} className="text-white" />}
                label="Areas Comunales"
                path="/admin/areas-comunales"
              />
            </>
          )}
          {user?.role === "propietario" && (
            <>
              <NavItem
                icon={<LayoutDashboard size={18} className="text-white" />}
                label="Dashboard"
                path="/propietario/dashboard"
              />
              <NavItem
                icon={<Building size={18} className="text-white" />}
                label="Area comunal"
                path="/propietario/area-comunal"
              />
            </>
          )}
        </div>
      </div>
      {user && (
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <div className="flex items-center gap-2 text-white text-sm font-medium cursor-pointer hover:scale-105 transition-transform">
            <User size={18} />
            <span>{user.name}</span>
          </div>
        </Dropdown>
      )}
    </nav>
  );
}
