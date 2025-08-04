import { useEffect, useState } from "react";
import api from "@/libs/axios";
import { Table, Tag, Typography, Row, Col } from "antd";
import { UserOutlined, CheckCircleOutlined } from "@ant-design/icons";
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

  const StatCard = ({
    icon,
    title,
    value,
    extra,
    iconColor = "bg-blue-100 text-blue-500",
    onClick,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    extra?: string;
    iconColor?: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`w-full bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200 ${
        onClick ? "cursor-pointer hover:bg-gray-100" : ""
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
          <div className="text-gray-500">{title}</div>
          {extra && <div className="text-xs text-gray-400 mt-1">{extra}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Title level={2} className="!text-gray-800 mb-10">
        Panel de Control - Super Admin
      </Title>

      <Row gutter={[20, 20]} className="mb-12">
        <Col xs={24} sm={12} md={5}>
          <StatCard
            icon={<UserOutlined />}
            title="Administradores"
            value={admins.length}
            onClick={() => router.push("/superadmin/admins")}
            extra={`Activos: ${adminsActivos.length} / Inactivos: ${
              admins.length - adminsActivos.length
            }`}
          />
        </Col>

        <Col xs={24} sm={12} md={5}>
          <StatCard
            icon={<Building2 />}
            title="Condominios"
            value={condominios.length}
            extra="Actualización pendiente"
            iconColor="bg-green-100 text-green-500"
            onClick={() => router.push("/superadmin/condominios")}
          />
        </Col>

        <Col xs={24} sm={12} md={5}>
          <StatCard
            icon={<CheckCircleOutlined />}
            title="Condominios Activos"
            value={condominios.filter((c) => c.status === "active").length}
            extra="Actualización pendiente"
            iconColor="bg-yellow-100 text-yellow-500"
          />
        </Col>

        <Col xs={24} sm={12} md={4}>
          <StatCard
            icon={<Building2 />}
            title="Tipo Torres"
            value={cantidadTorres}
            extra="Condominios tipo torre"
            iconColor="bg-indigo-100 text-indigo-500"
          />
        </Col>

        <Col xs={24} sm={12} md={4}>
          <StatCard
            icon={<Home />}
            title="Tipo Casas"
            value={cantidadCasas}
            extra="Condominios tipo casa"
            iconColor="bg-pink-100 text-pink-500"
          />
        </Col>
      </Row>

      <div className="bg-white p-6 rounded-xl shadow-md">
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
