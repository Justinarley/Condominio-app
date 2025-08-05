import { Modal, Button, DatePicker, Form, message } from "antd";
import { FC, useState } from "react";
import dayjs from "dayjs";
import api from "@/libs/axios";
import { ExclamationCircleOutlined } from "@ant-design/icons";

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
  const [confirmVisible, setConfirmVisible] = useState(false);

  const descargarReporte = async () => {
    if (!esDetallado && !rangoFechas) {
      message.error("Debes seleccionar un rango de fechas");
      return;
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
      setConfirmVisible(false);
    }
  };

  return (
    <>
      {/* Modal principal */}
      <Modal
        title={<span className="text-xl font-semibold text-gray-800">Generar Reporte</span>}
        open={open}
        onCancel={() => {
          setConfirmVisible(false);
          onClose();
        }}
        footer={[
          <Button
            key="cancelar"
            onClick={() => {
              setConfirmVisible(false);
              onClose();
            }}
            className="rounded-lg"
          >
            Cancelar
          </Button>,
          <Button
            key="generar"
            type="primary"
            loading={loading}
            onClick={() => setConfirmVisible(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Generar
          </Button>,
        ]}
        className="rounded-xl shadow-lg"
        centered
      >
        <div className="flex flex-col items-center gap-4">
          {/* Cuadro informativo */}
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-md p-4 w-full">
            <ExclamationCircleOutlined className="text-yellow-500 text-2xl" />
            <div className="text-sm text-yellow-800">
              {esDetallado
                ? `Este reporte será detallado para el condominio: ${name ?? id}.`
                : "Selecciona el rango de fechas para generar el reporte."}
            </div>
          </div>

          {/* Formulario */}
          {!esDetallado && (
            <Form layout="vertical" className="w-full max-w-xs">
              <Form.Item
                label={
                  <span className="font-medium text-gray-700">Rango de fechas</span>
                }
              >
                <RangePicker
                  value={rangoFechas}
                  onChange={(values) => {
                    if (values) {
                      setRangoFechas(values as [dayjs.Dayjs, dayjs.Dayjs]);
                    }
                  }}
                  allowClear={false}
                  className="w-full"
                  disabled={loading}
                />
              </Form.Item>
            </Form>
          )}
        </div>
      </Modal>

      {/* Modal de confirmación */}
      <Modal
        open={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setConfirmVisible(false)}
            className="rounded-lg"
          >
            Cancelar
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={loading}
            onClick={descargarReporte}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Confirmar
          </Button>,
        ]}
        centered
        className="rounded-xl shadow-lg"
        title="Confirmar descarga"
      >
        <p className="text-gray-700 text-center">
          {esDetallado
            ? `Se descargará un reporte detallado para el condominio: ${name ?? id}.`
            : `Se descargará un reporte desde ${rangoFechas[0].format(
                "DD/MM/YYYY"
              )} hasta ${rangoFechas[1].format("DD/MM/YYYY")}.`}
        </p>
      </Modal>
    </>
  );
};
