import { useEffect, useState } from "react";
import api from "@/libs/axios";
import {
  Form,
  Input,
  Button,
  Select,
  Radio,
  InputNumber,
  message,
} from "antd";
import { useRouter } from "next/router";

export enum IdentificationType {
  CEDULA = "cedula",
  PASAPORTE = "pasaporte",
  RUC = "ruc",
}

export enum UserRole {
  PROPIETARIO = "propietario",
  GUARDIA = "guardia",
}

export enum UserStatus {
  INACTIVE = "inactive",
}

type Condominio = {
  _id: string;
  name: string;
  departamentos: { _id: string; codigo: string; nombre: string }[];
};

export default function Register() {
  const router = useRouter();
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [departamentosFiltrados, setDepartamentosFiltrados] = useState<
    Condominio["departamentos"]
  >([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    api
      .get("/condominio")
      .then(({ data }) => setCondominios(data))
      .catch(() => message.error("Error cargando condominios"));
  }, []);

  const onCondominioChange = (condominioId: string) => {
    const cond = condominios.find((c) => c._id === condominioId);
    setDepartamentosFiltrados(cond ? cond.departamentos : []);
    form.setFieldsValue({ departamentoId: undefined });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = { ...values, status: UserStatus.INACTIVE };
      await api.post("/usuarios", payload);
      message.success(
        "Registro exitoso. Espera a que un administrador apruebe tu cuenta."
      );
      form.resetFields();
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      message.error("Error al registrar usuario");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white max-w-6xl w-full rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Imagen con url, hay que cambiarla */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center">
          <img
            src="https://phantom-elmundo.unidadeditorial.es/37df7a3827669a86685352ed0387dacd/resize/1300/assets/multimedia/imagenes/2023/03/21/16793975076956.jpg"
            alt="Registro usuario"
            className="object-cover w-full h-full"
            style={{ userSelect: "none" }}
            draggable={false}
          />
        </div>

        {/* Formulario dinámico */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
           Regístrate
          </h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              role: UserRole.PROPIETARIO,
              identificationType: IdentificationType.CEDULA,
            }}
            onValuesChange={(changedValues) => {
              if (changedValues.condominioId) {
                onCondominioChange(changedValues.condominioId);
              }
            }}
          >
            {/* Formulario dinámico con columnas y filas */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <Form.Item
                label="Nombre completo"
                name="name"
                rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}
                className="md:col-span-7"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Teléfono"
                name="phone"
                rules={[{ required: true, message: "Por favor ingresa tu teléfono" }]}
                className="md:col-span-5"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Correo electrónico"
                name="email"
                rules={[
                  { required: true, message: "Por favor ingresa tu email" },
                  { type: "email", message: "Email inválido" },
                ]}
                className="md:col-span-7"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Tipo de identificación"
                name="identificationType"
                rules={[{ required: true, message: "Selecciona tipo de identificación" }]}
                className="md:col-span-5"
              >
                <Select size="large" placeholder="Selecciona tipo">
                  <Select.Option value={IdentificationType.CEDULA}>Cédula</Select.Option>
                  <Select.Option value={IdentificationType.PASAPORTE}>Pasaporte</Select.Option>
                  <Select.Option value={IdentificationType.RUC}>RUC</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Contraseña"
                name="password"
                rules={[
                  { required: true, message: "Por favor ingresa una contraseña" },
                  { min: 6, message: "La contraseña debe tener mínimo 6 caracteres" },
                ]}
                className="md:col-span-7"
              >
                <Input.Password size="large" />
              </Form.Item>

              <Form.Item
                label="Número de identificación"
                name="identificationNumber"
                rules={[
                  { required: true, message: "Por favor ingresa número de identificación" },
                  { pattern: /^\d{8,13}$/, message: "Número inválido (8 a 13 dígitos)" },
                ]}
                className="md:col-span-5"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Número de unidad"
                name="unitNumber"
                rules={[{ required: true, message: "Por favor ingresa número de unidad" }]}
                className="md:col-span-6"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Número de residentes"
                name="numberOfResidents"
                rules={[
                  { required: true, message: "Ingresa número de residentes" },
                  { type: "number", min: 1, message: "Debe ser al menos 1" },
                ]}
                className="md:col-span-6"
              >
                <InputNumber size="large" min={1} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Rol"
                name="role"
                rules={[{ required: true, message: "Selecciona un rol" }]}
                className="md:col-span-12"
              >
                <Radio.Group size="large" className="flex space-x-8">
                  <Radio value={UserRole.PROPIETARIO}>Propietario</Radio>
                  <Radio value={UserRole.GUARDIA}>Guardia</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Nombre contacto emergencia"
                name="emergencyContactName"
                rules={[{ required: true, message: "Ingresa nombre contacto emergencia" }]}
                className="md:col-span-6"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Teléfono contacto emergencia"
                name="emergencyContactPhone"
                rules={[{ required: true, message: "Ingresa teléfono contacto emergencia" }]}
                className="md:col-span-6"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Condominio"
                name="condominioId"
                rules={[{ required: true, message: "Selecciona un condominio" }]}
                className="md:col-span-12"
              >
                <Select size="large" placeholder="Selecciona un condominio">
                  {condominios.map((c) => (
                    <Select.Option key={c._id} value={c._id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* El rol */}
              <Form.Item shouldUpdate={(prev, curr) => prev.role !== curr.role}>
              {({ getFieldValue }) =>
                getFieldValue("role") === UserRole.PROPIETARIO && (
                  <div className="md:col-span-12">
                    <Form.Item
                      label="Departamento"
                      name="departamentoId"
                      rules={[{ required: true, message: "Selecciona un departamento" }]}
                    >
                      <Select
                        size="large"
                        placeholder="Selecciona un departamento"
                        disabled={departamentosFiltrados.length === 0}
                      >
                        {departamentosFiltrados.map((d) => (
                          <Select.Option key={d._id} value={d._id}>
                            {d.codigo} - {d.nombre}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                )
              }
            </Form.Item>
              <Form.Item
                label="Notas (opcional)"
                name="notes"
                rules={[{ max: 250, message: "Máximo 250 caracteres" }]}
                className="md:col-span-12 mt-4"
              >
                <Input.TextArea rows={3} size="large" />
              </Form.Item>

              <Form.Item label="Placa del vehículo (opcional)" name="vehiclePlate" className="md:col-span-6">
                <Input size="large" />
              </Form.Item>

              <Form.Item label="Modelo del vehículo (opcional)" name="vehicleModel" className="md:col-span-6">
                <Input size="large" />
              </Form.Item>

              <Form.Item className="md:col-span-12 mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full text-lg font-semibold"
                  size="large"
                >
                  Registrar
                </Button>
              </Form.Item>
            </div>
          </Form>

          <div className="text-center mt-6 text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Button type="link" onClick={goToLogin} className="text-blue-600 hover:underline">
              Inicia sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
