import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, CalendarDays, Car, Circle as XCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../../components/Layout';
import { getPedidos, atualizarStatusPedido } from '../../api/pedidos';

const STATUS_COLOR = {
  pendente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  solicitado: 'bg-orange-100 text-orange-700 border-orange-200',
  aprovado: 'bg-blue-100 text-blue-700 border-blue-200',
  recusado: 'bg-red-100 text-red-700 border-red-200',
  finalizado: 'bg-green-100 text-green-700 border-green-200',
  cancelado: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelado_pelo_cliente: 'bg-rose-100 text-rose-700 border-rose-200',
};

const STATUS_LABEL = {
  pendente: 'Pendente',
  solicitado: 'Solicitado',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
  cancelado_pelo_cliente: 'Cancelado por mim',
};

const CANCELAVEIS = ['pendente', 'solicitado'];

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [cancelando, setCancelando] = useState(null);

  const carregarPedidos = useCallback(async () => {
    try {
      const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
      const dados = await getPedidos(usuario.id);
      setPedidos(dados);
    } catch {
      toast.error('Erro ao carregar seus pedidos');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  const calcularDias = (inicio, fim) => {
    if (!inicio || !fim) return 1;
    return Math.max(1, Math.ceil((new Date(fim) - new Date(inicio)) / (1000 * 60 * 60 * 24)));
  };

  const calcularValorTotal = (pedido) => {
    const dias = calcularDias(pedido.dataInicio, pedido.dataFim);
    const diaria = Number(pedido.automovel?.valorDiaria ?? 0);
    return (diaria * dias).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const cancelarPedido = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return;
    setCancelando(id);
    try {
      await atualizarStatusPedido(id, 'cancelado_pelo_cliente');
      toast.success('Pedido cancelado com sucesso.');
      await carregarPedidos();
    } catch {
      toast.error('Erro ao cancelar pedido. Tente novamente.');
    } finally {
      setCancelando(null);
    }
  };

  const pedidosFiltrados = filtroStatus
    ? pedidos.filter((p) => p.status === filtroStatus)
    : pedidos;

  const FILTROS = ['', 'pendente', 'solicitado', 'aprovado', 'recusado', 'finalizado', 'cancelado', 'cancelado_pelo_cliente'];

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Meus Pedidos</h2>
        <p className="text-slate-500 text-sm">Acompanhe o histórico e status das suas reservas</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', valor: pedidos.length, cor: 'border-slate-200 bg-white', texto: 'text-slate-800' },
          { label: 'Pendentes', valor: pedidos.filter((p) => p.status === 'pendente' || p.status === 'solicitado').length, cor: 'border-yellow-200 bg-yellow-50', texto: 'text-yellow-700' },
          { label: 'Aprovados', valor: pedidos.filter((p) => p.status === 'aprovado').length, cor: 'border-blue-200 bg-blue-50', texto: 'text-blue-700' },
          { label: 'Finalizados', valor: pedidos.filter((p) => p.status === 'finalizado').length, cor: 'border-green-200 bg-green-50', texto: 'text-green-700' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-4 shadow-sm ${item.cor}`}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</p>
            <p className={`text-2xl font-bold mt-1 ${item.texto}`}>{item.valor}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-3 flex-wrap">
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

      {carregando ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 text-center text-slate-400">
          <ClipboardList size={36} className="mx-auto mb-3 opacity-40" />
          <p>Carregando seus pedidos...</p>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 text-center text-slate-400">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
          <p>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex items-stretch">
                <div className="w-28 bg-slate-100 flex items-center justify-center shrink-0">
                  {p.automovel?.urlImagem ? (
                    <img
                      src={p.automovel.urlImagem}
                      alt={`${p.automovel.marca} ${p.automovel.modelo}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center"
                    style={{ display: p.automovel?.urlImagem ? 'none' : 'flex' }}
                  >
                    <Car size={28} className="text-slate-300" />
                  </div>
                </div>

                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400 font-medium">Pedido #{p.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {p.automovel ? `${p.automovel.marca} ${p.automovel.modelo}` : 'Veículo não encontrado'}
                      </h3>
                      {p.automovel && (
                        <p className="text-slate-500 text-sm">Ano {p.automovel.ano} · Placa {p.automovel.placa}</p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div>
                        <p className="text-xs text-slate-400">Valor total</p>
                        <p className="font-bold text-blue-600 text-lg">{calcularValorTotal(p)}</p>
                        <p className="text-xs text-slate-400">{calcularDias(p.dataInicio, p.dataFim)} dia(s)</p>
                      </div>
                      {CANCELAVEIS.includes(p.status) && (
                        <button
                          onClick={() => cancelarPedido(p.id)}
                          disabled={cancelando === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition disabled:opacity-50"
                        >
                          <XCircle size={13} />
                          {cancelando === p.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                    <CalendarDays size={14} className="text-slate-400" />
                    <span>
                      {p.dataInicio} → {p.dataFim}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
