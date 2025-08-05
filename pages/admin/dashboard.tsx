import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Card,
  Statistic,
  Row,
  Col,
  Table,
  Tag,
  Tooltip,
  Select,
  message,
} from "antd";
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
  const [selectedCondominio, setSelectedCondominio] = useState<string | null>(
    null
  );
  const [guardiasCount, setGuardiasCount] = useState<{
    activos: number;
    inactivos: number;
  }>({
    activos: 0,
    inactivos: 0,
  });
  const [loading, setLoading] = useState(false);

  // Función para cargar condominios y conteos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resCondominios, resUsuarios, resGuardias] = await Promise.all([
          api.get("/admin/condominios"),
          api.get("/admin/usuarios-pendientes"),
          api.get("/admin/guardias-count"),
        ]);
        setCondominios(resCondominios.data);
        setUsuariosPendientes(resUsuarios.data);
        setGuardiasCount(resGuardias.data);
      } catch {
        // Manejar error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cuando cambia el filtro por condominio, recarga usuarios pendientes con filtro
  const fetchUsuariosPendientes = async (condominioId?: string | null) => {
    setLoading(true);
    try {
      let url = "/admin/usuarios-pendientes";
      if (condominioId) {
        url += `?condominioId=${condominioId}`;
      }
      const res = await api.get(url);
      setUsuariosPendientes(res.data);
    } catch {
      message.error("Error al cargar usuarios pendientes");
    } finally {
      setLoading(false);
    }
  };

  const onCondominioChange = (value: string) => {
    setSelectedCondominio(value || null);
    fetchUsuariosPendientes(value || null);
  };

  const refrescarDashboardData = async () => {
    setLoading(true);
    try {
      const [resCondominios, resUsuarios, resGuardias] = await Promise.all([
        api.get("/admin/condominios"),
        api.get(
          "/admin/usuarios-pendientes" +
            (selectedCondominio ? `?condominioId=${selectedCondominio}` : "")
        ),
        api.get("/admin/guardias-count"),
      ]);
      setCondominios(resCondominios.data);
      setUsuariosPendientes(resUsuarios.data);
      setGuardiasCount(resGuardias.data);
    } catch (error) {
      message.error("Error actualizando el dashboard");
    } finally {
      setLoading(false);
    }
  };

  const aprobarUsuario = async (userId: string) => {
    try {
      await api.put(`/admin/usuarios/${userId}/aprobar`, { aprobar: true });
      message.success("Usuario aprobado correctamente");
      await refrescarDashboardData();
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

      {/* Conteo de guardias */}
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

      {/* Filtro por condominio para usuarios pendientes */}
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filtrar usuarios pendientes por condominio"
          allowClear
          style={{ width: 300 }}
          onChange={onCondominioChange}
          value={selectedCondominio || undefined}
        >
          {condominios.map((c) => (
            <Select.Option key={c._id} value={c._id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      </div>

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
