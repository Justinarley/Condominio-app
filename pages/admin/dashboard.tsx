import { useEffect, useState } from "react";
import api from "@/libs/axios";
import { Card, Statistic, Table, Tag, Tooltip, Select, message } from "antd";
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

type Departamento = {
  _id: string;
  codigo: string;
  nombre: string;
  condominio: Condominio;
};

type Pago = {
  _id: string;
  pagadoPor: Usuario; // Objeto Usuario completo
  departamento: Departamento; // Objeto Departamento completo
  montoPagado: number;
  mes: string;
  estado: "pendiente" | "pagado" | "rechazado";
  fechaPago: string;
  tipoPago: string;
};

export default function AdminDashboard() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [usuariosPendientes, setUsuariosPendientes] = useState<Usuario[]>([]);
  const [selectedCondominio, setSelectedCondominio] = useState<string | null>(
    null
  );
  const [guardiasCount, setGuardiasCount] = useState<{ activos: number; inactivos: number }>({
    activos: 0,
    inactivos: 0,
  });
  const [loading, setLoading] = useState(false);

  // Estado para pagos
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pagosLoading, setPagosLoading] = useState(false);

  // Carga inicial de datos
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resCondominios, resUsuarios, resGuardias, resPagos] = await Promise.all([
        api.get("/admin/condominios"),
        api.get("/admin/usuarios-pendientes"),
        api.get("/admin/guardias-count"),
        api.get("/admin/pagos-pendientes"),
      ]);
      setCondominios(resCondominios.data);
      setUsuariosPendientes(resUsuarios.data);
      setGuardiasCount(resGuardias.data);
      setPagos(resPagos.data);
    } catch (error) {
      message.error("Error cargando datos del dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios pendientes por condominio
  const fetchUsuariosPendientes = async (condominioId?: string | null) => {
    setLoading(true);
    try {
      let url = "/admin/usuarios-pendientes";
      if (condominioId) url += `?condominioId=${condominioId}`;
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

  // Aprobar usuario
  const aprobarUsuario = async (userId: string) => {
    try {
      await api.put(`/admin/usuarios/${userId}/aprobar`, { aprobar: true });
      message.success("Usuario aprobado correctamente");
      await fetchDashboardData();
    } catch (error) {
      message.error("Error aprobando usuario");
      console.error(error);
    }
  };

  // Cambiar estado de pago (aprobar/rechazar)
  const cambiarEstadoPago = async (
    pagoId: string,
    nuevoEstado: "pagado" | "rechazado"
  ) => {
    setPagosLoading(true);
    try {
      await api.put(`/admin/pagos/${pagoId}/estado`, { estado: nuevoEstado });
      message.success(`Pago ${nuevoEstado === "pagado" ? "aprobado" : "rechazado"} correctamente`);
      // Refrescar solo los pagos para mejor performance
      const res = await api.get("/admin/pagos-pendientes");
      setPagos(res.data);
    } catch (error) {
      message.error("Error actualizando estado de pago");
      console.error(error);
    } finally {
      setPagosLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-16">Dashboard - Admin</h1>

      {/* Tarjetas resumen */}
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

      {/* Filtro de usuarios pendientes */}
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
      <Card title="Usuarios pendientes por aprobar" loading={loading}>
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

      {/* Tabla pagos pendientes */}
      <Card title="Pagos por aprobar" loading={pagosLoading} className="mt-10 rounded-xl shadow-md">
        <Table
          dataSource={pagos}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "Usuario",
              dataIndex: ["pagadoPor", "name"],
              key: "usuario",
              render: (name: string, record: Pago) => <span>{name || record.pagadoPor?._id || "N/A"}</span>,
            },
            {
              title: "Departamento",
              key: "departamento",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              render: (_: any, record: Pago) => (
                <span>
                  {record.departamento?.codigo} - {record.departamento?.nombre}
                </span>
              ),
            },
            {
              title: "Condominio",
              key: "condominio",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              render: (_: any, record: Pago) => <span>{record.departamento?.condominio?.name || "N/A"}</span>,
            },
            {
              title: "Tipo de Pago",
              dataIndex: "tipoPago",
              key: "tipoPago",
              render: (tipoPago: string) => (
                <Tag color="blue" style={{ textTransform: "capitalize" }}>
                  {tipoPago}
                </Tag>
              ),
            },
            {
              title: "Monto",
              dataIndex: "montoPagado",
              key: "montoPagado",
              render: (montoPagado: number) => `$${montoPagado.toFixed(2)}`,
            },
            {
              title: "Mes",
              dataIndex: "mes",
              key: "mes",
            },
            {
              title: "Estado",
              dataIndex: "estado",
              key: "estado",
              render: (estado: string) => {
                let color = "default";
                if (estado === "pendiente") color = "orange";
                if (estado === "pagado") color = "green";
                if (estado === "rechazado") color = "red";
                return <Tag color={color}>{estado.toUpperCase()}</Tag>;
              },
            },
            {
              title: "Acciones",
              key: "acciones",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              render: (_: any, record: Pago) => {
                if (record.estado !== "pendiente") return null;

                return (
                  <div className="flex gap-2">
                    <Tag
                      color="green"
                      className="cursor-pointer"
                      onClick={() => cambiarEstadoPago(record._id, "pagado")}
                    >
                      Aprobar
                    </Tag>
                    <Tag
                      color="red"
                      className="cursor-pointer"
                      onClick={() => cambiarEstadoPago(record._id, "rechazado")}
                    >
                      Rechazar
                    </Tag>
                  </div>
                );
              },
            },
          ]}
        />
      </Card>
    </div>
  );
}
