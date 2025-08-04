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

type Propietario = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  identification: string;
  status: "active" | "inactive";
};

export default function PropietariosIndex() {
  const [usuarios, setUsuarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/propietarios-activos");
      setUsuarios(res.data);
    } catch {
      message.error("Error al cargar propietarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const toggleStatus = async (user: Propietario) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/usuarios/${user._id}/status`, { status: newStatus });
      message.success(
        `Usuario ${newStatus === "active" ? "activado" : "desactivado"}`
      );
      fetchUsuarios();
    } catch {
      message.error("Error al actualizar estado");
    }
  };

  const openPasswordModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setSelectedUserId(null);
    setIsPasswordModalOpen(false);
  };

  const columns = [
    {
      title: "Identificación",
      dataIndex: "identification",
      key: "identification",
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
      title: "Departamento",
      dataIndex: "departamentoCodigo",
      key: "departamentoCodigo",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, user: Propietario) => (
        <Space.Compact>
          <Popconfirm
            title={`¿Seguro que quieres ${
              user.status === "active" ? "desactivar" : "activar"
            } este usuario?`}
            onConfirm={() => toggleStatus(user)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type={user.status === "active" ? "default" : "primary"}
              icon={
                user.status === "active" ? <CloseOutlined /> : <CheckOutlined />
              }
            />
          </Popconfirm>
          <Button
            icon={<LockOutlined />}
            onClick={() => openPasswordModal(user._id)}
          />
        </Space.Compact>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Propietarios</h1>

      <div className="mb-4 flex justify-end gap-2">
        <Button onClick={() => setVisible(true)}>Reporte</Button>
        <ModalReporte
          open={visible}
          onClose={() => setVisible(false)}
          endpoint="/reportes/propietarios/excel"
        />
      </div>

      <Card className="shadow-sm border border-gray-200 rounded-md">
        <Table
          columns={columns}
          dataSource={usuarios}
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
        userId={selectedUserId}
        userType="usuarios"
      />
    </div>
  );
}
