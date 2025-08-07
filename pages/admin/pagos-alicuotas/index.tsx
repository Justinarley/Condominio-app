import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Card,
  Typography,
  Table,
  Tag,
  message,
  Button,
  Space,
  Tooltip,
} from "antd";
import { CheckOutlined, CloseOutlined, SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

type Pago = {
  _id: string;
  departamento:
    | {
        codigo?: string;
        nombre?: string;
        condominio?: { name?: string };
      }
    | string;
  pagadoPor: { name?: string; email?: string } | null;
  fechaPago: string;
  montoPagado: number;
  mes: string;
  tipoPago: string;
  estado: "pendiente" | "pagado" | "rechazado";
};

export default function PagosAlicuotaIndex() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pagos-todos");
      setPagos(res.data);
    } catch (error) {
      message.error("Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const actualizarEstado = async (
    pagoId: string,
    estado: "pagado" | "rechazado"
  ) => {
    setUpdatingId(pagoId);
    try {
      await api.put(`/admin/pagos/${pagoId}/estado`, { estado });
      message.success(
        `Pago ${estado === "pagado" ? "aprobado" : "rechazado"} correctamente`
      );
      // Refrescar la lista para reflejar cambios
      await fetchPagos();
    } catch (error) {
      message.error("Error al actualizar el estado del pago");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: "Departamento",
      dataIndex: "departamento",
      key: "departamento",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (departamento: any) =>
        `${departamento?.nombre || ""} (${departamento?.codigo || ""}) - ${
          departamento?.condominio?.name || ""
        }`,
    },
    {
      title: "Pagado Por",
      dataIndex: "pagadoPor",
      key: "pagadoPor",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (pagadoPor: any) =>
        pagadoPor
          ? `${pagadoPor.name || ""} (${pagadoPor.email || ""})`
          : "Sin información",
    },
    {
      title: "Fecha de Pago",
      dataIndex: "fechaPago",
      key: "fechaPago",
      render: (fecha: string) => dayjs(fecha).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Monto Pagado",
      dataIndex: "montoPagado",
      key: "montoPagado",
      render: (monto: number) => `$${monto.toFixed(2)}`,
    },
    {
      title: "Mes",
      dataIndex: "mes",
      key: "mes",
      render: (mes: string) => mes.charAt(0).toUpperCase() + mes.slice(1),
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
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado: string) => {
        let color = "gray";
        if (estado === "pagado") color = "green";
        else if (estado === "pendiente") color = "orange";
        else if (estado === "rechazado") color = "red";
        return <Tag color={color}>{estado.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Pago) => (
        <Space size="middle">
          <Tooltip title="Aprobar pago">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              disabled={record.estado === "pagado" || updatingId === record._id}
              loading={updatingId === record._id}
              onClick={() => actualizarEstado(record._id, "pagado")}
            />
          </Tooltip>

          <Tooltip title="Rechazar pago">
            <Button
              danger
              icon={<CloseOutlined />}
              disabled={
                record.estado === "rechazado" || updatingId === record._id
              }
              loading={updatingId === record._id}
              onClick={() => actualizarEstado(record._id, "rechazado")}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="pt-14 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">
      <Title level={2} className="!text-gray-800 mb-10 mt-8">
        Pagos de Alícuota
      </Title>

      <Card className="rounded-xl shadow-md">
        <Table
          columns={columns}
          dataSource={pagos}
          loading={loading}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "No hay pagos registrados" }}
        />
      </Card>
    </div>
  );
}
