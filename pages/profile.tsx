import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from "@/libs/axios";
import { Form, Input, Button, message, Card, Divider, Skeleton } from "antd";

export default function Profile() {
  const user = useCurrentUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
        .catch(() => message.error("Error al cargar perfil"))
        .finally(() => setLoadingData(false));
    } else {
      setLoadingData(false);
    }
  }, [user]);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card
        className="w-full max-w-2xl rounded-2xl shadow-lg p-6"
        title={<h1 className="text-2xl font-bold text-gray-800">Perfil de Usuario</h1>}
      >
        {loadingData ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <>
            <div className="mb-6 space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-600">Nombre:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Correo:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Rol:</span> {user.role}
              </p>
            </div>

            {user.role === "admin" && (
              <>
                <Divider className="mb-6" />
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Editar Información</h2>

                <Form
                  layout="vertical"
                  form={form}
                  initialValues={initialValues}
                  onFinish={onFinish}
                  className="space-y-4"
                >
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
                      className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Guardar Cambios
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
