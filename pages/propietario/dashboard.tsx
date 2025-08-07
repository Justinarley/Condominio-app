import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  UserOutlined,
  ApartmentOutlined,
  HomeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DashboardPropietariosIndex() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [visibleModal, setVisibleModal] = useState(false);
  const [loadingPago, setLoadingPago] = useState(false);
  const [tipoPago, setTipoPago] = useState<"efectivo" | "transferencia">(
    "efectivo"
  );
  const [estadoPago, setEstadoPago] = useState<string>("pendiente"); // estado de la alícuota

  // Carga inicial de datos y estado pago
  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardRes = await api.get("/usuarios/dashboard-propietario");
        setData(dashboardRes.data);

        // Después que cargamos el dashboard, también cargamos estado de pago
        const pagosRes = await api.get("/usuarios/pagos-alicuota");
        // asumimos que pagosRes.data es un arreglo de pagos, tomamos el último o filtramos el más reciente pendiente
        // Si hay varios pagos, quizás el más reciente es el que importa:
        if (Array.isArray(pagosRes.data) && pagosRes.data.length > 0) {
          // Buscamos el pago del mes actual, o tomamos el último pago
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ultimoPago = pagosRes.data.reduce((prev: any, curr: any) =>
            new Date(curr.fechaPago) > new Date(prev.fechaPago) ? curr : prev
          );
          setEstadoPago(ultimoPago.estado || "pendiente");
        } else {
          setEstadoPago("pendiente");
        }
      } catch (error) {
        message.error("Error al cargar datos del usuario o pagos");
      }
    }
    fetchData();
  }, []);

  if (!data) return <div className="p-8">Cargando datos...</div>;

  const alicuota = data.departamento.alicuota || 0;
  const ultimoGasto = data.condominio.gastosMensuales.at(-1);
  const totalAPagar = alicuota * (ultimoGasto?.montoTotal || 0);

  const handlePagar = async () => {
    setLoadingPago(true);
    try {
      await api.post("/pagos-alicuota", {
        departamento: data.departamento._id,
        pagadoPor: data.usuario._id,
        montoPagado: totalAPagar,
        mes: ultimoGasto?.mes,
        tipoPago,
      });

      if (tipoPago === "transferencia") {
        message.success(
          "Solicitud enviada exitosamente. Por favor, envía la foto de la transferencia al administrador como respaldo."
        );
      } else {
        message.success("Solicitud de pago enviada exitosamente.");
      }

      setVisibleModal(false);

      // Actualizar estado de pago luego de hacer solicitud
      const pagosRes = await api.get("/usuarios/pagos-alicuota");
      if (Array.isArray(pagosRes.data) && pagosRes.data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ultimoPago = pagosRes.data.reduce((prev: any, curr: any) =>
          new Date(curr.fechaPago) > new Date(prev.fechaPago) ? curr : prev
        );
        setEstadoPago(ultimoPago.estado || "pendiente");
      } else {
        setEstadoPago("pendiente");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      const backendMsg = err?.response?.data?.message;

      if (backendMsg) {
        message.error(backendMsg); // muestra el mensaje del backend
      } else {
        message.error("Error al registrar el pago");
      }
    } finally {
      setLoadingPago(false);
    }
  };

  // Función para obtener el color del Tag según estado
  const colorEstado = (estado: string) => {
    switch (estado) {
      case "pagado":
        return "green";
      case "rechazado":
        return "red";
      case "pendiente":
      default:
        return "orange";
    }
  };

  return (
    <div className="pt-14 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">
      <Title level={2} className="!text-gray-800 mb-10 mt-8">
        Panel del Usuario
      </Title>

      {/* ... (los cards para usuario, condominio, etc, igual que antes) */}

      <Row gutter={[20, 20]} className="mb-12">
        {/* Usuario */}
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl shadow-md hover:shadow-lg transition duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full text-xl bg-blue-100 text-blue-500">
                <UserOutlined />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold text-gray-800">
                  {data.usuario.name}
                </div>
                <div className="text-gray-500">{data.usuario.email}</div>
              </div>
            </div>
          </Card>
        </Col>
        {/* Condominio */}
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl shadow-md hover:shadow-lg transition duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full text-xl bg-green-100 text-green-600">
                <ApartmentOutlined />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold text-gray-800">
                  {data.condominio.name}
                </div>
                <div className="text-gray-500">{data.condominio.address}</div>
              </div>
            </div>
          </Card>
        </Col>
        {/* Departamento */}
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl shadow-md hover:shadow-lg transition duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full text-xl bg-purple-100 text-purple-600">
                <HomeOutlined />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold text-gray-800">
                  {data.departamento.nombre}
                </div>
                <div className="text-gray-500">{`Grupo: ${data.departamento.grupo}`}</div>
              </div>
            </div>
          </Card>
        </Col>
        {/* Solicitudes */}
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl shadow-md hover:shadow-lg transition duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full text-xl bg-yellow-100 text-yellow-600">
                <FileTextOutlined />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold text-gray-800">
                  {data.solicitudes}
                </div>
                <div className="text-gray-500">Totales realizadas</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Alícuota a pagar y estado */}
      <Card className="rounded-xl shadow-md mb-12">
        <Title level={4} className="text-gray-800 mb-6">
          Alícuota a Pagar
        </Title>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <div className="text-gray-600 text-sm mb-1">
              Tu alícuota asignada
            </div>
            <div className="text-xl font-semibold text-blue-600">
              {(alicuota * 100).toFixed(2)}%
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div className="text-gray-600 text-sm mb-1">
              Gasto del mes ({ultimoGasto?.mes || "No disponible"})
            </div>
            <div className="text-xl font-semibold text-green-600">
              ${ultimoGasto?.montoTotal?.toFixed(2) || "0.00"}
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div className="text-gray-600 text-sm mb-1">Total a pagar</div>
            <div className="text-xl font-semibold text-red-600">
              ${totalAPagar.toFixed(2)}
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div className="text-gray-600 text-sm mb-1">
              Estado de la alícuota
            </div>
            <Tag
              color={colorEstado(estadoPago)}
              style={{ fontWeight: "bold", fontSize: 14 }}
            >
              {estadoPago.toUpperCase()}
            </Tag>
          </Col>
        </Row>

        <Button
          type="primary"
          size="large"
          className="mt-6"
          onClick={() => setVisibleModal(true)}
          disabled={estadoPago === "pagado"}
        >
          Pagar alícuota
        </Button>
      </Card>

      {/* Información del administrador */}
      <Card className="rounded-xl shadow-md">
        <Title level={4} className="text-gray-800 mb-6">
          Administrador del Condominio
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Nombre:</Text>
            <div>{data.administrador.name}</div>
          </Col>
          <Col span={8}>
            <Text strong>Email:</Text>
            <div>{data.administrador.email}</div>
          </Col>
          <Col span={8}>
            <Text strong>Teléfono:</Text>
            <div>{data.administrador.phone}</div>
          </Col>
        </Row>
      </Card>

      {/* Modal de pago */}
      <Modal
        title="Confirmar pago de alícuota"
        open={visibleModal}
        onCancel={() => setVisibleModal(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handlePagar}>
          <Form.Item label="Monto a pagar">
            <Input value={`$${totalAPagar.toFixed(2)}`} disabled />
          </Form.Item>

          <Form.Item label="Mes">
            <Input value={ultimoGasto?.mes || ""} disabled />
          </Form.Item>

          <Form.Item label="Tipo de pago" required>
            <Select
              value={tipoPago}
              onChange={(val) => setTipoPago(val)}
              options={[
                { value: "efectivo", label: "Efectivo" },
                { value: "transferencia", label: "Transferencia" },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingPago}
              block
            >
              Confirmar pago
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
