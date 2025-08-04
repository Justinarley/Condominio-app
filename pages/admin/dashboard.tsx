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
  role: string;
  condominioNombre?: string;
  departamentoCodigo?: string;
};

export default function AdminDashboard() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [usuariosPendientes, setUsuariosPendientes] = useState<Usuario[]>([]);
  const [guardiasCount, setGuardiasCount] = useState<{
    activos: number;
    inactivos: number;
  }>({
    activos: 0,
    inactivos: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [resCondominios, resUsuarios, resGuardias] = await Promise.all([
        api.get("/admin/condominios"),
        api.get("/admin/usuarios-pendientes"),
        api.get("/admin/guardias-count"),
      ]);
      setCondominios(resCondominios.data);
      setUsuariosPendientes(resUsuarios.data);
      setGuardiasCount(resGuardias.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const aprobarUsuario = async (userId: string) => {
    try {
      await api.put(`/admin/usuarios/${userId}/aprobar`, { aprobar: true });
      setUsuariosPendientes((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Error aprobando usuario", error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard - Admin</h1>

      <Row gutter={16} className="mb-8">
        {condominios.slice(-3).map((condominio) => (
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
                title="Propietarios Activos"
                value={condominio.usuariosActivos}
                valueStyle={{ color: "green" }}
              />
              <Statistic
                title="Propietarios Inactivos"
                value={condominio.usuariosInactivos}
                valueStyle={{ color: "red" }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* NUEVO: Conteo de guardias */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Guardias Activos"
              value={guardiasCount.activos}
              valueStyle={{ color: "green" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Guardias Inactivos"
              value={guardiasCount.inactivos}
              valueStyle={{ color: "red" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla usuarios pendientes */}
      <Card title="Usuarios Inactivos Pendientes" loading={loading}>
        <Table
          dataSource={usuariosPendientes}
          rowKey="_id"
          pagination={{ pageSize: 8 }}
          columns={[
            {
              title: "Rol",
              dataIndex: "role",
              key: "role",
              render: (role: string) => (
                <Tag color={role === "guardia" ? "blue" : "green"}>
                  {role === "guardia" ? "Guardia" : "Propietario"}
                </Tag>
              ),
            },
            { title: "Nombre", dataIndex: "name", key: "name" },
            { title: "Email", dataIndex: "email", key: "email" },
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
              title: "Acción",
              key: "accion",
              render: (_: unknown, record: Usuario) => (
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
