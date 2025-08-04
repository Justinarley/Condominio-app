import { Modal, Form, Input, Button, message } from "antd";
import { useState } from "react";
import api from "@/libs/axios";

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  userType: "admins" | "usuarios";
};

export default function ResetPasswordModal({
  open,
  onClose,
  userId,
  userType,
}: ChangePasswordModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { password: string }) => {
    if (!userId) return;
    setLoading(true);
    try {
      await api.put(`/${userType}/${userId}/password`, {
        password: values.password,
      });
      message.success("Contraseña actualizada");
      onClose();
      form.resetFields();
    } catch (error) {
      message.error("Error al actualizar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Cambiar contraseña"
      open={open}
      onCancel={onClose}
      footer={null}
      width={300}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="password"
          label="Nueva contraseña"
          rules={[
            { required: true, message: "Por favor ingresa la contraseña" },
            { min: 6, message: "Debe tener mínimo 6 caracteres" },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Guardar
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
