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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Registro de usuario</h2>

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
          <Form.Item
            label="Nombre completo"
            name="name"
            rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[
              { required: true, message: "Por favor ingresa tu email" },
              { type: "email", message: "Email inválido" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa una contraseña" },
              { min: 6, message: "La contraseña debe tener mínimo 6 caracteres" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="phone"
            rules={[{ required: true, message: "Por favor ingresa tu teléfono" }]}
          >
            <Input />
          </Form.Item>

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

          <Form.Item
            label="Número de unidad"
            name="unitNumber"
            rules={[{ required: true, message: "Por favor ingresa número de unidad" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Rol"
            name="role"
            rules={[{ required: true, message: "Selecciona un rol" }]}
          >
            <Radio.Group>
              <Radio value={UserRole.PROPIETARIO}>Propietario</Radio>
              <Radio value={UserRole.GUARDIA}>Guardia</Radio>
            </Radio.Group>
          </Form.Item>

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
            label="Condominio"
            name="condominioId"
            rules={[{ required: true, message: "Selecciona un condominio" }]}
          >
            <Select placeholder="Selecciona un condominio">
              {condominios.map((c) => (
                <Select.Option key={c._id} value={c._id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item shouldUpdate={(prev, curr) => prev.role !== curr.role}>
            {({ getFieldValue }) =>
              getFieldValue("role") === UserRole.PROPIETARIO && (
                <Form.Item
                  label="Departamento"
                  name="departamentoId"
                  rules={[{ required: true, message: "Selecciona un departamento" }]}
                >
                  <Select
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
              )
            }
          </Form.Item>

          <Form.Item
            label="Notas (opcional)"
            name="notes"
            rules={[{ max: 250, message: "Máximo 250 caracteres" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Placa del vehículo (opcional)" name="vehiclePlate">
            <Input />
          </Form.Item>

          <Form.Item label="Modelo del vehículo (opcional)" name="vehicleModel">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
              Registrar
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-600">¿Ya tienes una cuenta?</span>
          <Button type="link" onClick={goToLogin}>
            Inicia sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
