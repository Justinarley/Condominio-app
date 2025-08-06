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
  DatePicker,
  message,
} from "antd";
import { HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type AreaComun = {
  nombre: string;
  estado: "libre" | "ocupado";
  descripcion?: string;
  capacidad?: number;
};

export default function AreaComunalIndex() {
  const [areas, setAreas] = useState<AreaComun[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaComun | null>(null);

  // Para formulario reserva
  const [form] = Form.useForm();

  useEffect(() => {
    async function fetchAreas() {
      setLoading(true);
      try {
        const res = await api.get("/usuarios/areas-comunes");
        setAreas(res.data);
      } catch (error) {
        message.error("Error al cargar áreas comunes");
      } finally {
        setLoading(false);
      }
    }
    fetchAreas();
  }, []);

  const openReservaModal = (area: AreaComun) => {
    setSelectedArea(area);
    form.resetFields();
    setModalVisible(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleReservaSubmit = async (values: any) => {
    if (!selectedArea) return;
    try {
      await api.post("/usuarios/reservar-area", {
        nombreArea: selectedArea.nombre,
        fechaInicio: values.rango[0].toISOString(),
        fechaFin: values.rango[1].toISOString(),
      });
      message.success("Solicitud enviada con éxito");
      setModalVisible(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Error al enviar la solicitud";
      message.error(msg);
    }
  };

  return (
    <div className="pt-14 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">
      <Title level={2} className="!text-gray-800 mb-10 mt-8">
        Áreas Comunes
      </Title>

      <Row gutter={[20, 20]}>
        {areas.map((area) => (
          <Col xs={24} sm={12} md={8} key={area.nombre}>
            <Card
              className="rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
              onClick={() => openReservaModal(area)}
              title={
                <div className="flex items-center gap-2">
                  <HomeOutlined className="text-blue-500" />
                  <Text strong>{area.nombre}</Text>
                </div>
              }
              extra={
                area.estado === "libre" ? (
                  <Tag color="green">Libre</Tag>
                ) : (
                  <Tag color="red">Ocupado</Tag>
                )
              }
            >
              <Text>{area.descripcion || "Sin descripción"}</Text>
              <br />
              <Text type="secondary">
                Capacidad: {area.capacidad ?? "N/A"}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`Reservar área: ${selectedArea?.nombre}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReservaSubmit}
          initialValues={{ rango: [] }}
        >
          <Form.Item
            label="Rango de fechas y horas"
            name="rango"
            rules={[{ required: true, message: "Selecciona el rango" }]}
          >
            <RangePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Enviar solicitud
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
