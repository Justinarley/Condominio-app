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
  Space,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
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
  const [currentStep, setCurrentStep] = useState(0);

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
      const { confirmPassword, ...payload } = values;
      payload.status = UserStatus.INACTIVE;

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

  const steps = [
    {
      title: "Información Personal",
      content: (
        <>
          <Form.Item
            label="Nombre completo"
            name="name"
            rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[{ required: true, message: "Por favor ingresa tu email" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="phone"
            rules={[{ required: true, message: "Por favor ingresa tu teléfono" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa una contraseña" },
              { min: 6, message: "La contraseña debe tener mínimo 6 caracteres" },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirmar contraseña"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Por favor confirma tu contraseña" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Las contraseñas no coinciden")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </>
      ),
    },
    {
      title: "Datos de Identificación y Condominio",
      content: (
        <>
          <Form.Item
            label="Tipo de identificación"
            name="identificationType"
            rules={[{ required: true, message: "Selecciona tipo de identificación" }]}
          >
            <Select>
              <Select.Option value={IdentificationType.CEDULA}>Cédula</Select.Option>
              <Select.Option value={IdentificationType.PASAPORTE}>Pasaporte</Select.Option>
              <Select.Option value={IdentificationType.RUC}>RUC</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Número de identificación"
            name="identificationNumber"
            rules={[
              { required: true, message: "Por favor ingresa número de identificación" },
              { pattern: /^\d{8,13}$/, message: "Número inválido (8 a 13 dígitos)" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Rol" name="role" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={UserRole.PROPIETARIO}>Propietario</Radio>
              <Radio value={UserRole.GUARDIA}>Guardia</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item shouldUpdate={(prev, curr) => prev.role !== curr.role}>
            {({ getFieldValue }) =>
              getFieldValue("role") === UserRole.PROPIETARIO && (
                <>
                  <Form.Item
                    label="Número de residentes"
                    name="numberOfResidents"
                    rules={[
                      { required: true, message: "Ingresa número de residentes" },
                      { type: "number", min: 1, message: "Debe ser al menos 1" },
                    ]}
                  >
                    <InputNumber min={1} />
                  </Form.Item>

                  <Form.Item
                    label="Departamento"
                    name="departamentoId"
                    rules={[{ required: true, message: "Selecciona un departamento" }]}
                  >
                    <Select placeholder="Selecciona un departamento">
                      {departamentosFiltrados.map((d) => (
                        <Select.Option key={d._id} value={d._id}>
                          {d.nombre}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </>
              )
            }
          </Form.Item>

          <Form.Item
            label="Condominio"
            name="condominioId"
            rules={[{ required: true, message: "Selecciona un condominio" }]}
          >
            <Select size="large" placeholder="Selecciona un condominio">
              {condominios.map((c) => (
                <Select.Option key={c._id} value={c._id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      ),
    },
    {
      title: "Datos Adicionales",
      content: (
        <>
          <Form.List name="vehicles">
            {(fields, { add, remove }) => (
              <>
                <label className="block font-semibold text-gray-700">Vehículos</label>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} direction="vertical" style={{ display: "flex", marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, "plate"]}
                      rules={[{ required: true, message: "Ingresa la placa" }]}
                    >
                      <Input placeholder="Placa del vehículo" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "model"]}
                      rules={[{ required: true, message: "Ingresa el modelo" }]}
                    >
                      <Input placeholder="Modelo del vehículo" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "color"]}
                      rules={[{ required: true, message: "Ingresa el color" }]}
                    >
                      <Input placeholder="Color del vehículo" />
                    </Form.Item>
                    <Button
                      type="dashed"
                      danger
                      onClick={() => remove(name)}
                      icon={<MinusCircleOutlined />}
                    >
                      Eliminar vehículo
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Agregar vehículo
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            label="Nombre de contacto de emergencia"
            name="emergencyContactName"
            rules={[{ required: true, message: "Ingresa nombre contacto emergencia" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Teléfono de contacto de emergencia"
            name="emergencyContactPhone"
            rules={[{ required: true, message: "Ingresa teléfono contacto emergencia" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Notas (opcional)"
            name="notes"
            rules={[{ max: 250, message: "Máximo 250 caracteres" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#a0d8ef] p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Panel Izquierdo */}
        <div className="hidden md:flex flex-col items-center justify-center bg-white p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Bienvenido!</h2>
          <p className="text-gray-600 text-center mb-6">
            Empieza creando tu cuenta aquí. Completa los pasos para registrar tu usuario.
          </p>

          <p className="text-sm text-gray-500">
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Inicia sesión
            </a>
          </p>
        </div>

        {/* Panel Derecho */}
        <div className="bg-gray-50 p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-2">
            Paso {currentStep + 1} de {steps.length}
          </h3>
          <h4 className="text-lg font-medium text-gray-700 mb-4">
            {steps[currentStep].title}
          </h4>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={(changedValues) => {
              if (changedValues.condominioId) {
                onCondominioChange(changedValues.condominioId);
              }
            }}
            className="flex flex-col flex-grow justify-between"
          >
            <div className="flex-grow overflow-y-auto">
              {steps.map((step, index) => (
                <div key={index} style={{ display: index === currentStep ? 'block' : 'none' }}>
                  {step.content}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Anterior
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full"
                >
                  Crear Cuenta
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
