import { Modal, Button, DatePicker, Form, message } from "antd";
import { FC, useState } from "react";
import dayjs from "dayjs";
import api from "@/libs/axios";

const { RangePicker } = DatePicker;

type ModalReporteProps = {
  open: boolean;
  onClose: () => void;
  endpoint: string;
  esDetallado?: boolean;
  id?: string;
  name?: string;
};

export const ModalReporte: FC<ModalReporteProps> = ({
  open,
  onClose,
  endpoint,
  esDetallado = false,
  id,
  name,
}) => {
  const [rangoFechas, setRangoFechas] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);

  const descargarReporte = async () => {
    if (!esDetallado && !rangoFechas) {
      return message.error("Debes seleccionar un rango de fechas");
    }

    setLoading(true);
    try {
      const url = esDetallado
        ? `/reportes/condominios/${id}/excel-detallado`
        : `${endpoint}?fechaInicio=${rangoFechas[0].format(
            "YYYY-MM-DD"
          )}&fechaFin=${rangoFechas[1].format("YYYY-MM-DD")}`;

      const response = await api.get(url, {
        responseType: "blob",
      });

      const disposition = response.headers["content-disposition"];
      let filename = "reporte.xlsx";

      if (disposition && disposition.includes("filename=")) {
        const filenameMatch = disposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      message.success("Reporte descargado con éxito");
      onClose();
    } catch (error) {
      message.error(
        error instanceof Error
          ? `Error generando el reporte: ${error.message}`
          : "Error generando el reporte"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span className="text-xl font-semibold text-gray-800">Generar reporte</span>}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancelar" onClick={onClose} className="rounded-lg">
          Cancelar
        </Button>,
        <Button
          key="generar"
          type="primary"
          loading={loading}
          onClick={descargarReporte}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Generar
        </Button>,
      ]}
      className="rounded-xl"
    >
      <div className="flex flex-col gap-6">
        {!esDetallado && (
          <Form layout="vertical" className="space-y-4">
            <Form.Item label={<span className="font-medium text-gray-700">Rango de fechas</span>}>
              <RangePicker
                value={rangoFechas}
                onChange={(values) => {
                  if (values) {
                    setRangoFechas(values as [dayjs.Dayjs, dayjs.Dayjs]);
                  }
                }}
                allowClear={false}
                className="w-full"
              />
            </Form.Item>
          </Form>
        )}
        {esDetallado && (
          <p className="text-gray-600 text-base">
            Se generará un reporte detallado para el condominio:{" "}
            <b className="text-gray-800">{name ?? id}</b>
          </p>
        )}
      </div>
    </Modal>
  );
};
