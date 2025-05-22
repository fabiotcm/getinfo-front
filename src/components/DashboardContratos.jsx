import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardTitle,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from "@coreui/react";
import contratosData from "../data/contratos_detalhados.json";
import dayjs from "dayjs";

export default function DashboardContratos() {
  const [ativos, setAtivos] = useState(0);
  const [encerrados, setEncerrados] = useState(0);
  const [cancelados, setCancelados] = useState(0);
  const [contratosProximos, setContratosProximos] = useState([]);
  const [entregaveisProximos, setEntregaveisProximos] = useState([]);

  useEffect(() => {
    const hoje = dayjs();

    const ativosList = contratosData.filter(
      (c) => c.status.descricao.toLowerCase() === "ativo"
    );
    const encerradosList = contratosData.filter(
      (c) => c.status.descricao.toLowerCase() === "encerrado"
    );
    const canceladosList = contratosData.filter(
      (c) => c.status.descricao.toLowerCase() === "cancelado"
    );

    setAtivos(ativosList.length);
    setEncerrados(encerradosList.length);
    setCancelados(canceladosList.length);

    const contratosVencendo = ativosList.filter((c) => {
      const prazoFinal = dayjs(c.prazo);
      return prazoFinal.diff(hoje, "day") <= 30;
    }).sort((a, b) => dayjs(a.prazo).diff(dayjs(b.prazo)));

    setContratosProximos(contratosVencendo);

    const entregaveisVencendo = [];
    contratosData.forEach((contrato) => {
      contrato.entregaveis.forEach((entregavel) => {
        if (entregavel.data_entrega) {
          const dataEntrega = dayjs(entregavel.data_entrega);
          if (dataEntrega.diff(hoje, "day") <= 30) {
            entregaveisVencendo.push({
              ...entregavel,
              contratoId: contrato.id_contrato,
              empresa: contrato.empresa.nome_fantasia,
              dataEntrega: dataEntrega.format("YYYY-MM-DD"),
            });
          }
        }
      });
    });

    entregaveisVencendo.sort((a, b) => dayjs(a.dataEntrega).diff(dayjs(b.dataEntrega)));
    setEntregaveisProximos(entregaveisVencendo);
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* Cards */}
      <CRow className="mb-4">
        <CCol md={4}>
          <CCard>
            <CCardBody>
              <CCardTitle>Nº de Contratos Ativos</CCardTitle>
              <h2>{ativos}</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard>
            <CCardBody>
              <CCardTitle>Nº de Contratos Encerrados</CCardTitle>
              <h2>{encerrados}</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard>
            <CCardBody>
              <CCardTitle>Nº de Contratos Cancelados</CCardTitle>
              <h2>{cancelados}</h2>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Contratos próximos ao vencimento */}
      <section className="mb-5">
        <h4>Contratos próximos ao vencimento (até 30 dias)</h4>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Contrato</CTableHeaderCell>
              <CTableHeaderCell>Empresa</CTableHeaderCell>
              <CTableHeaderCell>Data Final</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {contratosProximos.map((contrato) => (
              <CTableRow key={contrato.id_contrato}>
                <CTableDataCell>{contrato.descricao}</CTableDataCell>
                <CTableDataCell>{contrato.empresa.nome_fantasia}</CTableDataCell>
                <CTableDataCell>{dayjs(contrato.prazo).format("YYYY-MM-DD")}</CTableDataCell>
                <CTableDataCell>{contrato.status.descricao}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </section>

      {/* Entregáveis próximos ao vencimento */}
      <section>
        <h4>Entregáveis com prazo em até 30 dias</h4>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Entregável</CTableHeaderCell>
              <CTableHeaderCell>Empresa</CTableHeaderCell>
              <CTableHeaderCell>Contrato</CTableHeaderCell>
              <CTableHeaderCell>Data de Entrega</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {entregaveisProximos.map((ent) => (
              <CTableRow key={ent.id_entregavel}>
                <CTableDataCell>{ent.descricao}</CTableDataCell>
                <CTableDataCell>{ent.empresa}</CTableDataCell>
                <CTableDataCell>{ent.contratoId}</CTableDataCell>
                <CTableDataCell>{ent.dataEntrega}</CTableDataCell>
                <CTableDataCell>{ent.status.descricao}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </section>
    </div>
  );
}
