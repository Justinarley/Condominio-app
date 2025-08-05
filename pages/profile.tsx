import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from "@/libs/axios";
import { Form, Input, Button, message, Card, Divider } from "antd";
import { useRouter } from "next/router";

export default function Profile() {
  const user = useCurrentUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      api
        .get(`/admin/${user.sub}`)
        .then((res) => {
          form.setFieldsValue({
            email: res.data.email,
            phone: res.data.phone,
            address: res.data.address,
          });
        })
        .catch(() => message.error("Error al cargar perfil"));
    }
  }, [user, form]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.put(`/admin/${user.sub}`, values);
      message.success("Perfil actualizado");
      localStorage.removeItem("access_token");
      router.push("/login");
    } catch (err) {
      message.error("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-center py-20">Cargando usuario...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card
        className="w-full max-w-xl shadow-md"
        title={<h1 className="text-xl font-semibold text-gray-800">Perfil</h1>}
      >
        <div className="mb-6 space-y-1 text-sm text-gray-700">
          <p>
            <strong className="mr-2 text-gray-600">Nombre:</strong> {user.name}
          </p>
          <p>
            <strong className="mr-2 text-gray-600">Correo:</strong> {user.email}
          </p>
          <p>
            <strong className="mr-2 text-gray-600">Rol:</strong> {user.role}
          </p>
        </div>

        {user.role === "admin" && (
          <>
            <Divider className="mb-4" />
            <h2 className="text-base font-semibold mb-2 text-gray-800">
              Editar datos
            </h2>

            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Form.Item name="email" label="Correo">
                <Input placeholder="Tu correo electrónico" />
              </Form.Item>
              <Form.Item name="phone" label="Teléfono">
                <Input placeholder="Número de teléfono" />
              </Form.Item>
              <Form.Item name="address" label="Dirección">
                <Input placeholder="Dirección actual" />
              </Form.Item>

              <Form.Item>
                <Button
                  htmlType="submit"
                  type="primary"
                  loading={loading}
                  className="w-full bg-sky-600 hover:bg-sky-700"
                >
                  Guardar cambios
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}
