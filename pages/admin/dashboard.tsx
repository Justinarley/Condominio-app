import { useEffect, useState } from "react";
import api from "@/libs/axios";
import { Card, Statistic, Row, Col, Table, Tag, Tooltip } from "antd";
import { CheckOutlined } from "@ant-design/icons";

type Condominio = {
  _id: string;
  id: string;
  name: string;
  totalDepartamentos: number;
  usuariosActivos: number;
  usuariosInactivos: number;
};

type Usuario = {
  _id: string;
  name: string;
  email: string;
  departamentoId: {
    codigo: string;
    nombre: string;
  } | null;
  status: string;
};

export default function AdminDashboard() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [usuariosPendientes, setUsuariosPendientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [resCondominios, resUsuarios] = await Promise.all([
        api.get("/admin/condominios"),
        api.get("/admin/usuarios-pendientes"),
      ]);
      setCondominios(resCondominios.data);
      setUsuariosPendientes(resUsuarios.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const aprobarUsuario = async (userId: string) => {
    try {
      await api.put(`/admin/usuarios/${userId}/aprobar`, { aprobar: true });
      setUsuariosPendientes((prev) => prev.filter((u) => u._id !== userId));
      // Opcional: también podrías actualizar los condominios si quieres reflejar cambios
    } catch (error) {
      console.error("Error aprobando usuario", error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard - Admin</h1>

      <Row gutter={16} className="mb-8">
        {condominios.map((condominio) => (
          <Col key={condominio._id} xs={24} md={8}>
            <Card
              title={
                <>
                  <div>{condominio.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    ID: {condominio.id}
                  </div>
                </>
              }
            >
              <Statistic
                title="Departamentos"
                value={condominio.totalDepartamentos}
              />
              <Statistic
                title="Usuarios Activos"
                value={condominio.usuariosActivos}
                valueStyle={{ color: "green" }}
              />
              <Statistic
                title="Usuarios Inactivos"
                value={condominio.usuariosInactivos}
                valueStyle={{ color: "red" }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Usuarios Inactivos Pendientes" loading={loading}>
        <Table
          dataSource={usuariosPendientes}
          rowKey="_id"
          pagination={{ pageSize: 8 }}
          columns={[
            { title: "Nombre", dataIndex: "name" },
            { title: "Email", dataIndex: "email" },
            {
              title: "Departamento",
              dataIndex: ["departamentoId", "codigo"],
              render: (text) => text || "N/A",
            },
            {
              title: "Acción",
              render: (_, record) => (
                <Tooltip title="Aprobar usuario">
                  <CheckOutlined
                    style={{ color: "green", cursor: "pointer", fontSize: 18 }}
                    onClick={() => aprobarUsuario(record._id)}
                  />
                </Tooltip>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
