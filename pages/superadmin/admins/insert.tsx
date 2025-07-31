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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Error al guardar administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-black">
        {isEditing ? "Editar Administrador" : "Insertar Administrador"}
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={loading}
        initialValues={{ status: "active" }}
      >
        <Form.Item
          label="Nombre"
          name="name"
          rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
        >
          <Input disabled={isEditing} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Por favor ingresa el email" },
            { type: "email", message: "Email inválido" },
          ]}
        >
          <Input />
        </Form.Item>

        {!isEditing && (
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa la contraseña" },
              { min: 6, message: "Mínimo 6 caracteres" },
            ]}
          >
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item
          label="Teléfono"
          name="phone"
          rules={[{ required: true, message: "Por favor ingresa el teléfono" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Dirección"
          name="address"
          rules={[
            { required: true, message: "Por favor ingresa la dirección" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Identificación"
          name="identification"
          rules={[
            { required: true, message: "Por favor ingresa la identificación" },
          ]}
        >
          <Input disabled={isEditing} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? "Actualizar" : "Registrar"}
            </Button>
            <Button onClick={() => router.push("/superadmin/admins")}>
              Cancelar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};

export default AdminFormPage;
