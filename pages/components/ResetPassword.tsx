import { Modal, Form, Input, Button, message, Typography } from "antd";
import { ExclamationCircleOutlined, LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
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
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [password, setPassword] = useState("");

  const handleConfirmSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await api.put(`/${userType}/${userId}/password`, { password });
      message.success("✅ Contraseña actualizada correctamente");
      setConfirmVisible(false);
      onClose();
      form.resetFields();
    } catch (error) {
      message.error("❌ Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleFormFinish = (values: { password: string; confirmPassword: string }) => {
    setPassword(values.password);
    setConfirmVisible(true); // Abrir modal de confirmación
  };

  return (
    <>
      <Modal
        title={<span><LockOutlined /> Cambiar contraseña</span>}
        open={open}
        onCancel={onClose}
        footer={null}
        width={400}
        destroyOnClose
      >
        <Typography.Paragraph className="text-gray-600">
          Ingresa la nueva contraseña para el usuario. Recuerda que debe tener al menos 6 caracteres.
        </Typography.Paragraph>

        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <Form.Item
            name="password"
            label="Nueva contraseña"
            rules={[
              { required: true, message: "Por favor ingresa la contraseña" },
              { min: 6, message: "Debe tener mínimo 6 caracteres" },
            ]}
          >
            <Input.Password placeholder="Escribe la nueva contraseña" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar contraseña"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Por favor confirma la contraseña" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Las contraseñas no coinciden"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Vuelve a escribir la contraseña" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Guardar cambios
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal
        open={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        footer={null}
        centered
        width={350}
        destroyOnClose
      >
        <div className="flex flex-col items-center text-center">
          <ExclamationCircleOutlined className="text-yellow-500 text-5xl mb-4" />
          <Typography.Title level={4}>¿Estás seguro?</Typography.Title>
          <Typography.Paragraph>
            Esta acción actualizará la contraseña del usuario. ¿Deseas continuar?
          </Typography.Paragraph>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => setConfirmVisible(false)} className="w-1/2">
              Cancelar
            </Button>
            <Button
              type="primary"
              danger
              loading={loading}
              onClick={handleConfirmSubmit}
              className="w-1/2"
              icon={<CheckCircleOutlined />}
            >
              Sí, actualizar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
