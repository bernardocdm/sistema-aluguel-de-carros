import { useState, useEffect, useCallback } from 'react';
import { Car, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../../components/Layout';
import { getAutomoveis, criarAutomovel, atualizarAutomovel, deletarAutomovel } from '../../api/automoveis';
import ModalAutomovel from '../../components/agente/ModalAutomovel';

const STATUS_COLOR = {
  disponivel: 'bg-green-100 text-green-700',
  alugado: 'bg-blue-100 text-blue-700',
  manutencao: 'bg-yellow-100 text-yellow-700',
};

export default function EstoqueAgente() {
  const [automoveis, setAutomoveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [automovelEditando, setAutomovelEditando] = useState(null);
  const [busca, setBusca] = useState('');

  const carregarAutomoveis = useCallback(async () => {
    try {
      const dados = await getAutomoveis();
      setAutomoveis(dados);
    } catch {
      toast.error('Erro ao carregar veículos');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarAutomoveis();
  }, [carregarAutomoveis]);

  const handleSalvar = async (dados) => {
    try {
      if (automovelEditando) {
        await atualizarAutomovel(automovelEditando.id, dados);
        toast.success('Veículo atualizado com sucesso!');
      } else {
        await criarAutomovel(dados);
        toast.success('Veículo cadastrado com sucesso!');
      }
      setModalAberto(false);
      setAutomovelEditando(null);
      await carregarAutomoveis();
    } catch {
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleDeletar = async (id, nome) => {
    if (!window.confirm(`Excluir o veículo "${nome}"?`)) return;
    try {
      await deletarAutomovel(id);
      toast.success('Veículo excluído!');
      await carregarAutomoveis();
    } catch {
      toast.error('Erro ao excluir veículo');
    }
  };

  const abrirEditar = (auto) => {
    setAutomovelEditando(auto);
    setModalAberto(true);
  };

  const abrirNovo = () => {
    setAutomovelEditando(null);
    setModalAberto(true);
  };

  const automovelFiltrado = automoveis.filter((a) =>
    busca.trim() === '' ||
    `${a.marca} ${a.modelo} ${a.placa}`.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Gestão de Estoque</h2>
          <p className="text-slate-500 text-sm">Gerencie os veículos disponíveis para aluguel</p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Novo Veículo
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por marca, modelo ou placa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {carregando ? (
          <div className="py-20 text-center text-slate-400">
            <Car size={36} className="mx-auto mb-3 opacity-40" />
            <p>Carregando veículos...</p>
          </div>
        ) : automovelFiltrado.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Car size={40} className="mx-auto mb-3 opacity-40" />
            <p className="mb-4">{busca ? 'Nenhum veículo encontrado.' : 'Nenhum veículo cadastrado.'}</p>
            {!busca && (
              <button
                onClick={abrirNovo}
                className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Cadastrar primeiro veículo
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Imagem</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Veículo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Placa</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Ano</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Diária</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {automovelFiltrado.map((a) => (
                    <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-3">
                        <div className="w-16 h-12 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center">
                          {a.urlImagem ? (
                            <img
                              src={a.urlImagem}
                              alt={`${a.marca} ${a.modelo}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full items-center justify-center"
                            style={{ display: a.urlImagem ? 'none' : 'flex' }}
                          >
                            <Car size={20} className="text-slate-300" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-900">{a.marca} {a.modelo}</td>
                      <td className="px-6 py-3 text-slate-600">{a.placa}</td>
                      <td className="px-6 py-3 text-slate-600">{a.ano}</td>
                      <td className="px-6 py-3 text-slate-700 font-medium">
                        {Number(a.valorDiaria).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLOR[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {a.status === 'disponivel' ? 'Disponível' : a.status === 'alugado' ? 'Alugado' : 'Manutenção'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => abrirEditar(a)}
                            className="flex items-center gap-1 px-3 py-1.5 text-blue-600 border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-50 transition"
                          >
                            <Pencil size={12} /> Editar
                          </button>
                          <button
                            onClick={() => handleDeletar(a.id, `${a.marca} ${a.modelo}`)}
                            className="flex items-center gap-1 px-3 py-1.5 text-red-600 border border-red-200 rounded-md text-xs font-medium hover:bg-red-50 transition"
                          >
                            <Trash2 size={12} /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-slate-500">
              {automovelFiltrado.length} veículo(s) encontrado(s)
            </div>
          </>
        )}
      </div>

      {modalAberto && (
        <ModalAutomovel
          automovel={automovelEditando}
          onSalvar={handleSalvar}
          onFechar={() => { setModalAberto(false); setAutomovelEditando(null); }}
        />
      )}
    </Layout>
  );
}
