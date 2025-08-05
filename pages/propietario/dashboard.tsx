import { useEffect, useState } from "react";
import api from "@/libs/axios";
import { Card, Row, Col, Typography, Tag } from "antd";
import {
  UserOutlined,
  ApartmentOutlined,
  HomeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AreaComunalIndex() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/usuarios/dashboard-propietario").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) return <div className="p-8">Cargando datos...</div>;

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
    <Card className="rounded-xl shadow-md hover:shadow-lg transition duration-200">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full text-xl ${iconColor}`}>{icon}</div>
        <div className="flex-1">
          <div className="text-xl font-semibold text-gray-800">{value}</div>
          <div className="text-gray-500">{title}</div>
          {extra && <div className="text-xs text-gray-400 mt-1">{extra}</div>}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="pt-14 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">
      <Title level={2} className="!text-gray-800 mb-10 mt-8">
        Panel del Usuario
      </Title>

      <Row gutter={[20, 20]} className="mb-12">
        <Col xs={24} sm={12} md={6}>
          <StatCard
            icon={<UserOutlined />}
            title="Nombre"
            value={data.usuario.name}
            extra={data.usuario.email}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            icon={<ApartmentOutlined />}
            title="Condominio"
            value={data.condominio.name}
            extra={data.condominio.address}
            iconColor="bg-green-100 text-green-600"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            icon={<HomeOutlined />}
            title="Departamento"
            value={data.departamento.nombre}
            extra={`Grupo: ${data.departamento.grupo}`}
            iconColor="bg-purple-100 text-purple-600"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            icon={<FileTextOutlined />}
            title="Solicitudes de Área Común"
            value={data.solicitudes}
            extra="Totales realizadas"
            iconColor="bg-yellow-100 text-yellow-600"
          />
        </Col>
      </Row>

      <Card className="rounded-xl shadow-md">
        <Title level={4} className="text-gray-800 mb-6">
          Administrador del Condominio
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Nombre:</Text>
            <div>{data.administrador.name}</div>
          </Col>
          <Col span={8}>
            <Text strong>Email:</Text>
            <div>{data.administrador.email}</div>
          </Col>
          <Col span={8}>
            <Text strong>Teléfono:</Text>
            <div>{data.administrador.phone}</div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
