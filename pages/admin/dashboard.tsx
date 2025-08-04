import { useEffect, useState } from "react";
import api from "@/libs/axios";
import { Card, Statistic, Table, Tag, Tooltip } from "antd";
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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard - Admin</h1>

      {/* Layout de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Tarjeta grande de Condominio */}
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

        {/* Columna de Guardias (vertical stack) */}
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

      {/* Tabla de Usuarios Pendientes */}
      <Card
        title={<span className="text-lg font-semibold text-gray-700">Usuarios Inactivos Pendientes</span>}
        loading={loading}
        className="rounded-xl shadow-md"
      >
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
