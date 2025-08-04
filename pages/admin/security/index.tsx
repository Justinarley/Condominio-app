import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Card,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
} from "@ant-design/icons";
import api from "@/libs/axios";
import { ModalReporte } from "@/pages/components/Reportes";
import ResetPasswordModal from "@/pages/components/ResetPassword";

type Guardia = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  identificationNumber: string;
  status: "active" | "inactive";
  role: string;
  condominioNombre: string | null;
};

export default function GuardiasIndex() {
  const [guardias, setGuardias] = useState<Guardia[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedGuardiaId, setSelectedGuardiaId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchGuardias = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/guardias-activos");
      setGuardias(res.data);
    } catch {
      message.error("Error al cargar guardias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardias();
  }, []);

  const toggleStatus = async (guardia: Guardia) => {
    const newStatus = guardia.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/usuarios/${guardia._id}/status`, { status: newStatus });
      message.success(
        `Usuario ${newStatus === "active" ? "activado" : "desactivado"}`
      );
      fetchGuardias();
    } catch {
      message.error("Error al actualizar estado");
    }
  };

  const openPasswordModal = (guardiaId: string) => {
    setSelectedGuardiaId(guardiaId);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setSelectedGuardiaId(null);
    setIsPasswordModalOpen(false);
  };

  const columns = [
    {
      title: "Identificación",
      dataIndex: "identificationNumber",
      key: "identificationNumber",
    },
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Teléfono", dataIndex: "phone", key: "phone" },
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
      title: "Condominio",
      dataIndex: "condominioNombre",
      key: "condominioNombre",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, guardia: Guardia) => (
        <Space.Compact>
          <Popconfirm
            title={`¿Seguro que quieres ${
              guardia.status === "active" ? "desactivar" : "activar"
            } este usuario?`}
            onConfirm={() => toggleStatus(guardia)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type={guardia.status === "active" ? "default" : "primary"}
              icon={
                guardia.status === "active" ? <CloseOutlined /> : <CheckOutlined />
              }
            />
          </Popconfirm>
          <Button
            icon={<LockOutlined />}
            onClick={() => openPasswordModal(guardia._id)}
          />
        </Space.Compact>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Guardias</h1>

      <div className="mb-4 flex justify-end gap-2">
        <Button onClick={() => setVisible(true)}>Reporte</Button>
        <ModalReporte
          open={visible}
          onClose={() => setVisible(false)}
          endpoint="/reportes/guardias/excel"
        />
      </div>

      <Card className="shadow-sm border border-gray-200 rounded-md">
        <Table
          columns={columns}
          dataSource={guardias}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowClassName={() =>
            "hover:bg-gray-50 transition duration-150 ease-in-out"
          }
        />
      </Card>

      <ResetPasswordModal
        open={isPasswordModalOpen}
        onClose={closePasswordModal}
        userId={selectedGuardiaId}
        userType="usuarios"
      />
    </div>
  );
}
