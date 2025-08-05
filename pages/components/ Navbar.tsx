import {
  Home,
  Building2,
  Users,
  User,
  LogOut,
  Shield,
  LayoutDashboard,
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

  const currentPath = router.pathname;

  const TabItem = ({
    icon,
    label,
    path,
    isActive,
  }: {
    icon: JSX.Element;
    label: string;
    path: string;
    isActive: boolean;
  }) => (
    <div
      className={`relative flex items-center gap-2 px-4 py-2 cursor-pointer transition-all duration-300 ${
        isActive ? "text-blue-600 font-semibold" : "text-gray-700"
      } hover:text-blue-600 hover:-translate-y-[2px]`}
      onClick={() => router.push(path)}
    >
      {icon}
      <span className="text-sm drop-shadow-sm">{label}</span>
      <span
        className={`absolute bottom-0 left-0 h-[2px] w-full transition-transform duration-300 origin-left ${
          isActive ? "bg-blue-600 scale-x-100" : "bg-blue-600 scale-x-0 group-hover:scale-x-100"
        }`}
      ></span>
    </div>
  );

  return (
    <nav className="w-full sticky top-0 z-50 shadow-sm">
      {/* Barra Superior */}
      <div className="bg-gradient-to-r from-sky-700 to-blue-900 px-6 py-3 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer text-white text-lg font-bold"
          onClick={() => router.push("/")}
        >
          <Building2 size={22} className="text-white" />
          <span>App</span>
        </div>
        {user && (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <div className="flex items-center gap-2 text-white text-sm font-medium cursor-pointer hover:scale-105 transition-transform">
              <User size={18} />
              <span>{user.name}</span>
            </div>
          </Dropdown>
        )}
      </div>

      {/* Tabs Container */}
      <div className="bg-white shadow-md px-6">
        <div className="flex items-center gap-6 h-12 group">
          {user?.role === "super_admin" && (
            <>
              <TabItem
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                path="/superadmin/dashboard"
                isActive={currentPath === "/superadmin/dashboard"}
              />
              <TabItem
                icon={<Users size={18} />}
                label="Administradores"
                path="/superadmin/admins"
                isActive={currentPath === "/superadmin/admins"}
              />
              <TabItem
                icon={<Building2 size={18} />}
                label="Condominios"
                path="/superadmin/condominios"
                isActive={currentPath === "/superadmin/condominios"}
              />
            </>
          )}

          {user?.role === "admin" && (
            <>
              <TabItem
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                path="/admin/dashboard"
                isActive={currentPath === "/admin/dashboard"}
              />
              <TabItem
                icon={<Users size={18} />}
                label="Propietarios"
                path="/admin/propietarios"
                isActive={currentPath === "/admin/propietarios"}
              />
              <TabItem
                icon={<Shield size={18} />}
                label="Guardias"
                path="/admin/security"
                isActive={currentPath === "/admin/security"}
              />
              <TabItem
                icon={<Home size={18} />}
                label="Mi Condominio"
                path="/admin"
                isActive={currentPath === "/admin"}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
