import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from "@/libs/axios";
import { Form, Input, Button, message, Card } from "antd";
import { useRouter } from "next/router";
import { AxiosError } from "axios";

export default function Profile() {
  const user = useCurrentUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const endpoint =
      user.role === "admin" ? `/admin/${user.sub}` : `/usuarios/${user.sub}`;

    api
      .get(endpoint)
      .then((res) => {
        form.setFieldsValue(res.data);
      })
      .catch(() => message.error("Error al cargar perfil"));
  }, [user, form]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    if (!user) return;
    setLoading(true);
    const endpoint =
      user.role === "admin" ? `/admin/${user.sub}` : `/usuarios/${user.sub}`;
    try {
      await api.put(endpoint, values);
      message.success("Perfil actualizado");
      localStorage.removeItem("access_token");
      router.push("/login");
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;

      const backendMsg = err?.response?.data?.message;
      message.error(backendMsg || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-center py-20">Cargando usuario...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      {!editing ? (
        <Card className="w-full max-w-md shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Mi Perfil
          </h1>
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
          <Button
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setEditing(true)}
          >
            Editar Perfil
          </Button>
        </Card>
      ) : (
        <div className="w-full flex flex-col md:flex-row gap-6">
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

          <Card className="w-full md:w-1/2 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Editar Datos
            </h2>
            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Form.Item name="email" label="Correo">
                <Input placeholder="Correo electrónico" />
              </Form.Item>
              <Form.Item name="phone" label="Teléfono">
                <Input placeholder="Número de teléfono" />
              </Form.Item>

              {user.role === "propietario" && (
                <>
                  <Form.Item
                    name="numberOfResidents"
                    label="Número de residentes"
                  >
                    <Input type="number" min={1} placeholder="Ej. 3" />
                  </Form.Item>
                  <Form.Item
                    name="emergencyContactName"
                    label="Nombre contacto de emergencia"
                  >
                    <Input placeholder="Nombre de contacto" />
                  </Form.Item>
                  <Form.Item
                    name="emergencyContactPhone"
                    label="Teléfono contacto de emergencia"
                  >
                    <Input placeholder="Teléfono de contacto" />
                  </Form.Item>

                  <Form.List name="vehicles">
                    {(fields, { add, remove }) => (
                      <>
                        <p className="font-semibold mb-2">Vehículos</p>
                        {fields.map(({ key, name, ...restField }) => (
                          <div key={key} className="flex gap-2 mb-2">
                            <Form.Item
                              {...restField}
                              name={[name, "plate"]}
                              className="w-1/3"
                            >
                              <Input placeholder="Placa" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "model"]}
                              className="w-1/3"
                            >
                              <Input placeholder="Modelo" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "color"]}
                              className="w-1/3"
                            >
                              <Input placeholder="Color" />
                            </Form.Item>
                            <Button danger onClick={() => remove(name)}>
                              Eliminar
                            </Button>
                          </div>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block>
                            Agregar vehículo
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </>
              )}

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
