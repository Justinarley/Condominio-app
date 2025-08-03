import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Form,
  Input,
  Button,
  Select,
  Space,
  InputNumber,
  Divider,
  message,
  Card,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import api from "@/libs/axios";

const { Option } = Select;

interface Torre {
  identificador: string;
  departamentos: number;
}

interface Casa {
  identificador: string;
  cantidad: number;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
}

interface CondominioFormValues {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  tipo: "torres" | "casas";
  adminId: string;
  torres?: Torre[];
  casas?: Casa[];
}

const CondominioFormPage: React.FC = () => {
  const [form] = Form.useForm<CondominioFormValues>();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tipo, setTipo] = useState<"torres" | "casas">("torres");
  const [admins, setAdmins] = useState<Admin[]>([]);

  useEffect(() => {
    api.get<Admin[]>("/admins").then((res) => {
      setAdmins(res.data);
    });

    if (id && typeof id === "string") {
      setIsEditing(true);
      setLoading(true);
      api
        .get(`/condominios/${id}`)
        .then((res) => {
          const condominio = res.data as CondominioFormValues & {
            adminId: { _id: string };
          };
          setTipo(condominio.tipo);
          form.setFieldsValue({
            ...condominio,
            adminId: condominio.adminId._id,
          });
        })
        .catch(() => {
          message.error("Error cargando condominio");
        })
        .finally(() => setLoading(false));
    } else {
      setIsEditing(false);
      form.resetFields();
    }
  }, [id, form]);

  const onFinish = async (values: CondominioFormValues) => {
    setLoading(true);
    try {
      if (isEditing && typeof id === "string") {
        await api.put(`/condominios/${id}`, values);
        message.success("Condominio actualizado");
      } else {
        await api.post("/condominios", values);
        message.success("Condominio creado");
      }
      router.push("/superadmin/condominios");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Error al guardar condominio"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-10 text-center tracking-wide">
          {isEditing ? "Editar Condominio" : "Crear Condominio"}
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loading}
          className="space-y-8"
          requiredMark={false}
        >
          {/* Grid con 2 columnas para la mayoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* ID */}
            <Form.Item
              label={<span className="font-medium text-gray-600">ID personalizado (Ej: CND-001)</span>}
              name="id"
              rules={[
                { required: true, message: "Por favor ingresa el ID" },
                {
                  pattern: /^CND-\d{3}$/,
                  message: "Formato inválido. Usa CND-001, etc.",
                },
              ]}
            >
              <Input
                disabled={isEditing}
                placeholder="CND-001"
                className="rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
              />
            </Form.Item>

            {/* Nombre */}
            <Form.Item
              label={<span className="font-medium text-gray-600">Nombre</span>}
              name="name"
              rules={[{ required: true, message: "Ingresa el nombre" }]}
            >
              <Input
                placeholder="Nombre del condominio"
                className="rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
              />
            </Form.Item>

            {/* Dirección */}
            <Form.Item
              label={<span className="font-medium text-gray-600">Dirección</span>}
              name="address"
              rules={[{ required: true, message: "Ingresa la dirección" }]}
            >
              <Input
                placeholder="Ciudad, Calle, Nº"
                className="rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label={<span className="font-medium text-gray-600">Email</span>}
              name="email"
              rules={[
                { required: true, message: "Ingresa el email" },
                { type: "email", message: "Email inválido" },
              ]}
            >
              <Input
                placeholder="ejemplo@mail.com"
                className="rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
              />
            </Form.Item>

            {/* Teléfono */}
            <Form.Item
              label={<span className="font-medium text-gray-600">Teléfono</span>}
              name="phone"
              rules={[{ required: true, message: "Ingresa el teléfono" }]}
            >
              <Input
                placeholder="+593 9XXXXXXX"
                className="rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
              />
            </Form.Item>

            {/* Tipo */}
            <Form.Item
              label={<span className="font-medium text-gray-600">Tipo de Condominio</span>}
              name="tipo"
              rules={[{ required: true }]}
            >
              <Select
                onChange={(val) => setTipo(val)}
                disabled={isEditing}
                className="rounded-lg shadow-sm"
                popupClassName="rounded-lg"
              >
                <Option value="torres">Torres</Option>
                <Option value="casas">Casas</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Campo Admin full ancho */}
          <Form.Item
            label={<span className="font-medium text-gray-600">Administrador</span>}
            name="adminId"
            rules={[{ required: true, message: "Selecciona un administrador" }]}
          >
            <Select
              placeholder="Selecciona un administrador"
              className="rounded-lg shadow-sm"
              popupClassName="rounded-lg"
            >
              {admins.map((admin) => (
                <Option key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Torres */}
          {tipo === "torres" && (
            <>
              <Divider className="my-8 text-indigo-600 font-semibold">Torres</Divider>
              <Form.List name="torres">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }) => (
                      <Card
                        key={key}
                        title={`Torre #${name + 1}`}
                        className="mb-6 shadow-md rounded-xl"
                        extra={
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="text-red-600 hover:text-red-500 cursor-pointer transition"
                            style={{ fontSize: 20 }}
                          />
                        }
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Form.Item
                            label="Identificador"
                            name={[name, "identificador"]}
                            rules={[{ required: true, message: "Requerido" }]}
                          >
                            <Input
                              placeholder="Ej. Torre A"
                              className="rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
                            />
                          </Form.Item>
                          <Form.Item
                            label="Cantidad de Departamentos"
                            name={[name, "departamentos"]}
                            rules={[{ required: true, message: "Requerido" }]}
                          >
                            <InputNumber
                              min={1}
                              className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
                            />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        className="rounded-lg border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        Agregar Torre
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          {/* Casas */}
          {tipo === "casas" && (
            <>
              <Divider className="my-8 text-indigo-600 font-semibold">Casas</Divider>
              <Form.List name="casas">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }) => (
                      <Card
                        key={key}
                        title={`Bloque de Casas #${name + 1}`}
                        className="mb-6 shadow-md rounded-xl"
                        extra={
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="text-red-600 hover:text-red-500 cursor-pointer transition"
                            style={{ fontSize: 20 }}
                          />
                        }
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Form.Item
                            label="Identificador"
                            name={[name, "identificador"]}
                            rules={[{ required: true, message: "Requerido" }]}
                          >
                            <Input
                              placeholder="Ej. Bloque 1"
                              className="rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
                            />
                          </Form.Item>
                          <Form.Item
                            label="Cantidad de Casas"
                            name={[name, "cantidad"]}
                            rules={[{ required: true, message: "Requerido" }]}
                          >
                            <InputNumber
                              min={1}
                              className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
                            />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        className="rounded-lg border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        Agregar Casas
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          <Form.Item className="pt-6">
            <Space className="w-full justify-center space-x-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-4 rounded-lg transition-shadow duration-300"
              >
                {isEditing ? "Actualizar" : "Registrar"}
              </Button>

              <Button
                onClick={() => router.push("/superadmin/condominios")}
                className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CondominioFormPage;
