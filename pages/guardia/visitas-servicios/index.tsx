import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Table,
  Button,
  message,
  Typography,
  Popconfirm,
  Tag,
} from "antd";
import {
  LogoutOutlined,
  CarOutlined,
  UserOutlined,
  ToolOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function AccesosServiciosIndex() {
  const [accesos, setAccesos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [condominioId, setCondominioId] = useState<string | null>(null);

  // 1. Obtener condominioId desde dashboard-guardia
  const fetchCondominioId = async () => {
    try {
      const dashboardRes = await api.get("/usuarios/dashboard-guardia");
      const id = dashboardRes.data?.condominio?._id || null;

      if (!id) {
        message.error("No se encontró el ID del condominio en el dashboard");
        setCondominioId(null);
        setAccesos([]);
        return;
      }

      setCondominioId(id);
    } catch (error) {
      message.error("Error al obtener el condominio desde dashboard");
      setCondominioId(null);
      setAccesos([]);
    }
  };

  // 2. Obtener accesos filtrando por condominioId
  const fetchAccesos = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get("/accesos", { params: { condominioId: id } });
      setAccesos(res.data);
    } catch (error) {
      message.error("Error al cargar los accesos");
      setAccesos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Primero obtener el condominioId desde el dashboard
    fetchCondominioId();
  }, []);

  useEffect(() => {
    if (condominioId) {
      fetchAccesos(condominioId);
    }
  }, [condominioId]);

  const handleRegistrarSalida = async (id: string) => {
    try {
      await api.patch(`/accesos/${id}/salida`, {
        horaSalida: new Date(),
      });
      message.success("Salida registrada correctamente");
      if (condominioId) fetchAccesos(condominioId);
    } catch (error) {
      message.error("Error al registrar la salida");
    }
  };

  const columns = [
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (
        <Tag color={tipo === "VISITA" ? "blue" : "orange"}>
          {tipo === "VISITA" ? <UserOutlined /> : <ToolOutlined />} {tipo}
        </Tag>
      ),
    },
    {
      title: "Nombre Persona",
      dataIndex: "nombrePersona",
      key: "nombrePersona",
    },
    {
      title: "Departamento",
      dataIndex: ["departamento", "codigo"],
      key: "departamento",
      render: (_: any, record: any) =>
        record.departamento ? record.departamento.codigo : "-",
    },
    {
      title: "Placa Vehículo",
      dataIndex: ["vehiculo", "placa"],
      key: "vehiculo",
      render: (placa: string) => (placa ? <><CarOutlined /> {placa}</> : "-"),
    },
    {
      title: "Hora Entrada",
      dataIndex: "horaEntrada",
      key: "horaEntrada",
      render: (horaEntrada: string) =>
        new Date(horaEntrada).toLocaleString("es-ES"),
    },
    {
      title: "Hora Salida",
      dataIndex: "horaSalida",
      key: "horaSalida",
      render: (horaSalida: string | undefined) =>
        horaSalida ? (
          <Text type="success">{new Date(horaSalida).toLocaleString("es-ES")}</Text>
        ) : (
          <Text type="warning">Pendiente</Text>
        ),
    },
    {
      title: "Acción",
      key: "accion",
      render: (_: any, record: any) =>
        !record.horaSalida ? (
          <Popconfirm
            title="¿Confirmas registrar la salida?"
            onConfirm={() => handleRegistrarSalida(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              size="small"
              danger
            >
              Registrar salida
            </Button>
          </Popconfirm>
        ) : (
          <Text>Salida registrada</Text>
        ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded shadow">
      <Typography.Title level={3} className="mb-6">
        Accesos y Servicios
      </Typography.Title>
      <Table
        columns={columns}
        dataSource={accesos}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
