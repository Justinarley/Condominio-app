import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from "@/libs/axios";
import { Form, Input, Button, message, Card } from "antd";
import { useRouter } from "next/router";

export default function Profile() {
  const user = useCurrentUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
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
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      {!editing ? (
        <Card className="w-full max-w-md shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Mi Perfil</h1>
          <div className="space-y-2 text-gray-700 text-center">
            <p>
              <strong>Nombre:</strong> {user.name}
            </p>
            <p>
              <strong>Correo:</strong> {user.email}
            </p>
            <p>
              <strong>Rol:</strong> {user.role}
            </p>
          </div>
          {user.role === "admin" && (
            <Button
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setEditing(true)}
            >
              Editar Perfil
            </Button>
          )}
        </Card>
      ) : (
        <div className="w-full flex flex-col md:flex-row gap-6">
          {/* Panel de Perfil a la izquierda */}
          <Card className="w-full md:w-1/2 shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Mi Perfil</h1>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Nombre:</strong> {user.name}
              </p>
              <p>
                <strong>Correo:</strong> {user.email}
              </p>
              <p>
                <strong>Rol:</strong> {user.role}
              </p>
            </div>
            <Button
              className="mt-6 bg-gray-500 hover:bg-gray-600 text-white"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </Button>
          </Card>

          {/* Formulario de Edición a la derecha */}
          <Card className="w-full md:w-1/2 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Editar Datos
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
          </Card>
        </div>
      )}
    </div>
  );
}
