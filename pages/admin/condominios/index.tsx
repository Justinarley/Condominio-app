import { useEffect, useState } from "react";
import { Card, Table, Tag, Typography, Space, message } from "antd";

import api from "@/libs/axios";
import { CondominioSelect } from "@/pages/components/Filtro-condominios";

const { Title, Text } = Typography;

type Condominio = {
  _id: string;
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  tipo?: "torres" | "casas";
  totalDepartamentos: number;
  usuariosActivos: number;
  usuariosInactivos: number;
};

export default function CondominiosAdminIndex() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroCondominio, setFiltroCondominio] = useState<string | null>(null);

  const fetchCondominios = async (condominioId?: string | null) => {
    setLoading(true);
    try {
      let url = "/admin/condominios";
      if (condominioId) {
        url += `?condominioId=${condominioId}`;
      }
      const res = await api.get(url);
      setCondominios(res.data);
    } catch (error) {
      message.error("Error cargando condominios con info");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondominios(filtroCondominio);
  }, [filtroCondominio]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Title level={5}>{name}</Title>,
    },
    {
      title: "Dirección",
      dataIndex: "address",
      key: "address",
      render: (address: string) => address || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => email || "-",
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "-",
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (tipo === "torres" ? "Torres" : "Casas"),
    },
    {
      title: "Departamentos",
      dataIndex: "totalDepartamentos",
      key: "totalDepartamentos",
      render: (total: number) => <Text>{total}</Text>,
    },
    {
      title: "Usuarios Activos",
      dataIndex: "usuariosActivos",
      key: "usuariosActivos",
      render: (activos: number) => <Tag color="green">{activos}</Tag>,
    },
    {
      title: "Usuarios Inactivos",
      dataIndex: "usuariosInactivos",
      key: "usuariosInactivos",
      render: (inactivos: number) => <Tag color="red">{inactivos}</Tag>,
    },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Title level={2} className="mb-6 text-gray-800">
        Condominios del Admin
      </Title>

      <div className="mb-6">
        <CondominioSelect
          value={filtroCondominio}
          onChange={(value) => setFiltroCondominio(value)}
        />
      </div>

      <Card bordered={false} className="shadow-md rounded-md">
        <Table
          columns={columns}
          dataSource={condominios}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "No hay condominios para mostrar" }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
