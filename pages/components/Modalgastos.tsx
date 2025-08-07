import { useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Button,
  message,
  DatePicker,
  Input,
} from "antd";
import esES from "antd/es/date-picker/locale/es_ES";
import {
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/es";
import api from "@/libs/axios";

const { MonthPicker } = DatePicker;

type CrearGastoMensualModalProps = {
  condominioId: string;
  condominioName: string;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

export function CrearGastoMensualModal({
  condominioId,
  condominioName,
  modalVisible,
  setModalVisible,
}: CrearGastoMensualModalProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const disabledMonth = (current: dayjs.Dayjs) => {
    if (!current) return false;
    return current.isBefore(dayjs().startOf("month"), "month");
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const mesFormateado = values.mes
        .locale("es")
        .format("MMMM YYYY")
        .toLowerCase();

      await api.put(`/admin/gastos/${condominioId}`, {
        mes: mesFormateado,
        montoTotal: values.montoTotal,
        descripcion: values.descripcion?.trim(),
      });

      message.success("Gasto mensual registrado con éxito");
      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Error al crear gasto mensual";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="text-lg font-semibold text-blue-600 flex items-center gap-2">
          <PlusCircleOutlined />
          Crear gasto mensual - {condominioName}
        </div>
      }
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
      destroyOnClose
      className="rounded-xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ montoTotal: undefined, descripcion: "" }}
        className="pt-2"
      >
        <Form.Item
          label={
            <span className="flex items-center gap-2 text-gray-700">
              <CalendarOutlined />
              Mes y Año
            </span>
          }
          name="mes"
          rules={[{ required: true, message: "Selecciona mes y año" }]}
        >
          <MonthPicker
            locale={esES}
            placeholder="Selecciona mes y año"
            format="MMMM YYYY"
            style={{ width: "100%" }}
            disabledDate={disabledMonth}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="flex items-center gap-2 text-gray-700">
              <DollarOutlined />
              Monto total
            </span>
          }
          name="montoTotal"
          rules={[
            { required: true, message: "Por favor ingresa el monto" },
            {
              type: "number",
              min: 0,
              message: "El monto debe ser un número positivo",
            },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="flex items-center gap-2 text-gray-700">
              <FileTextOutlined />
              Descripción
            </span>
          }
          name="descripcion"
        >
          <Input.TextArea placeholder="Opcional" rows={3} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Crear gasto mensual
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
