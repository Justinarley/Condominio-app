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

  // Bloquear meses anteriores al mes actual
  const disabledMonth = (current: dayjs.Dayjs) => {
    if (!current) return false;
    // no permitir meses anteriores al inicio del mes actual
    return current.isBefore(dayjs().startOf("month"), "month");
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Formatear mes a "agosto 2025"
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
      title={`Crear gasto mensual - ${condominioName}`}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ montoTotal: undefined, descripcion: "" }}
      >
        <Form.Item
          label="Mes y Año"
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
          label="Monto total"
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
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>  

        <Form.Item label="Descripción" name="descripcion">
          <Input.TextArea placeholder="Opcional" rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Crear gasto mensual
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
