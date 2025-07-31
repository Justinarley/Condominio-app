import api from "@/libs/axios";
import { Form, Input, Button, message, Card } from "antd";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import { useState } from "react";

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await api.post("/auth/login", values);
      const token = response.data.access_token;
      if (!token) throw new Error("No se recibió token");
      localStorage.setItem("access_token", token);
      const decoded = jwtDecode<JwtPayload>(token);

      message.success("Inicio de sesión exitoso");

      // Redirigir según role
      switch (decoded.role) {
        case "super_admin":
          router.push("/superadmin/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Error al iniciar sesión";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Correo"
            name="email"
            rules={[{ required: true, message: "Ingresa tu correo" }]}
          >
            <Input placeholder="correo@email.com" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password placeholder="******" />
          </Form.Item>

          {errorMessage && (
            <p className="text-red-600 mb-4 text-center">{errorMessage}</p>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              Ingresar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
