/* eslint-disable @next/next/no-img-element */
import api from "@/libs/axios";
import { Form, Input, Button, message, Card } from "antd";
import { Mail, Lock } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import { useState } from "react";

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  name: string;
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

      switch (decoded.role) {
        case "super_admin":
          router.push("/superadmin/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "propietario":
          router.push("/propietario/dashboard");
        case "guardia":
          router.push("/guardia/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Error al iniciar sesión";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4 overflow-hidden">
      <Card
        className="w-full max-w-5xl rounded-2xl shadow-2xl border border-blue-300 overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white">
          {/* FORMULARIO */}
          <div className="p-12 text-gray-800">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-900">
              Inicia sesión
            </h1>
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label={
                  <span className="text-blue-800 font-semibold">
                    Correo electrónico
                  </span>
                }
                name="email"
                rules={[{ required: true, message: "Ingresa tu correo" }]}
              >
                <Input
                  size="large"
                  placeholder="correo@email.com"
                  prefix={<Mail className="text-blue-500 w-5 h-5" />}
                  className="bg-white border-2 border-blue-400 rounded-xl text-blue-900 placeholder-blue-400
                    focus:border-blue-600 focus:ring-2 focus:ring-blue-300 shadow-sm transition"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-blue-800 font-semibold">
                    Contraseña
                  </span>
                }
                name="password"
                rules={[{ required: true, message: "Ingresa tu contraseña" }]}
              >
                <Input.Password
                  size="large"
                  placeholder="******"
                  prefix={<Lock className="text-blue-500 w-5 h-5" />}
                  className="bg-white border-2 border-blue-400 rounded-xl text-blue-900 placeholder-blue-400
                    focus:border-blue-600 focus:ring-2 focus:ring-blue-300 shadow-sm transition"
                />
              </Form.Item>

              {errorMessage && (
                <p className="text-red-600 mb-4 text-center font-medium">
                  {errorMessage}
                </p>
              )}

              <Form.Item>
                <Button
                  htmlType="submit"
                  loading={loading}
                  className="w-full !bg-blue-600 !text-white !border-none hover:!bg-blue-700 hover:!brightness-110 
                    font-bold rounded-xl text-lg shadow-md transition-all duration-300 ease-in-out"
                  size="large"
                >
                  Ingresar
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-6 text-blue-700 font-medium">
              <span className="text-blue-500">¿No tienes una cuenta?</span>
              <button
                onClick={() => router.push("/register")}
                className="ml-2 text-blue-700 hover:underline font-semibold"
              >
                Regístrate aquí
              </button>
            </div>
          </div>

          {/* IMAGEN */}
          <div className="hidden md:block overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Condominio real"
              className="h-full w-full object-cover brightness-95"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
