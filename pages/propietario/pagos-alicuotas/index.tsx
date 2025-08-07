import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  message,
  Button,
  Modal,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

type Pago = {
  _id: string;
  departamento: string | { nombre?: string }; // depende cómo venga
  fechaPago: string;
  montoPagado: number;
  tipoPago: string;
  mes: string;
  estado: "pendiente" | "pagado" | "rechazado";
};

export default function PagosAlicuotaIndex() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPagos() {
      setLoading(true);
      try {
        const res = await api.get("/usuarios/pagos-alicuota");
        setPagos(res.data);
      } catch (error) {
        message.error("Error al cargar los pagos");
      } finally {
        setLoading(false);
      }
    }
    fetchPagos();
  }, []);

  // Función para simular descarga de PDF (puedes reemplazar con lógica real)
  const handleDownloadPdf = (pagoId: string) => {
    // Aquí puedes llamar a la API para obtener el PDF o abrir una URL
    message.info(`Descargando PDF del pago ${pagoId}`);
    // Ejemplo: window.open(`/pagos/${pagoId}/pdf`, '_blank');
  };

  const columns = [
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
      title: "Monto Pagado",
      dataIndex: "montoPagado",
      key: "montoPagado",
      render: (monto: number) => `$${monto.toFixed(2)}`,
    },
    {
      title: "Fecha de Pago",
      dataIndex: "fechaPago",
      key: "fechaPago",
      render: (fecha: string) => dayjs(fecha).format("DD/MM/YYYY HH:mm"),
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
        <Button
          type="link"
          icon={<FilePdfOutlined />}
          disabled={record.estado !== "pagado"}
          onClick={() => handleDownloadPdf(record._id)}
          title={
            record.estado === "pagado" ? "Descargar PDF" : "Pago no completado"
          }
        />
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
