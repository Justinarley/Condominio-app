import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Button,
  Space,
  Select,
  Table,
  InputNumber,
  Typography,
  message,
  Alert,
} from "antd";
import api from "@/libs/axios";

const { Option } = Select;
const { Title, Text } = Typography;

interface AsignarAlicuotasModalProps {
  condominioId: string;
  condominioName?: string;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

interface Departamento {
  _id: string;
  name: string;
  number?: string | number;
  alicuota?: number;
}

export function IngresarAlicuotasModal({
  condominioId,
  condominioName,
  modalVisible,
  setModalVisible,
}: AsignarAlicuotasModalProps) {
  const [grupos, setGrupos] = useState<string[]>([]);
  const [departamentosPorGrupo, setDepartamentosPorGrupo] = useState<
    Record<string, Departamento[]>
  >({});
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | undefined>(
    undefined
  );
  const [departamentosSeleccionados, setDepartamentosSeleccionados] = useState<
    string[]
  >([]);
  const [alicuota, setAlicuota] = useState<number>(0);

  // Estado para gasto mensual actual
  const [gastoMesActual, setGastoMesActual] = useState<{
    montoTotal: number;
    mes: string;
    descripcion?: string | null;
  } | null>(null);

  // Estados para total alícuotas y valor por unidad
  const [totalAlicuotas, setTotalAlicuotas] = useState(0);
  const [valorPorUnidad, setValorPorUnidad] = useState(0);

  // Para mostrar mensaje si la suma es menor a 1
  const [mostrarAvisoAlicuota, setMostrarAvisoAlicuota] = useState(false);

  // --- Función para cargar departamentos y gasto mensual ---
  async function fetchData() {
    if (!condominioId) return;

    try {
      const [resDeptos, resGasto] = await Promise.all([
        api.get(`/admin/departamentos-por-grupo/${condominioId}`),
        api.get(`/admin/gasto-mensual-actual/${condominioId}`),
      ]);

      const dataRaw: Record<string, any[]> = resDeptos.data;
      const dataMapped: Record<string, Departamento[]> = {};
      for (const grupo in dataRaw) {
        dataMapped[grupo] = dataRaw[grupo].map((d) => ({
          _id: d._id,
          name: d.nombre,
          number: d.codigo,
          alicuota: d.alicuota ?? 0,
        }));
      }

      const grupos = Object.keys(dataMapped);
      setGrupos(grupos);
      setDepartamentosPorGrupo(dataMapped);
      setGrupoSeleccionado(grupos[0]);

      setGastoMesActual(resGasto.data);

      // Calcular suma total de alícuotas
      let sumaAlicuotas = 0;
      Object.values(dataMapped).forEach((deptos) => {
        deptos.forEach((d) => {
          sumaAlicuotas += d.alicuota ?? 0;
        });
      });

      // Redondear suma alícuotas a 3 decimales para evitar imprecisiones
      sumaAlicuotas = Number(sumaAlicuotas.toFixed(3));
      setTotalAlicuotas(sumaAlicuotas);

      const montoTotal = resGasto.data?.montoTotal ?? 0;
      const valorUnidad = sumaAlicuotas > 0 ? montoTotal / sumaAlicuotas : 0;
      setValorPorUnidad(valorUnidad);

      // Mostrar aviso si suma alícuotas es menor a 1 (exclusivo)
      setMostrarAvisoAlicuota(sumaAlicuotas < 1);
    } catch (error) {
      message.error("Error cargando datos");
      console.error(error);
    }
  }

  // Carga inicial
  useEffect(() => {
    fetchData();
  }, [condominioId]);

  // --- Validación dinámica para saber si puede guardar ---
  const puedeGuardar = useMemo(() => {
    if (departamentosSeleccionados.length === 0) return false;
    if (alicuota <= 0) return false;

    let sumaActualSinSeleccionados = 0;
    Object.values(departamentosPorGrupo).forEach((deptos) => {
      deptos.forEach((d) => {
        if (!departamentosSeleccionados.includes(d._id)) {
          sumaActualSinSeleccionados += d.alicuota ?? 0;
        }
      });
    });

    const sumaNueva = sumaActualSinSeleccionados + alicuota * departamentosSeleccionados.length;
    return sumaNueva <= 1.001;
  }, [alicuota, departamentosSeleccionados, departamentosPorGrupo]);

  // --- Función para asignar alícuotas y validar antes de guardar ---
  const handleAsignarAlicuota = async () => {
    if (!condominioId) return;

    // Validar que la suma total de alícuotas no sea mayor a 1 (tolerancia 0.001)
    let sumaActualSinSeleccionados = 0;
    Object.values(departamentosPorGrupo).forEach((deptos) => {
      deptos.forEach((d) => {
        if (!departamentosSeleccionados.includes(d._id)) {
          sumaActualSinSeleccionados += d.alicuota ?? 0;
        }
      });
    });

    const sumaNueva = sumaActualSinSeleccionados + alicuota * departamentosSeleccionados.length;

    if (sumaNueva > 1.001) {
      message.error(
        `La suma total de alícuotas no puede ser mayor a 1. Actualmente sería ${sumaNueva.toFixed(
          3
        )}`
      );
      return;
    }

    try {
      await api.put(`/admin/asignar-alicuotas/${condominioId}`, {
        departamentos: departamentosSeleccionados,
        alicuota,
      });
      message.success("Alícuotas asignadas correctamente");

      await fetchData();

      setModalVisible(false);
      setDepartamentosSeleccionados([]);
    } catch (error) {
      message.error("Error asignando alícuotas");
      console.error(error);
    }
  };

  // Columnas con columna extra para valor a pagar
  const columnasDepartamentos = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Número", dataIndex: "number", key: "number" },
    {
      title: "Alícuota",
      dataIndex: "alicuota",
      key: "alicuota",
      render: (value: number) => (value != null ? value.toFixed(2) : "-"),
    },
    {
      title: "Valor a pagar",
      key: "valorAPagar",
      render: (_: any, record: Departamento) => {
        const valor = (record.alicuota ?? 0) * valorPorUnidad;
        return `$${valor.toFixed(2)}`;
      },
    },
  ];

