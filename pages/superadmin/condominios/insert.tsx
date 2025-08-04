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

interface AreaComun {
  nombre: string;
  estado?: "libre" | "ocupado";
  descripcion?: string;
  capacidad?: number;
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
  areasComunes: AreaComun[];
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <Input disabled={isEditing} placeholder="CND-001" />
            </Form.Item>

            <Form.Item
              label="Nombre"
              name="name"
              rules={[{ required: true, message: "Ingresa el nombre" }]}
            >
              <Input placeholder="Nombre del condominio" />
            </Form.Item>

            <Form.Item
              label="Dirección"
              name="address"
              rules={[{ required: true, message: "Ingresa la dirección" }]}
            >
              <Input placeholder="Ciudad, Calle, Nº" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Ingresa el email" },
                { type: "email", message: "Email inválido" },
              ]}
            >
              <Input placeholder="ejemplo@mail.com" />
            </Form.Item>

            <Form.Item
              label="Teléfono"
              name="phone"
              rules={[{ required: true, message: "Ingresa el teléfono" }]}
            >
              <Input placeholder="+593 9XXXXXXX" />
            </Form.Item>

            <Form.Item
              label="Tipo de Condominio"
              name="tipo"
              rules={[{ required: true }]}
            >
              <Select onChange={(val) => setTipo(val)} disabled={isEditing}>
                <Option value="torres">Torres</Option>
                <Option value="casas">Casas</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Administrador"
            name="adminId"
            rules={[{ required: true, message: "Selecciona un administrador" }]}
          >
            <Select placeholder="Selecciona un administrador">
              {admins.map((admin) => (
                <Option key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {tipo === "torres" && (
            <>
              <Divider>Torres</Divider>
              <Form.List name="torres">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }) => (
                      <Card
                        key={key}
                        title={`Torre #${name + 1}`}
                        className="mb-4"
                        extra={
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="text-red-500"
                          />
                        }
                      >
                        <Form.Item
                          label="Identificador"
                          name={[name, "identificador"]}
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Ej. Torre A" />
                        </Form.Item>
                        <Form.Item
                          label="Departamentos"
                          name={[name, "departamentos"]}
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Agregar Torre
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          {tipo === "casas" && (
            <>
              <Divider>Casas</Divider>
              <Form.List name="casas">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }) => (
                      <Card
                        key={key}
                        title={`Bloque de Casas #${name + 1}`}
                        className="mb-4"
                        extra={
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="text-red-500"
                          />
                        }
                      >
                        <Form.Item
                          label="Identificador"
                          name={[name, "identificador"]}
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Ej. Bloque 1" />
                        </Form.Item>
                        <Form.Item
                          label="Cantidad"
                          name={[name, "cantidad"]}
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Agregar Casas
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          <Divider>Áreas Comunes</Divider>
          <Form.List name="areasComunes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    title={`Área Común #${name + 1}`}
                    className="mb-4"
                    extra={
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        className="text-red-500"
                      />
                    }
                  >
                    <Form.Item
                      label="Nombre"
                      name={[name, "nombre"]}
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Estado"
                      name={[name, "estado"]}
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <Select>
                        <Option value="libre">Libre</Option>
                        <Option value="ocupado">Ocupado</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Descripción" name={[name, "descripcion"]}>
                      <Input.TextArea />
                    </Form.Item>

                    <Form.Item label="Capacidad" name={[name, "capacidad"]}>
                      <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Agregar Área Común
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

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
