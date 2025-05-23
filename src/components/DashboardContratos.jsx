import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CCardTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from "@coreui/react";
import { CChartPie, CChartBar } from "@coreui/react-chartjs";
import { cilList, cilCheckCircle, cilBan, cilXCircle, cilClock } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import dayjs from "dayjs";
import contratosData from "../data/contratos_detalhados.json";
import "dayjs/locale/pt-br";

export default function DashboardContratos() {
  const [ativos, setAtivos] = useState(0);
  const [encerrados, setEncerrados] = useState(0);
  const [cancelados, setCancelados] = useState(0);
  const [contratosProximos, setContratosProximos] = useState([]);
  const [entregaveisProximos, setEntregaveisProximos] = useState([]);
  const [tiposContrato, setTiposContrato] = useState({});
  const [entregaveisPorMes, setEntregaveisPorMes] = useState({});

  useEffect(() => {
    const hoje = dayjs();
    const contratosProx = [];
    const entregaveisProx = [];
    const tipos = {};
    const entregaveisMeses = {};

    let ativos = 0,
      encerrados = 0,
      cancelados = 0;

    contratosData.forEach((contrato) => {
      const status = contrato.status.descricao;
      if (status === "Ativo") ativos++;
      else if (status === "Encerrado") encerrados++;
      else if (status === "Cancelado") cancelados++;

      // Tipos apenas dos contratos ativos
      if (status === "Ativo") {
        const tipo = contrato.tipo_contrato;
        tipos[tipo] = (tipos[tipo] || 0) + 1;
      }

      const dataFinal = dayjs(contrato.data_final);
      const diasRestantes = dataFinal.diff(hoje, "day");
      if (diasRestantes <= 30 && diasRestantes >= 0) {
        contratosProx.push({
          id: contrato.id_contrato,
          descricao: contrato.descricao,
          dataFinal: dataFinal.format("DD/MM/YYYY"),
          diasRestantes,
          empresa: contrato.empresa.nome_fantasia,
        });
      }

      contrato.entregaveis?.forEach((entregavel) => {
        if (entregavel.data_entrega) {
          const dataEntrega = dayjs(entregavel.data_entrega);
          const diasEntrega = dataEntrega.diff(hoje, "day");
          if (diasEntrega <= 30 && diasEntrega >= 0) {
            entregaveisProx.push({
              id: entregavel.id_entregavel,
              descricao: entregavel.descricao,
              dataEntrega: dataEntrega.format("DD/MM/YYYY"),
              diasRestantes: diasEntrega,
              empresa: contrato.empresa.nome_fantasia,
            });
          }

          // Gráfico entregáveis por mês
          const mesAno = dataEntrega.format("MMMM/YYYY");
          entregaveisMeses[mesAno] = (entregaveisMeses[mesAno] || 0) + 1;
        }
      });
    });

    setAtivos(ativos);
    setEncerrados(encerrados);
    setCancelados(cancelados);
    setContratosProximos(
      contratosProx.sort((a, b) => a.diasRestantes - b.diasRestantes)
    );
    setEntregaveisProximos(
      entregaveisProx.sort((a, b) => a.diasRestantes - b.diasRestantes)
    );
    setTiposContrato(tipos);

    const mesesFuturos = Array.from({ length: 6 }).map((_, i) =>
      hoje.add(i, "month").format("MMMM/YYYY")
    );

    const entregaveisFinais = {};
    mesesFuturos.forEach((mes) => {
      entregaveisFinais[mes] = entregaveisMeses[mes] || 0;
    });

    setEntregaveisPorMes(entregaveisFinais);
  }, []);

  const totalContratos = ativos + encerrados + cancelados;

  const prioridade = (dias) => {
    if (dias <= 10) return <CBadge style={{ backgroundColor: '#FF0000' }}>Máxima</CBadge>;
    if (dias <= 20) return <CBadge style={{ backgroundColor: '#FF4D00' }}>Muito urgente</CBadge>;
    return <CBadge color="warning">Urgente</CBadge>;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Cards principais */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CCard>
            <CCardBody className="d-flex align-items-start gap-3">
              <CIcon icon={cilList} size="xl" className="text-info"/>
              <div>
                <CCardTitle className="h6">Total de Contratos</CCardTitle>
                <p className="fs-4 mb-0">{totalContratos}</p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="d-flex align-items-start gap-3">
              <CIcon icon={cilClock} size="xl" className="text-primary"/>
              <div>
                <CCardTitle className="h6">Ativos</CCardTitle>
                <p className="fs-4 mb-0">{ativos}</p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="d-flex align-items-start gap-3">
              <CIcon icon={cilCheckCircle} size="xl" className="text-success"/>
              <div>
                <CCardTitle className="h6">Encerrados</CCardTitle>
                <p className="fs-4 mb-0">{encerrados}</p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="d-flex align-items-start gap-3">
              <CIcon icon={cilBan} size="xl" className="text-danger"/>
              <div>
                <CCardTitle className="h6">Cancelados</CCardTitle>
                <p className="fs-4 mb-0">{cancelados}</p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Gráficos */}
      <CRow className="mb-4">
        <CCol md={4}>
          <CCard className="h-100">
            <CCardHeader>Tipos de Contrato (Ativos)</CCardHeader>
            <CCardBody>
              <CChartPie
                data={{
                  labels: Object.keys(tiposContrato),
                  datasets: [
                    {
                      data: Object.values(tiposContrato),
                      backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                        "#FF9F40",
                      ],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const tipo = context.label;
                          const qtd = context.parsed;
                          const perc = ((qtd / ativos) * 100).toFixed(1);
                          return `${tipo}: ${qtd} (${perc}%)`;
                        },
                      },
                    },
                    animation: {
                      animateScale: true,
                      animateRotate: true,
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={8}>
          <CCard>
            <CCardHeader>Entregáveis por Mês (Próximos 6 meses)</CCardHeader>
            <CCardBody>
              <CChartBar
                data={{
                  labels: Object.keys(entregaveisPorMes),
                  datasets: [
                    {
                      label: "Entregáveis",
                      backgroundColor: "#36A2EB",
                      data: Object.values(entregaveisPorMes),
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                  plugins: {
                    animation: {
                      duration: 1000,
                      easing: "easeInOutBounce",
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Contratos próximos ao vencimento */}
      <CCard className="mb-4">
        <CCardHeader>Contratos Próximos ao Vencimento (30 dias)</CCardHeader>
        <CCardBody>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Descrição</CTableHeaderCell>
                <CTableHeaderCell>Empresa</CTableHeaderCell>
                <CTableHeaderCell>Data Final</CTableHeaderCell>
                <CTableHeaderCell>Dias Restantes</CTableHeaderCell>
                <CTableHeaderCell>Prioridade</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {contratosProximos.map((c) => (
                <CTableRow key={c.id}>
                  <CTableDataCell>{c.descricao}</CTableDataCell>
                  <CTableDataCell>{c.empresa}</CTableDataCell>
                  <CTableDataCell>{c.dataFinal}</CTableDataCell>
                  <CTableDataCell>{c.diasRestantes}</CTableDataCell>
                  <CTableDataCell>{prioridade(c.diasRestantes)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Entregáveis próximos */}
      <CCard>
        <CCardHeader>Entregáveis Próximos (30 dias)</CCardHeader>
        <CCardBody>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Descrição</CTableHeaderCell>
                <CTableHeaderCell>Empresa</CTableHeaderCell>
                <CTableHeaderCell>Data Entrega</CTableHeaderCell>
                <CTableHeaderCell>Dias Restantes</CTableHeaderCell>
                <CTableHeaderCell>Prioridade</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {entregaveisProximos.map((e) => (
                <CTableRow key={e.id}>
                  <CTableDataCell>{e.descricao}</CTableDataCell>
                  <CTableDataCell>{e.empresa}</CTableDataCell>
                  <CTableDataCell>{e.dataEntrega}</CTableDataCell>
                  <CTableDataCell>{e.diasRestantes}</CTableDataCell>
                  <CTableDataCell>{prioridade(e.diasRestantes)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  );
}
