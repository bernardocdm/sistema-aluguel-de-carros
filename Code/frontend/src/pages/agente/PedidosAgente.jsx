import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, CalendarDays, Car, User, FileText, CircleCheck as CheckCircle, Circle as XCircle, FlagTriangleRight, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../../components/Layout';
import { getPedidos, atualizarStatusPedido, deletarPedido } from '../../api/pedidos';

const STATUS_COLOR = {
  pendente: 'bg-yellow-100 text-yellow-700',
  aprovado: 'bg-blue-100 text-blue-700',
  recusado: 'bg-red-100 text-red-700',
  finalizado: 'bg-green-100 text-green-700',
  cancelado: 'bg-slate-100 text-slate-600',
  cancelado_pelo_cliente: 'bg-rose-100 text-rose-700',
};

const STATUS_LABEL = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
  cancelado_pelo_cliente: 'Cancelado pelo cliente',
};

const FILTROS = ['', 'pendente', 'aprovado', 'recusado', 'finalizado', 'cancelado'];

export default function PedidosAgente() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  const carregarPedidos = useCallback(async () => {
    try {
      const dados = await getPedidos();
      setPedidos(dados);
    } catch {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  const handleAtualizarStatus = async (id, novoStatus) => {
    setAtualizando(true);
    try {
      await atualizarStatusPedido(id, novoStatus);
      toast.success(`Status alterado para "${STATUS_LABEL[novoStatus] ?? novoStatus}"`);
      await carregarPedidos();
      setPedidoSelecionado((prev) =>
        prev?.id === id ? { ...prev, status: novoStatus } : prev
      );
    } catch {
      toast.error('Erro ao atualizar status');
    } finally {
      setAtualizando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir este pedido?')) return;
    try {
      await deletarPedido(id);
      toast.success('Pedido excluído!');
      setPedidoSelecionado(null);
      await carregarPedidos();
    } catch {
      toast.error('Erro ao excluir pedido');
    }
  };

  const calcularDias = (inicio, fim) => {
    if (!inicio || !fim) return 1;
    return Math.max(1, Math.ceil((new Date(fim) - new Date(inicio)) / (1000 * 60 * 60 * 24)));
  };

  const calcularValor = (pedido) => {
    const dias = calcularDias(pedido.dataInicio, pedido.dataFim);
    const diaria = Number(pedido.automovel?.valorDiaria ?? 0);
    return (diaria * dias).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const pedidosFiltrados = filtroStatus
    ? pedidos.filter((p) => p.status === filtroStatus)
    : pedidos;

  const contadores = {
    total: pedidos.length,
    pendente: pedidos.filter((p) => p.status === 'pendente').length,
    aprovado: pedidos.filter((p) => p.status === 'aprovado').length,
    finalizado: pedidos.filter((p) => p.status === 'finalizado').length,
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Gestão de Pedidos</h2>
        <p className="text-slate-500 text-sm">Aprove, recuse ou finalize as reservas dos clientes</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', valor: contadores.total, cor: 'border-slate-200 bg-white', texto: 'text-slate-800' },
          { label: 'Pendentes', valor: contadores.pendente, cor: 'border-yellow-200 bg-yellow-50', texto: 'text-yellow-700' },
          { label: 'Aprovados', valor: contadores.aprovado, cor: 'border-blue-200 bg-blue-50', texto: 'text-blue-700' },
          { label: 'Finalizados', valor: contadores.finalizado, cor: 'border-green-200 bg-green-50', texto: 'text-green-700' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-4 shadow-sm ${item.cor}`}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</p>
            <p className={`text-2xl font-bold mt-1 ${item.texto}`}>{item.valor}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-600 font-medium">Filtrar:</span>
        {FILTROS.map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              filtroStatus === status
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-gray-300 text-slate-600 hover:bg-gray-50'
            }`}
          >
            {status === '' ? 'Todos' : STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-w-0">
          {carregando ? (
            <div className="py-20 text-center text-slate-400">
              <ClipboardList size={36} className="mx-auto mb-3 opacity-40" />
              <p>Carregando pedidos...</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
              <p>Nenhum pedido encontrado.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">#</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Cliente</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Veículo</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Período</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Valor</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setPedidoSelecionado(p)}
                        className={`border-t border-gray-100 cursor-pointer transition ${
                          pedidoSelecionado?.id === p.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-5 py-3.5 text-slate-500 font-medium">#{p.id}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{p.cliente?.nome ?? '-'}</td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {p.automovel ? `${p.automovel.marca} ${p.automovel.modelo}` : '-'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">
                          <div className="flex items-center gap-1">
                            <CalendarDays size={12} className="shrink-0" />
                            {p.dataInicio} → {p.dataFim}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{calcularValor(p)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-slate-500">
                {pedidosFiltrados.length} pedido(s) — clique em um para ver detalhes e ações
              </div>
            </>
          )}
        </div>

        {pedidoSelecionado && (
          <DetailPanel
            pedido={pedidoSelecionado}
            atualizando={atualizando}
            calcularDias={calcularDias}
            calcularValor={calcularValor}
            onAtualizarStatus={handleAtualizarStatus}
            onExcluir={handleExcluir}
            onFechar={() => setPedidoSelecionado(null)}
          />
        )}
      </div>
    </Layout>
  );
}

function DetailPanel({ pedido, atualizando, calcularDias, calcularValor, onAtualizarStatus, onExcluir, onFechar }) {
  const isPendente = pedido.status === 'pendente';
  const isAprovado = pedido.status === 'aprovado';

  return (
    <div className="w-80 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden self-start">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-slate-900 text-sm">Detalhes — Pedido #{pedido.id}</h3>
        <button onClick={onFechar} className="text-slate-400 hover:text-slate-600 transition">
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <InfoRow icon={User} label="Cliente" value={pedido.cliente?.nome ?? '-'} />
        <InfoRow
          icon={Car}
          label="Veículo"
          value={pedido.automovel ? `${pedido.automovel.marca} ${pedido.automovel.modelo} (${pedido.automovel.ano})` : '-'}
        />
        <InfoRow
          icon={CalendarDays}
          label="Período"
          value={`${pedido.dataInicio} → ${pedido.dataFim} · ${calcularDias(pedido.dataInicio, pedido.dataFim)} dia(s)`}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium">Valor Total</span>
          <span className="font-bold text-blue-600 text-base">{calcularValor(pedido)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium">Status</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[pedido.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABEL[pedido.status] ?? pedido.status}
          </span>
        </div>

        {pedido.objetivo && (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText size={13} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Objetivo</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{pedido.objetivo}</p>
          </div>
        )}

        <div className="pt-1 space-y-2">
          {isPendente && (
            <>
              <button
                disabled={atualizando}
                onClick={() => onAtualizarStatus(pedido.id, 'aprovado')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                <CheckCircle size={16} />
                Aprovar
              </button>
              <button
                disabled={atualizando}
                onClick={() => onAtualizarStatus(pedido.id, 'recusado')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                <XCircle size={16} />
                Recusar
              </button>
            </>
          )}
          {isAprovado && (
            <button
              disabled={atualizando}
              onClick={() => onAtualizarStatus(pedido.id, 'finalizado')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              <FlagTriangleRight size={16} />
              Concluir (Carro Devolvido)
            </button>
          )}
          <button
            onClick={() => onExcluir(pedido.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-slate-500 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
          >
            Excluir Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium mb-0.5">{label}</p>
        <p className="text-slate-800 font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}
