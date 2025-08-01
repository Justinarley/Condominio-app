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
      title="Generar reporte"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancelar" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="generar"
          type="primary"
          loading={loading}
          onClick={descargarReporte}
        >
          Generar
        </Button>,
      ]}
    >
      {!esDetallado && (
        <Form layout="vertical">
          <Form.Item label="Rango de fechas">
            <RangePicker
              value={rangoFechas}
              onChange={(values) => {
                if (values) {
                  setRangoFechas(values as [dayjs.Dayjs, dayjs.Dayjs]);
                }
              }}
              allowClear={false}
            />
          </Form.Item>
        </Form>
      )}
      {esDetallado && (
        <p>
          Se generará un reporte detallado para el condominio:{" "}
          <b>{name ?? id}</b>
        </p>
      )}
    </Modal>
  );
};
