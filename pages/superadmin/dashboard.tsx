import { useEffect, useState } from "react";
import api from "@/libs/axios";
import { Table, Tag, Typography, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Building2, Home } from "lucide-react";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

type Admin = {
  _id: string;
  name: string;
  email: string;
  status: string;
};

type Condominio = {
  _id: string;
  name: string;
  tipo: string;
  status: string;
  address: string;
  adminId: {
    name: string;
    email: string;
  };
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminsActivos, setAdminsActivos] = useState<Admin[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [resAdmins, resActivos, resCondominios] = await Promise.all([
        api.get("/admins"),
        api.get("/admins/actives"),
        api.get("/condominios"),
      ]);
      setAdmins(resAdmins.data);
      setAdminsActivos(resActivos.data);
      setCondominios(resCondominios.data);
    };

    fetchData();
  }, []);

  const cantidadTorres = condominios.filter((c) => c.tipo === "torres").length;
  const cantidadCasas = condominios.filter((c) => c.tipo === "casas").length;
  const condominiosActivos = condominios.filter((c) => c.status === "active").length;
  const condominiosInactivos = condominios.length - condominiosActivos;

  const StatCard = ({
    icon,
    title,
    value,
    extra,
    bgColor = "bg-white",
    iconColor = "bg-blue-100 text-blue-500",
    onClick,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    extra?: string;
    bgColor?: string;
    iconColor?: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`w-full h-full flex flex-col justify-between ${bgColor} rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200 ${
        onClick ? "cursor-pointer hover:opacity-95" : ""
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full text-xl ${iconColor}`}>{icon}</div>
        <div className="flex-1">
          <div className="text-xl font-semibold text-gray-800">{value}</div>
          <div className="text-gray-600">{title}</div>
          {extra && <div className="text-xs text-gray-500 mt-1">{extra}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-14 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">
      <Title level={2} className="!text-gray-800 mb-10 mt-8">
        Panel de Control - Super Admin
      </Title>

      <Row gutter={[20, 20]} className="mb-12">
        {/* ADMINISTRADORES - Celeste suave */}
        <Col xs={24} sm={12} md={6} className="min-h-[160px]">
          <StatCard
            icon={<UserOutlined />}
            title="Administradores"
            value={admins.length}
            onClick={() => router.push("/superadmin/admins")}
            extra={`Activos: ${adminsActivos.length} / Inactivos: ${admins.length - adminsActivos.length}`}
            bgColor="bg-blue-50"
            iconColor="bg-blue-200 text-blue-600"
          />
        </Col>

        {/* CONDOMINIOS GENERAL - Verde suave */}
        <Col xs={24} sm={12} md={6} className="min-h-[160px]">
          <StatCard
            icon={<Building2 />}
            title="Total Condominios"
            value={condominios.length}
            extra={`Activos: ${condominiosActivos} / Inactivos: ${condominiosInactivos}`}
            bgColor="bg-green-50"
            iconColor="bg-green-200 text-green-600"
            onClick={() => router.push("/superadmin/condominios")}
          />
        </Col>

        {/* Torres - Azul Agua */}
        <Col xs={24} sm={12} md={6} className="min-h-[160px]">
          <StatCard
            icon={<Building2 />}
            title="Tipo Torres"
            value={cantidadTorres}
            extra="Condominios tipo torre"
            bgColor="bg-cyan-50"
            iconColor="bg-cyan-200 text-cyan-600"
          />
        </Col>

        {/* Casa - Rosado suave */}
        <Col xs={24} sm={12} md={6} className="min-h-[160px]">
          <StatCard
            icon={<Home />}
            title="Tipo Casas"
            value={cantidadCasas}
            extra="Condominios tipo casa"
            bgColor="bg-pink-50"
            iconColor="bg-pink-200 text-pink-600"
          />
        </Col>
      </Row>

      {/* Últimos Condominios - Fondo gris suave */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-md">
        <Title level={4} className="mb-6 text-gray-800">
          Últimos Condominios Creados
        </Title>
        <Table
          dataSource={condominios.slice(-5).reverse()}
          rowKey="_id"
          pagination={false}
          columns={[
            {
              title: "Nombre",
              dataIndex: "name",
              render: (text) => <Text strong>{text}</Text>,
            },
            {
              title: "Tipo",
              dataIndex: "tipo",
              render: (text: string) => (
                <Tag color={text === "torres" ? "geekblue" : "volcano"}>
                  {text === "torres" ? "Torres" : "Casas"}
                </Tag>
              ),
            },
            {
              title: "Dirección",
              dataIndex: "address",
              render: (text) => (
                <Text ellipsis className="max-w-[200px] block">
                  {text}
                </Text>
              ),
            },
            {
              title: "Administrador",
              dataIndex: ["adminId", "name"],
              render: (name) => <Text>{name}</Text>,
            },
            {
              title: "Email Admin",
              dataIndex: ["adminId", "email"],
              render: (email) => (
                <Text type="secondary" className="text-xs">
                  {email}
                </Text>
              ),
            },
            {
              title: "Estado",
              dataIndex: "status",
              render: (text) =>
                text === "active" ? (
                  <Tag color="green">Activo</Tag>
                ) : (
                  <Tag color="red">Inactivo</Tag>
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}
