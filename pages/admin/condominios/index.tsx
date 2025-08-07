import { useEffect, useState } from "react";
import { Card, Table, Tag, Typography, message, Button, Space } from "antd";
import api from "@/libs/axios";
import { CheckOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { CondominioSelect } from "@/pages/components/Filtro-condominios";
import { CrearGastoMensualModal } from "@/pages/components/Modalgastos";
import { IngresarAlicuotasModal } from "@/pages/components/ModalAlicuotas";

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
  const [modalGastoVisible, setModalGastoVisible] = useState(false);
  const [modalAlicuotaVisible, setModalAlicuotaVisible] = useState(false);
  const [condominioSeleccionado, setCondominioSeleccionado] = useState<{
    _id: string;
    name: string;
  } | null>(null);

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

  // Abrir modal gasto mensual
  const abrirModalGasto = (condominio: Condominio) => {
    setCondominioSeleccionado({ _id: condominio._id, name: condominio.name });
    setModalGastoVisible(true);
  };

  const abrirModalAlicuota = (condominio: Condominio) => {
    setCondominioSeleccionado({ _id: condominio._id, name: condominio.name });
    setModalAlicuotaVisible(true);
  };

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
    {
      title: "Acciones",
      key: "acciones",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Condominio) => (
        <Space>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => abrirModalGasto(record)}
            title="Crear gasto mensual"
          />
          <Button
            type="default"
            icon={<CheckOutlined />}
            onClick={() => abrirModalAlicuota(record)}
            title="Asignar alícuota"
          ></Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 mt-16">
        Condominios del Admin
      </h1>

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

      {condominioSeleccionado && (
        <CrearGastoMensualModal
          condominioId={condominioSeleccionado._id}
          condominioName={condominioSeleccionado.name}
          modalVisible={modalGastoVisible}
          setModalVisible={setModalGastoVisible}
        />
      )}

      {condominioSeleccionado && (
        <IngresarAlicuotasModal
          condominioId={condominioSeleccionado._id}
          condominioName={condominioSeleccionado.name}
          modalVisible={modalAlicuotaVisible}
          setModalVisible={setModalAlicuotaVisible}
        />
      )}
    </div>
  );
}
