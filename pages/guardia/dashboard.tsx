import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Divider,
  Statistic,
  Tag,
  Table,
} from "antd";
import {
  UserOutlined,
  ApartmentOutlined,
  HomeOutlined,
  TeamOutlined,
  CarOutlined,
  FormOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DashboardGuardiaIndex() {
  const [data, setData] = useState<any>(null);
  const [visibleModal, setVisibleModal] = useState(false);
  const [loadingAcceso, setLoadingAcceso] = useState(false);
  const [form] = Form.useForm();
  const [tipoAcceso, setTipoAcceso] = useState<"VISITA" | "SERVICIO">("VISITA");
  const [accesosRegistrados, setAccesosRegistrados] = useState<number>(0);
  const [vehiculosRegistrados, setVehiculosRegistrados] = useState<number>(0);

  // Estados para modal vehículos
  const [visibleVehiculosModal, setVisibleVehiculosModal] = useState(false);
  const [vehiculosDentro, setVehiculosDentro] = useState<any[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);

  // Carga inicial de datos del dashboard
  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardRes = await api.get("/usuarios/dashboard-guardia");
        setData(dashboardRes.data);
      } catch (error) {
        message.error("Error al cargar datos del condominio");
      }
    }
    fetchData();
  }, []);

  // Carga conteo de accesos y vehículos cuando data está lista
  useEffect(() => {
    async function fetchConteo() {
      if (!data?.condominio?._id) return;
      try {
        const res = await api.get("/accesos/conteo", {
          params: { condominioId: data.condominio._id },
        });
        setAccesosRegistrados(res.data.totalAccesos);
        setVehiculosRegistrados(res.data.totalVehiculos);
      } catch (error) {
        message.error("Error al obtener conteo de accesos y vehículos");
      }
    }
    fetchConteo();
  }, [data?.condominio?._id]);

  // Función para cargar vehículos dentro del condominio
  async function cargarVehiculosDentro() {
    if (!data?.condominio?._id) return;
    setLoadingVehiculos(true);
    try {
      const res = await api.get("/accesos/vehiculos", {
        params: { condominioId: data.condominio._id },
      });
      setVehiculosDentro(res.data);
      setVisibleVehiculosModal(true);
    } catch (error) {
      message.error("Error al cargar vehículos dentro del condominio");
    } finally {
      setLoadingVehiculos(false);
    }
  }

  if (!data) return <div className="p-8">Cargando datos...</div>;

  // Calcular departamentos ocupados y disponibles
  const departamentosOcupados = data.departamentos.filter(
    (depto: any) => depto.estado === "ocupado"
  ).length;
  const departamentosDisponibles = data.departamentos.filter(
    (depto: any) => depto.estado === "disponible"
  ).length;

  const handleRegistrarAcceso = async (values: any) => {
    setLoadingAcceso(true);
    try {
      await api.post("/accesos", {
        ...values,
        condominio: data.condominio._id,
        guardia: data.usuario._id,
        horaEntrada: new Date(),
      });

      message.success("Acceso registrado exitosamente");
      form.resetFields();
      setVisibleModal(false);

      // Actualizar conteo tras registrar nuevo acceso
      const res = await api.get("/accesos/conteo", {
        params: { condominioId: data.condominio._id },
      });
      setAccesosRegistrados(res.data.totalAccesos);
      setVehiculosRegistrados(res.data.totalVehiculos);
    } catch (err: any) {
      console.error(err);
      const backendMsg = err?.response?.data?.message;
      message.error(backendMsg || "Error al registrar el acceso");
    } finally {
      setLoadingAcceso(false);
    }
  };

  // Columnas para tabla vehículos dentro
  const columnasVehiculos = [
    {
      title: "Placa",
      dataIndex: ["vehiculo", "placa"],
      key: "placa",
    },
    {
      title: "Color",
      dataIndex: ["vehiculo", "color"],
      key: "color",
    },
    {
      title: "Modelo",
      dataIndex: ["vehiculo", "modelo"],
      key: "modelo",
    },
    {
      title: "Persona",
      dataIndex: "nombrePersona",
      key: "nombrePersona",
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
    },
    {
      title: "Hora Entrada",
      dataIndex: "horaEntrada",
      key: "horaEntrada",
      render: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <div className="pt-14 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">
      <Title level={2} className="!text-gray-800 mb-10 mt-8">
        Panel de Control - Guardia
      </Title>

      {/* Estadísticas */}
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
        {/* Departamentos */}
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl shadow-md hover:shadow-lg transition duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full text-xl bg-purple-100 text-purple-600">
                <HomeOutlined />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold text-gray-800">
                  Departamentos
                </div>
                <div className="flex gap-2 mt-2">
                  <Tag color="green">{departamentosOcupados} Ocupados</Tag>
                  <Tag color="blue">{departamentosDisponibles} Disponibles</Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sección de acciones */}
      <Row gutter={[20, 20]} className="mb-12">
        <Col span={24}>
          <Card className="rounded-xl shadow-md">
            <Title level={4} className="text-gray-800 mb-6">
              Registrar Acceso
            </Title>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Statistic
                  title="Accesos hoy"
                  value={accesosRegistrados}
                  prefix={<TeamOutlined />}
                  className="mb-4"
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<FormOutlined />}
                  onClick={() => setVisibleModal(true)}
                >
                  Registrar nuevo acceso
                </Button>
              </div>
              <div className="flex-1">
                <Statistic
                  title="Vehículos registrados hoy"
                  value={vehiculosRegistrados}
                  prefix={<CarOutlined />}
                  className="mb-4"
                />
                <Button
                  size="large"
                  icon={<CarOutlined />}
                  onClick={cargarVehiculosDentro}
                >
                  Ver vehículos en condominio
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Información del administrador */}
      <Card className="rounded-xl shadow-md">
        <Title level={4} className="text-gray-800 mb-6">
          Administrador del Condominio
        </Title>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Text strong>Nombre:</Text>
            <div>{data.administrador.name}</div>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Email:</Text>
            <div>{data.administrador.email}</div>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Teléfono:</Text>
            <div>{data.administrador.phone}</div>
          </Col>
        </Row>
      </Card>

      {/* Modal para registrar acceso */}
      <Modal
        title="Registrar nuevo acceso"
        open={visibleModal}
        onCancel={() => {
          form.resetFields();
          setVisibleModal(false);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegistrarAcceso}
          initialValues={{ tipo: "VISITA" }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="tipo"
                label="Tipo de acceso"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: "VISITA", label: "Visita" },
                    { value: "SERVICIO", label: "Servicio" },
                  ]}
                  onChange={(val) => setTipoAcceso(val)}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="nombrePersona"
                label="Nombre completo"
                rules={[{ required: true, message: "Ingrese el nombre" }]}
              >
                <Input placeholder="Nombre de la persona" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="departamento"
                label="Departamento a visitar"
                rules={[{ required: true, message: "Seleccione departamento" }]}
              >
                <Select
                  placeholder="Seleccione departamento"
                  options={data.departamentos.map((d: any) => ({
                    value: d._id,
                    label: `${d.codigo} - ${d.nombre}`,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name={["identificacion", "tipo"]}
                label="Tipo de identificación"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: "CEDULA", label: "Cédula" },
                    { value: "RUC", label: "RUC" },
                    { value: "PASAPORTE", label: "Pasaporte" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name={["identificacion", "numero"]}
                label="Número de identificación"
                rules={[{ required: true, message: "Ingrese el número" }]}
              >
                <Input placeholder="Número de identificación" />
              </Form.Item>
            </Col>

            {tipoAcceso === "SERVICIO" && (
              <Col span={24}>
                <Form.Item
                  name="descripcionServicio"
                  label="Descripción del servicio"
                  rules={[
                    { required: true, message: "Ingrese la descripción" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Descripción del servicio a realizar"
                  />
                </Form.Item>
              </Col>
            )}

            <Divider orientation="left">
              Información de vehículo (opcional)
            </Divider>

            <Col span={8}>
              <Form.Item name={["vehiculo", "placa"]} label="Placa">
                <Input placeholder="Placa del vehículo" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name={["vehiculo", "color"]} label="Color">
                <Input placeholder="Color del vehículo" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name={["vehiculo", "modelo"]} label="Modelo">
                <Input placeholder="Modelo del vehículo" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingAcceso}
                  block
                  size="large"
                >
                  Registrar acceso
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Vehículos dentro del condominio"
        open={visibleVehiculosModal}
        onCancel={() => setVisibleVehiculosModal(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={columnasVehiculos}
          dataSource={vehiculosDentro}
          rowKey={(record) => record._id}
          loading={loadingVehiculos}
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  );
}
