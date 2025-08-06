import { useEffect, useState } from "react";
import { Table, Button, Space, Tag, message, Popconfirm, Card } from "antd";
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import api from "@/libs/axios";
import { ModalReporte } from "@/pages/components/Reportes";
import { CondominioSelect } from "@/pages/components/Filtro-condominios";

type Condominio = {
  _id: string;
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  tipo: "torres" | "casas";
  status: "active" | "inactive";
  adminId: {
    name: string;
    email: string;
    phone: string;
    identification: string;
  };
};

export default function CondominiosIndex() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedName, setSelectedName] = useState<string | undefined>(
    undefined
  );
  const [esDetallado, setEsDetallado] = useState(false);
  const [selectedCondominioId, setSelectedCondominioId] = useState<
    string | null
  >(null);

  const fetchCondominios = async (condominioId?: string | null) => {
    setLoading(true);
    try {
      let url = "/condominios";
      if (condominioId) {
        url += `?condominioId=${condominioId}`;
      }
      const res = await api.get(url);
      setCondominios(res.data);
    } catch {
      message.error("Error al cargar condominios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondominios(selectedCondominioId);
  }, [selectedCondominioId]);

  const toggleStatus = async (condominio: Condominio) => {
    const newStatus = condominio.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/condominios/${condominio._id}/status`, {
        status: newStatus,
      });
      message.success(
        `Condominio ${newStatus === "active" ? "activado" : "desactivado"}`
      );
      fetchCondominios();
    } catch {
      message.error("Error al actualizar estado");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="text-sm text-gray-800 hover:text-sky-600 transition-colors duration-200 cursor-pointer">
          {text}
        </span>
      ),
    },
    { title: "Dirección", dataIndex: "address", key: "address" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Teléfono", dataIndex: "phone", key: "phone" },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (tipo === "torres" ? "Torres" : "Casas"),
    },
    {
      title: "Administrador",
      key: "admin",
      render: (_: unknown, condominio: Condominio) => (
        <div>
          <div className="text-sm font-medium text-gray-800">
            {condominio.adminId?.name}
          </div>
          <div className="text-xs text-gray-500">
            {condominio.adminId?.email}
          </div>
        </div>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status === "active" ? (
          <Tag color="green">Activo</Tag>
        ) : (
          <Tag color="red">Inactivo</Tag>
        ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, condominio: Condominio) => (
        <Space.Compact>
          <Link href={`/superadmin/condominios/${condominio._id}/edit`}>
            <Button icon={<EditOutlined />} />
          </Link>
          <Popconfirm
            title={`¿Seguro que quieres ${
              condominio.status === "active" ? "desactivar" : "activar"
            } este condominio?`}
            onConfirm={() => toggleStatus(condominio)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type={condominio.status === "active" ? "default" : "primary"}
              icon={
                condominio.status === "active" ? (
                  <CloseOutlined />
                ) : (
                  <CheckOutlined />
                )
              }
            />
          </Popconfirm>
          <Button
            onClick={() => {
              setSelectedId(condominio._id);
              setSelectedName(condominio.name);
              setEsDetallado(true);
              setVisible(true);
            }}
            icon={<FileExcelOutlined />}
          />
        </Space.Compact>
      ),
    },
  ];

  return (
    <div className="pt-14 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">
      <h1 className="text-2xl font-bold mb-6 mt-4 text-gray-800">Condominios</h1>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CondominioSelect
          value={selectedCondominioId}
          onChange={(val) => setSelectedCondominioId(val)}
          superAdmin={true}
        />
        <div className="flex gap-2">
          <Link href="/superadmin/condominios/insert">
            <Button type="primary">Insertar</Button>
          </Link>
          <Button
            onClick={() => {
              setSelectedId(undefined);
              setSelectedName(undefined);
              setEsDetallado(false);
              setVisible(true);
            }}
          >
            Reporte
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200 rounded-md">
        <Table
          columns={columns}
          dataSource={condominios}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowClassName={() =>
            "hover:bg-gray-50 transition duration-150 ease-in-out"
          }
        />
      </Card>

      <ModalReporte
        open={visible}
        onClose={() => {
          setVisible(false);
          setSelectedId(undefined);
          setSelectedName(undefined);
          setEsDetallado(false);
        }}
        endpoint="/reportes/condominios/excel"
        id={selectedId}
        esDetallado={esDetallado}
        name={selectedName}
      />
    </div>
  );
}
