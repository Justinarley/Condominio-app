import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Form, Input, Button, message, Space } from "antd";
import api from "@/libs/axios";

type AdminFormData = {
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  identification?: string;
};

const AdminFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      setIsEditing(true);
      setLoading(true);
      api
        .get(`/admins/${id}`)
        .then((res) => {
          const admin = res.data;
          form.setFieldsValue({
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            address: admin.address,
            identification: admin.identification,
          });
        })
        .catch(() => {
          message.error("Error cargando administrador");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setIsEditing(false);
      form.resetFields();
    }
  }, [id, form]);

  const onFinish = async (values: AdminFormData) => {
    setLoading(true);
    try {
      if (isEditing && typeof id === "string") {
        await api.put(`/admins/${id}`, {
          email: values.email,
          phone: values.phone,
          address: values.address,
        });
        message.success("Administrador actualizado");
      } else {
        if (!values.password) {
          message.error(
            "La contraseña es requerida para crear un administrador"
          );
          setLoading(false);
          return;
        }
        await api.post("/admins", values);
        message.success("Administrador creado");
      }
      router.push("/superadmin/admins");
    } catch (error) {
      message.error("Error al guardar administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-xl font-semibold text-gray-700 mb-10 text-center tracking-wide">
          {isEditing ? "Editar Administrador" : "Insertar Administrador"}
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loading}
          initialValues={{ status: "active" }}
          requiredMark={false}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Form.Item
              label={<label className="font-medium text-gray-600">Nombre</label>}
              name="name"
              rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
            >
              <Input
                disabled={isEditing}
                placeholder="Ej. Juan Pérez"
                className="rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 shadow-sm transition"
              />
            </Form.Item>

            <Form.Item
              label={<label className="font-medium text-gray-600">Email</label>}
              name="email"
              rules={[
                { required: true, message: "Por favor ingresa el email" },
                { type: "email", message: "Email inválido" },
              ]}
            >
              <Input
                placeholder="ejemplo@mail.com"
                className="rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 shadow-sm transition"
              />
            </Form.Item>

            {!isEditing && (
              <Form.Item
                label={<label className="font-medium text-gray-600">Contraseña</label>}
                name="password"
                rules={[
                  { required: true, message: "Por favor ingresa la contraseña" },
                  { min: 6, message: "Mínimo 6 caracteres" },
                ]}
              >
                <Input.Password
                  placeholder="******"
                  className="rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 shadow-sm transition"
                />
              </Form.Item>
            )}

            <Form.Item
              label={<label className="font-medium text-gray-600">Teléfono</label>}
              name="phone"
              rules={[{ required: true, message: "Por favor ingresa el teléfono" }]}
            >
              <Input
                placeholder="+593 9XXXXXXX"
                className="rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 shadow-sm transition"
              />
            </Form.Item>

            <Form.Item
              label={<label className="font-medium text-gray-600">Dirección</label>}
              name="address"
              rules={[{ required: true, message: "Por favor ingresa la dirección" }]}
            >
              <Input
                placeholder="Ciudad, Calle, Nº"
                className="rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 shadow-sm transition"
              />
            </Form.Item>

            <Form.Item
              label={<label className="font-medium text-gray-600">Identificación</label>}
              name="identification"
              rules={[{ required: true, message: "Por favor ingresa la identificación" }]}
            >
              <Input
                disabled={isEditing}
                placeholder="Cédula o pasaporte"
                className="rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 shadow-sm transition"
              />
            </Form.Item>
          </div>

          <Form.Item className="pt-6">
            <Space className="w-full justify-center space-x-4 sm:space-x-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-4 rounded-lg transition-shadow duration-300"
              >
                {isEditing ? "Actualizar" : "Registrar"}
              </Button>

              <Button
                onClick={() => router.push("/superadmin/admins")}
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

export default AdminFormPage;
