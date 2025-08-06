import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Input,
  Modal,
  Card,
  Select,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import api from "@/libs/axios";
import { ModalReporte } from "@/pages/components/Reportes";

type SolicitudReserva = {
  condominioId: string;
  nombreCondominio: string;
  nombreArea: string;
  descripcionArea?: string;
  capacidadArea?: number;
  solicitudId: string;
  usuarioId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "pendiente" | "aprobada" | "rechazada";
};

type Condominio = {
  _id: string;
  id: string;
  name: string;
  areasComunes?: {
    nombre: string;
    estado: string;
    capacidad?: number;
    descripcion?: string;
  }[];
};

export default function SolicitudesReserva() {
  const [solicitudes, setSolicitudes] = useState<SolicitudReserva[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudReserva | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [selectedCondominio, setSelectedCondominio] = useState<string | null>(null);

  const fetchSolicitudes = async (condominioId?: string | null) => {
    setLoading(true);
    try {
      let url = "/admin/solicitudes-reserva";
      if (condominioId) {
        url += `?condominioId=${condominioId}`;
      }
      const res = await api.get(url);
      setSolicitudes(res.data);
    } catch (error) {
      message.error("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCondominios = async () => {
    try {
      const res = await api.get("/admin/condominios");
      setCondominios(res.data);
    } catch (error) {
      message.error("Error al cargar condominios");
    }
  };

  useEffect(() => {
    fetchCondominios();
  }, []);

  useEffect(() => {
    fetchSolicitudes(selectedCondominio);
  }, [selectedCondominio]);

  const aprobarSolicitud = async (sol: SolicitudReserva) => {
    try {
      await api.put(
        `/admin/solicitudes-reserva/${sol.condominioId}/${sol.solicitudId}`,
        { aprobar: true }
      );
      message.success("Solicitud aprobada");
      fetchSolicitudes(selectedCondominio);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al aprobar solicitud";
      message.error(msg);
    }
  };

  const abrirModalRechazo = (sol: SolicitudReserva) => {
    setSelectedSolicitud(sol);
    setMotivoRechazo("");
    setModalVisible(true);
  };

  const enviarRechazo = async () => {
    if (!selectedSolicitud) return;

    if (!motivoRechazo.trim()) {
      message.error("Debe ingresar un motivo de rechazo");
      return;
    }

    try {
      await api.put(
        `/admin/solicitudes-reserva/${selectedSolicitud.condominioId}/${selectedSolicitud.solicitudId}`,
        { aprobar: false, motivoRechazo }
      );
      message.success("Solicitud rechazada");
      setModalVisible(false);
      fetchSolicitudes(selectedCondominio);
    } catch {
      message.error("Error al rechazar solicitud");
    }
  };

  const columns = [
    {
      title: "Condominio",
      dataIndex: "nombreCondominio",
      key: "nombreCondominio",
    },
    {
      title: "Área Común",
      dataIndex: "nombreArea",
      key: "nombreArea",
    },
    {
      title: "Descripción",
      dataIndex: "descripcionArea",
      key: "descripcionArea",
      render: (text: string) => text || "-",
    },
    {
      title: "Capacidad",
      dataIndex: "capacidadArea",
      key: "capacidadArea",
      render: (num: number) => num || "-",
    },
    {
      title: "Fecha Inicio",
      dataIndex: "fechaInicio",
      key: "fechaInicio",
      render: (fecha: string) =>
        new Date(fecha).toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      title: "Fecha Fin",
      dataIndex: "fechaFin",
      key: "fechaFin",
      render: (fecha: string) =>
        new Date(fecha).toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado: string) => {
        let color = "default";
        if (estado === "pendiente") color = "orange";
        else if (estado === "aprobada") color = "green";
        else if (estado === "rechazada") color = "red";
        return <Tag color={color}>{estado.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, sol: SolicitudReserva) => {
        if (sol.estado !== "pendiente") return <Tag>Solicitud gestionada</Tag>;

        return (
          <Space>
            <Popconfirm
              title="¿Confirmar aprobación de esta solicitud?"
              onConfirm={() => aprobarSolicitud(sol)}
              okText="Sí"
              cancelText="No"
            >
              <Button type="primary" icon={<CheckOutlined />}>
                Aprobar
              </Button>
            </Popconfirm>

            <Button
              type="default"
              icon={<CloseOutlined />}
              onClick={() => abrirModalRechazo(sol)}
              danger
            >
              Rechazar
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Separación para que no quede debajo del navbar */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800 mt-16">Áreas Comunales</h1>

      {/* Filtro por condominio */}
      <div className="mb-4">
        <Select
          placeholder="Filtrar por condominio"
          allowClear
          style={{ width: 300 }}
          onChange={(val) => setSelectedCondominio(val || null)}
          value={selectedCondominio || undefined}
        >
          {condominios.map((condo) => (
            <Select.Option key={condo._id} value={condo._id}>
              {condo.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Carrusel de tarjetas blancas con sombra */}
      <div className="mb-6 overflow-x-auto whitespace-nowrap flex gap-4">
        {condominios.map((condo) => (
          <Card
            key={condo._id}
            title={
              <div>
                <p className="font-bold">{condo.name}</p>
                <p className="text-xs text-gray-600">ID: {condo.id}</p>
              </div>
            }
            className="min-w-[300px] rounded-lg shadow-md bg-white"
            headStyle={{ backgroundColor: "white" }}
            bodyStyle={{ padding: "12px" }}
          >
            {(condo.areasComunes ?? []).length > 0 ? (
              (condo.areasComunes ?? []).map((area, index) => (
                <div key={index} className="mb-2">
                  <p className="text-sm font-semibold">{area.nombre}</p>
                  <p className="text-xs text-gray-700">{area.estado}</p>
                  <p className="text-xs text-gray-700">
                    Capacidad: {area.capacidad || "N/A"}
                  </p>
                  <p className="text-xs text-gray-700">
                    {area.descripcion || "Sin descripción"}
                  </p>
                  <hr className="my-1 border-gray-300" />
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No hay áreas comunales</p>
            )}
          </Card>
        ))}
      </div>

      {/* Reporte */}
      <div className="mb-4 flex justify-end gap-2">
        <Button onClick={() => setVisible(true)}>Reporte</Button>
        <ModalReporte
          open={visible}
          onClose={() => setVisible(false)}
          endpoint="/reportes/propietarios/excel"
        />
      </div>

      {/* Tabla de solicitudes con fondo celeste claro */}
      <Card className="shadow-sm border border-gray-200 rounded-md">
        <Table
          dataSource={solicitudes}
          columns={columns}
          rowKey="solicitudId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="bg-[#e6f0ff] rounded-md"
        />
      </Card>

      {/* Modal de rechazo */}
      <Modal
        title="Motivo de rechazo"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={enviarRechazo}
        okText="Enviar rechazo"
        cancelText="Cancelar"
      >
        <Input.TextArea
          rows={4}
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
          placeholder="Ingrese el motivo de rechazo"
        />
      </Modal>
    </div>
  );
}
