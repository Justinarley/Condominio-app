import { useEffect, useState } from "react";
import api from "@/libs/axios";
import { Card, Statistic, Row, Col, Table, Tag } from "antd";

type Admin = {
  _id: string;
  name: string;
  email: string;
  status: string;
};

type Condominio = {
  _id: string;
  name: string;
  tipo: string;
  status: string;
  address: string;
  adminId: {
    name: string;
    email: string;
  };
};

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminsActivos, setAdminsActivos] = useState<Admin[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [resAdmins, resActivos, resCondominios] = await Promise.all([
        api.get("/admins"),
        api.get("/admins/actives"),
        api.get("/condominios"),
      ]);
      setAdmins(resAdmins.data);
      setAdminsActivos(resActivos.data);
      setCondominios(resCondominios.data);
    };

    fetchData();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-black mb-6">
        Dashboard - Super Admin
      </h1>

      <Row gutter={16} className="mb-8">
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Total de Admins" value={admins.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Admins Activos" value={adminsActivos.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Condominios" value={condominios.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Condominios Activos"
              value={condominios.filter((c) => c.status === "active").length}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Últimos Condominios Creados" className="shadow">
        <Table
          dataSource={condominios.slice(-5).reverse()}
          rowKey="_id"
          pagination={false}
          columns={[
            {
              title: "Nombre",
              dataIndex: "name",
            },
            {
              title: "Tipo",
              dataIndex: "tipo",
              render: (text: string) => (
                <Tag color={text === "torres" ? "blue" : "orange"}>
                  {text === "torres" ? "Torres" : "Casas"}
                </Tag>
              ),
            },
            {
              title: "Dirección",
              dataIndex: "address",
            },
            {
              title: "Admin",
              dataIndex: ["adminId", "name"],
            },
            {
              title: "Email Admin",
              dataIndex: ["adminId", "email"],
            },
            {
              title: "Estado",
              dataIndex: "status",
              render: (text) =>
                text === "active" ? (
                  <span className="text-green-600 font-semibold">Activo</span>
                ) : (
                  <span className="text-red-600 font-semibold">Inactivo</span>
                ),
            },
          ]}
        />
      </Card>
    </>
  );
}
