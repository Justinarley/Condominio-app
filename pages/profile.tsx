import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from "@/libs/axios";
import { Form, Input, Button, message } from "antd";

export default function Profile() {
  const user = useCurrentUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [initialValues, setInitialValues] = useState({
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      api
        .get(`/admins/${user.sub}`)
        .then((res) => {
          setInitialValues({
            email: res.data.email,
            phone: res.data.phone,
            address: res.data.address,
          });
          form.setFieldsValue(res.data);
        })
        .catch(() => message.error("Error al cargar perfil"));
    }
  }, [user]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.put(`/admins/${user.sub}`, values);
      message.success("Perfil actualizado");
    } catch (err) {
      message.error("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Cargando usuario...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-6 text-gray-900 text-center">
          Perfil
        </h1>

        <div className="mb-6 space-y-2 text-gray-800">
          <p>
            <strong className="mr-2">Nombre:</strong> {user.name}
          </p>
          <p>
            <strong className="mr-2">Correo:</strong> {user.email}
          </p>
          <p>
            <strong className="mr-2">Rol:</strong> {user.role}
          </p>
        </div>

        {user.role === "admin" && (
          <>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              Editar datos
            </h2>
            <Form
              layout="vertical"
              form={form}
              initialValues={initialValues}
              onFinish={onFinish}
            >
              <Form.Item name="email" label="Correo">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Teléfono">
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Dirección">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button
                  htmlType="submit"
                  type="primary"
                  loading={loading}
                  className="w-full"
                >
                  Guardar cambios
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
