import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Card,
  Table,
  Tag,
  Typography,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  HomeOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

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

  const StatCard = ({
    icon,
    title,
    value,
    extra,
    iconColor = "bg-blue-100 text-blue-500",
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    extra?: string;
    iconColor?: string;
  }) => (
    <div className="w-full bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200 cursor-pointer">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full text-xl ${iconColor}`}>{icon}</div>
        <div className="flex-1">
          <div className="text-xl font-semibold text-gray-800">{value}</div>
          <div className="text-gray-500">{title}</div>
          {extra && (
            <div className="text-xs text-gray-400 mt-1">{extra}</div>
          )}
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
        <Col xs={24} sm={12} md={6}>
          <StatCard
            icon={<UserOutlined />}
            title="Propietarios"
            value={admins.length}
            extra={`Activos: ${adminsActivos.length} / Inactivos: ${
              admins.length - adminsActivos.length
            }`}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <StatCard
            icon={<HomeOutlined />}
            title="Residentes"
            value={admins.length} 
            extra="Actualización pendiente"
            iconColor="bg-purple-100 text-purple-500"
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <StatCard
            icon={<ApartmentOutlined />}
            title="Condominios"
            value={condominios.length}
            extra="Actualización pendiente"
            iconColor="bg-green-100 text-green-500"
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            title="Condominios Activos"
            value={condominios.filter((c) => c.status === "active").length}
            extra="Actualización pendiente"
            iconColor="bg-yellow-100 text-yellow-500"
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
