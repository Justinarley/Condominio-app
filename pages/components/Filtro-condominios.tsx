import { useEffect, useState } from "react";
import { Select, Spin } from "antd";
import api from "@/libs/axios";

type Condominio = {
  _id: string;
  id: string;
  name: string;
};

type Props = {
  onChange: (condominioId: string | null) => void;
  value?: string | null;
  superAdmin?: boolean;
};

export function CondominioSelect({ onChange, value, superAdmin = false }: Props) {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCondominios() {
      setLoading(true);
      try {
        const url = superAdmin ? "/condominios" : "/admin/condominios"
        const res = await api.get(url);
        setCondominios(res.data);
      } catch (error) {
        console.error("Error cargando condominios:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCondominios();
  }, [superAdmin]);

  return (
    <Select
      showSearch
      placeholder="Seleccione un condominio"
      loading={loading}
      allowClear
      onChange={onChange}
      value={value || undefined}
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.children as unknown as string)
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      style={{ width: 250 }}
    >
      {condominios.map((condo) => (
        <Select.Option key={condo._id} value={condo._id}>
          {condo.id} - {condo.name}
        </Select.Option>
      ))}
    </Select>
  );
}
