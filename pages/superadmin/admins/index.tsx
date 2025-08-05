import { useEffect, useState } from "react";
import { Table, Button, Space, Tag, message, Popconfirm, Card } from "antd";
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
} from "@ant-design/icons";
import api from "@/libs/axios";
import Link from "next/link";
import { ModalReporte } from "@/pages/components/Reportes";
import ResetPasswordModal from "@/pages/components/ResetPassword";

type Admin = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  identification: string;
  status: "active" | "inactive";
};

export default function AdminsIndex() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admins");
      setAdmins(res.data);
    } catch {
      message.error("Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const toggleStatus = async (admin: Admin) => {
    const newStatus = admin.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/admins/${admin._id}/status`, { status: newStatus });
      message.success(
        `Administrador ${newStatus === "active" ? "activado" : "desactivado"}`
      );
      fetchAdmins();
    } catch {
      message.error("Error al actualizar estado");
    }
  };

  const openPasswordModal = (adminId: string) => {
    setSelectedAdminId(adminId);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setSelectedAdminId(null);
    setIsPasswordModalOpen(false);
  };

  const columns = [
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
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Teléfono", dataIndex: "phone", key: "phone" },
    { title: "Dirección", dataIndex: "address", key: "address" },
    {
      title: "Identificación",
      dataIndex: "identification",
      key: "identification",
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
      render: (_: unknown, admin: Admin) => (
        <Space.Compact>
          <Link href={`/superadmin/admins/${admin._id}/edit`}>
            <Button icon={<EditOutlined />} />
          </Link>
          <Popconfirm
            title={`¿Seguro que quieres ${
              admin.status === "active" ? "desactivar" : "activar"
            } este admin?`}
            onConfirm={() => toggleStatus(admin)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type={admin.status === "active" ? "default" : "primary"}
              icon={
                admin.status === "active" ? (
                  <CloseOutlined />
                ) : (
                  <CheckOutlined />
                )
              }
            />
          </Popconfirm>
          <Button
            icon={<LockOutlined />}
            onClick={() => openPasswordModal(admin._id)}
          />
        </Space.Compact>
      ),
    },
  ];

  return (
     <div className="pt-14 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">
      <h1 className="text-2xl font-bold mb-6 mt-4 text-gray-800">Administradores</h1>

      <div className="mb-4 flex justify-end gap-2">
        <Link href="/superadmin/admins/insert">
          <Button type="primary">Insertar</Button>
        </Link>
        <Button onClick={() => setVisible(true)}>Reporte</Button>
        <ModalReporte
          open={visible}
          onClose={() => setVisible(false)}
          endpoint="/reportes/admins/excel"
        />
      </div>
      <Card className="shadow-sm border border-gray-200 rounded-md">
        <Table
          columns={columns}
          dataSource={admins}
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
        userId={selectedAdminId}
        userType="admins"
      />
    </div>
  );
}
