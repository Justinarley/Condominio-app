import {
  Home,
  Building2,
  Users,
  User,
  LogOut,
  Shield,
  Building,
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
      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive
          ? "text-white bg-blue-700 shadow-md font-semibold"
          : "text-blue-800 bg-blue-100"
      } hover:bg-blue-600 hover:text-white hover:shadow-lg`}
      onClick={() => router.push(path)}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-sky-600 to-sky-700 px-6 h-14 flex items-center justify-between shadow-md">
      {/* Logo + Tabs */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div
          className="flex gap-2 items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => router.push("/")}
        >
          <Building2 size={26} className="text-white" />
          <span className="text-lg font-bold text-white tracking-wide">
            App
          </span>
        </div>

        {/* Tabs */}
        <div className="bg-blue-100/90 backdrop-blur-sm rounded-xl px-4 py-1 flex items-center gap-4 h-12 shadow-inner">
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
                label="Mis Condominios"
                path="/admin/condominios"
                isActive={currentPath === "/admin/condominios"}
              />
              <TabItem
                icon={<Building size={18} />}
                label="Pagos Alicuotas"
                path="/admin/pagos-alicuotas"
                isActive={currentPath === "/admin/pagos-alicuotas"}
              />
              <TabItem
                icon={<Building size={18} />}
                label="Áreas Comunales"
                path="/admin/areas-comunales"
                isActive={currentPath === "/admin/areas-comunales"}
              />
            </>
          )}

          {user?.role === "propietario" && (
            <>
              <TabItem
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                path="/propietario/dashboard"
                isActive={currentPath === "/propietario/dashboard"}
              />
              <TabItem
                icon={<Building size={18} />}
                label="Pagos Alicuotas"
                path="/propietario/pagos-alicuotas"
                isActive={currentPath === "/propietario/pagos-alicuotas"}
              />
              <TabItem
                icon={<Building size={18} />}
                label="Área Comunal"
                path="/propietario/area-comunal"
                isActive={currentPath === "/propietario/area-comunal"}
              />
            </>
          )}

          {user?.role === "guardia" && (
            <>
              <TabItem
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                path="/guardia/dashboard"
                isActive={currentPath === "/guardia/dashboard"}
              />
              <TabItem
                icon={<Building size={18} />}
                label="Visitas y Servicios"
                path="/guardia/visitas-servicios"
                isActive={currentPath === "/guardia/visitas-servicios"}
              />
            </>
          )}
        </div>
      </div>

      {/* Usuario al lado derecho */}
      {user && (
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <div className="flex items-center gap-2 text-white text-sm font-medium cursor-pointer px-4 py-2 rounded-xl hover:bg-white/20 transition-all">
            <User size={20} />
            <span>{user.name}</span>
          </div>
        </Dropdown>
      )}
    </nav>
  );
}
