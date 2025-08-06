import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Card,
  Statistic,
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
  const [selectedCondominio, setSelectedCondominio] = useState<string | null>(null);
  const [guardiasCount, setGuardiasCount] = useState<{ activos: number; inactivos: number }>({
    activos: 0,
    inactivos: 0,
  });
  const [loading, setLoading] = useState(false);

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
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Título con espacio debajo del navbar */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-16">Dashboard - Admin</h1>

      {/* Layout de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2">
          {condominios.slice(-1).map((condominio) => (
            <Card
              key={condominio._id}
              className="rounded-xl shadow-md h-full"
              title={
                <div>
                  <div className="text-lg font-semibold">{condominio.name}</div>
                  <div className="text-xs text-gray-500">ID: {condominio.id}</div>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Statistic title="Departamentos" value={condominio.totalDepartamentos} />
                <Statistic
                  title="Propietarios Activos"
                  value={condominio.usuariosActivos}
                  valueStyle={{ color: "#16a34a" }}
                />
                <Statistic
                  title="Propietarios Inactivos"
                  value={condominio.usuariosInactivos}
                  valueStyle={{ color: "#dc2626" }}
                />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-6 h-full">
          <Card className="rounded-xl shadow-md flex-1">
            <Statistic
              title="Guardias Activos"
              value={guardiasCount.activos}
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
          <Card className="rounded-xl shadow-md flex-1">
            <Statistic
              title="Guardias Inactivos"
              value={guardiasCount.inactivos}
              valueStyle={{ color: "#dc2626" }}
            />
          </Card>
        </div>
      </div>

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
                    className="text-green-600 hover:text-green-800 cursor-pointer text-xl"
                    onClick={() => aprobarUsuario(record._id)}
                  />
                </Tooltip>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
