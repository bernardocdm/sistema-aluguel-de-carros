import { useState, useEffect, useCallback } from 'react';
import { Car, ClipboardList, CalendarDays } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../../components/Layout';
import { getAutomoveisDisponiveis } from '../../api/automoveis';
import { getPedidos, criarPedido } from '../../api/pedidos';
import { getClientes } from '../../api/clientes';
import { useAuth } from '../../context/AuthContext';
import ModalPedido from '../../components/cliente/ModalPedido';

export default function PortalCliente() {
  const { usuario } = useAuth();
  const [automoveis, setAutomoveis] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [automovelSelecionado, setAutomovelSelecionado] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      const [autos, peds] = await Promise.all([
        getAutomoveisDisponiveis(),
        getPedidos(usuario.id),
      ]);
      setAutomoveis(autos);
      setPedidos(peds);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleAlugar = (auto) => {
    setAutomovelSelecionado(auto);
    setModalAberto(true);
  };

  const handleConfirmarPedido = async (dados) => {
    try {
      await criarPedido(dados);
      toast.success('Pedido realizado com sucesso!');
      setModalAberto(false);
      setAutomovelSelecionado(null);
      await carregarDados();
    } catch {
      toast.error('Erro ao criar pedido');
    }
  };

  const pedidoStatusColor = {
    pendente: 'bg-yellow-100 text-yellow-700',
    ativo: 'bg-blue-100 text-blue-700',
    concluido: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  };

  if (carregando) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Portal do Cliente</h2>
        <p className="text-slate-500 text-sm">Bem-vindo, {usuario?.nome}. Explore nosso catálogo.</p>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <Car size={20} className="text-blue-600" />
          <h3 className="font-bold text-slate-900 text-lg">Catálogo de Veículos</h3>
          <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            {automoveis.length} disponível{automoveis.length !== 1 ? 'is' : ''}
          </span>
        </div>

        {automoveis.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-slate-500">
            <Car size={40} className="mx-auto mb-3 text-slate-300" />
            <p>Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {automoveis.map((auto) => (
              <div
                key={auto.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {auto.urlImagem ? (
                    <img
                      src={auto.urlImagem}
                      alt={`${auto.marca} ${auto.modelo}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full items-center justify-center flex-col gap-2 ${auto.urlImagem ? 'hidden' : 'flex'}`}
                    style={{ display: auto.urlImagem ? 'none' : 'flex' }}
                  >
                    <Car size={48} className="text-slate-300" />
                    <span className="text-xs text-slate-400">Sem imagem</span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 text-base">
                    {auto.marca} {auto.modelo}
                  </h4>
                  <p className="text-slate-500 text-sm mb-3">Ano: {auto.ano}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Diária</span>
                      <p className="font-bold text-blue-600 text-base">
                        {Number(auto.valorDiaria).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAlugar(auto)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Alugar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <ClipboardList size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900">Meus Pedidos</h3>
        </div>
        {pedidos.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ClipboardList size={40} className="mx-auto mb-3 text-slate-300" />
            <p>Nenhum pedido realizado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-slate-500">#{p.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {p.automovel ? `${p.automovel.marca} ${p.automovel.modelo}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 flex items-center gap-1">
                      <CalendarDays size={13} className="text-slate-400" />
                      {p.dataInicio} → {p.dataFim}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${pedidoStatusColor[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAberto && automovelSelecionado && (
        <ModalPedido
          automovel={automovelSelecionado}
          clientes={[]}
          onConfirmar={handleConfirmarPedido}
          onFechar={() => { setModalAberto(false); setAutomovelSelecionado(null); }}
        />
      )}
    </Layout>
  );
}
