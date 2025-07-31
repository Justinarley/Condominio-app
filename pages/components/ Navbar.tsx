import { UserOutlined, HomeOutlined, TeamOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoded: any = jwtDecode(token);
        setUser({ name: decoded.name, role: decoded.role });
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Perfil",
    },
    {
      key: "logout",
      danger: true,
      label: "Cerrar sesión",
      onClick: handleLogout,
    },
  ];


  return (
    <nav className="bg-[#0f172a] text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="flex gap-6 items-center">
        <span className="text-xl font-semibold">Domus</span>

        {user?.role === "super_admin" && (
          <>
          <div
              className="cursor-pointer hover:text-cyan-400 transition"
              onClick={() => router.push("/superadmin/dashboard")}
            >
              <TeamOutlined className="mr-1" />
              Dashboard
            </div>
            <div
              className="cursor-pointer hover:text-cyan-400 transition"
              onClick={() => router.push("/superadmin/admins")}
            >
              <TeamOutlined className="mr-1" />
              Administradores
            </div>
            <div
              className="cursor-pointer hover:text-cyan-400 transition"
              onClick={() => router.push("/superadmin/condominios")}
            >
              <HomeOutlined className="mr-1" />
              Condominios
            </div>
          </>
        )}

        {user?.role === "admin" && (
          <div
            className="cursor-pointer hover:text-green-400 transition"
            onClick={() => router.push("/admin")}
          >
            <HomeOutlined className="mr-1" />
            Mi Condominio
          </div>
        )}
      </div>

      {user && (
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <div className="cursor-pointer flex items-center gap-2 hover:text-cyan-300 transition">
            <UserOutlined />
            <span className="font-medium">{user.name}</span>
          </div>
        </Dropdown>
      )}
    </nav>
  );
}
