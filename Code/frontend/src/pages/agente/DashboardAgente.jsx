import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ClipboardList, DollarSign, ArrowRight, Users } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../../components/Layout';
import { getAutomoveis } from '../../api/automoveis';
import { getPedidos } from '../../api/pedidos';
import { getClientes } from '../../api/clientes';

const STATUS_COLOR_AUTO = {
  disponivel: 'bg-green-100 text-green-700',
  alugado: 'bg-blue-100 text-blue-700',
  manutencao: 'bg-yellow-100 text-yellow-700',
};

const STATUS_COLOR_PEDIDO = {
  pendente: 'bg-yellow-100 text-yellow-700',
  ativo: 'bg-blue-100 text-blue-700',
  concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
};

export default function DashboardAgente() {
  const navigate = useNavigate();
  const [automoveis, setAutomoveis] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async () => {
    try {
      const [autos, peds, clts] = await Promise.all([getAutomoveis(), getPedidos(), getClientes()]);
      setAutomoveis(autos);
      setPedidos(peds);
      setClientes(clts);
    } catch {
      toast.error('Erro ao carregar dados do servidor');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const totalVeiculos = automoveis.length;
  const veiculosDisponiveis = automoveis.filter((a) => a.status === 'disponivel').length;
  const pedidosPendentes = pedidos.filter((p) => p.status === 'pendente').length;
  const totalClientes = clientes.length;

  const lucroTotal = pedidos
    .filter((p) => p.status === 'concluido')
    .reduce((acc, p) => {
      const dias = Math.max(
        1,
        Math.ceil((new Date(p.dataFim) - new Date(p.dataInicio)) / (1000 * 60 * 60 * 24))
      );
      return acc + Number(p.automovel?.valorDiaria ?? 0) * dias;
    }, 0);

  if (carregando) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-400">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h2>
        <p className="text-slate-500 text-sm">Visão geral do sistema de aluguel de carros</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Car className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Veículos</p>
            <p className="text-2xl font-bold text-slate-900">{totalVeiculos}</p>
            <p className="text-xs text-green-600">{veiculosDisponiveis} disponíveis</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
            <ClipboardList className="text-yellow-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Pedidos</p>
            <p className="text-2xl font-bold text-slate-900">{pedidos.length}</p>
            <p className="text-xs text-yellow-600">{pedidosPendentes} pendentes</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Users className="text-slate-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Clientes</p>
            <p className="text-2xl font-bold text-slate-900">{totalClientes}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <DollarSign className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Lucro Total</p>
            <p className="text-xl font-bold text-slate-900">
              {lucroTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Car size={16} className="text-blue-600" /> Últimos Veículos
            </h3>
            <button
              onClick={() => navigate('/agente/estoque')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          {automoveis.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">Nenhum veículo cadastrado.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {automoveis.slice(0, 5).map((a) => (
                <div key={a.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 rounded bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      {a.urlImagem ? (
                        <img src={a.urlImagem} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <Car size={14} className="text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.marca} {a.modelo}</p>
                      <p className="text-xs text-slate-400">{a.placa} · {a.ano}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR_AUTO[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {a.status === 'disponivel' ? 'Disponível' : a.status === 'alugado' ? 'Alugado' : 'Manutenção'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList size={16} className="text-blue-600" /> Pedidos Recentes
            </h3>
            <button
              onClick={() => navigate('/agente/pedidos')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          {pedidos.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">Nenhum pedido registrado.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pedidos.slice(0, 5).map((p) => (
                <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">#{p.id} · {p.cliente?.nome ?? '-'}</p>
                    <p className="text-xs text-slate-400">
                      {p.automovel ? `${p.automovel.marca} ${p.automovel.modelo}` : '-'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLOR_PEDIDO[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {p.status === 'pendente' ? 'Pendente' : p.status === 'ativo' ? 'Ativo' : p.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