  // Calcular suma total valor a pagar para mostrar en el footer, suma dinámica
  const sumaValorAPagar = useMemo(() => {
    let suma = 0;
    if (departamentosPorGrupo) {
      Object.values(departamentosPorGrupo).forEach((deptos) => {
        deptos.forEach((d) => {
          suma += (d.alicuota ?? 0) * valorPorUnidad;
        });
      });
    }
    return suma;
  }, [departamentosPorGrupo, valorPorUnidad]);

  return (
    <Modal
      title={`Asignar Alícuotas - Condominio: ${condominioName || ""}`}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setModalVisible(false)}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleAsignarAlicuota}
          disabled={!puedeGuardar}
        >
          Guardar Alícuota
        </Button>,
      ]}
      width={700}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* Mostrar gasto mensual actual */}
        {gastoMesActual ? (
          <div style={{ marginBottom: 12 }}>
            <Title level={5}>Gasto mensual ({gastoMesActual.mes}):</Title>
            <Text strong style={{ fontSize: 16 }}>
              ${gastoMesActual.montoTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            {gastoMesActual.descripcion && (
              <div>
                <Text type="secondary">{gastoMesActual.descripcion}</Text>
              </div>
            )}
          </div>
        ) : (
          <Text type="secondary" style={{ marginBottom: 12 }}>
            Cargando gasto mensual...
          </Text>
        )}

        {/* Selección de grupo */}
        <Select
          placeholder="Selecciona grupo"
          value={grupoSeleccionado || undefined}
          onChange={(value) => {
            setGrupoSeleccionado(value);
            setDepartamentosSeleccionados([]);
          }}
          style={{ width: "200px" }}
        >
          {grupos.map((g) => (
            <Option key={g} value={g}>
              Grupo {g}
            </Option>
          ))}
        </Select>

        {/* Tabla departamentos con columna valor a pagar */}
        <Table
          columns={columnasDepartamentos}
          dataSource={
            grupoSeleccionado
              ? departamentosPorGrupo?.[grupoSeleccionado] || []
              : []
          }
          rowKey="_id"
          pagination={false}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: departamentosSeleccionados,
            onChange: (selectedRowKeys) =>
              setDepartamentosSeleccionados(selectedRowKeys as string[]),
          }}
          footer={() => (
            <>
              <div style={{ textAlign: "right", fontWeight: "bold" }}>
                Total Alícuotas: {totalAlicuotas.toFixed(2)} | Total Valor a pagar: $
                {sumaValorAPagar.toFixed(2)}
              </div>
              {mostrarAvisoAlicuota && (
                <Alert
                  style={{ marginTop: 8 }}
                  message="La suma total de alícuotas es menor a 1."
                  type="warning"
                  showIcon
                />
              )}
            </>
          )}
        />

        {/* Input número alícuota */}
        <InputNumber
          min={0}
          max={1}
          step={0.001}
          style={{ width: "100%", marginTop: 12 }}
          placeholder="Alícuota (0 - 1)"
          value={alicuota}
          onChange={(value) => setAlicuota(value ?? 0)}
        />
      </Space>
    </Modal>
  );
}
