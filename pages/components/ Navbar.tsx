import {
  User,
  Home,
  Users,
  Building2,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Dropdown } from "antd";
import { useRouter } from "next/router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PieChartOutlined } from "@ant-design/icons";
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
      {/* Contenedor izquierdo (logo + enlaces) */}
      <div className="flex items-center gap-6">
        {/* Logo + nombre */}
        <div className="flex gap-2 items-center cursor-pointer">
          <Building2 size={24} className="text-white" />
          <span className="text-base font-semibold text-white tracking-wide">
            App
          </span>
        </div>

        {/* Enlaces de navegación */}
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
              <div
                className="cursor-pointer hover:text-green-400 transition flex items-center gap-1"
                onClick={() => router.push("/admin/dashboard")}
              >
                <PieChartOutlined className="text-white" />
                <span>Dashboard</span>
              </div>
              <NavItem
                icon={<Home size={18} className="text-white" />}
                label="Mi Condominio"
                path="/admin"
              />
            </>
          )}
        </div>
      </div>{" "}
      {/* <-- Este cierre te faltaba */}
      {/* Usuario (derecha) */}
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
