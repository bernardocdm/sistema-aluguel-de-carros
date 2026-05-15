import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getClientes, deletarCliente } from '../api/clientes';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Users } from 'lucide-react';
import Layout from '../components/Layout';

const Listar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const busca = searchParams.get('busca') || '';

  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setCarregando(true);
        const dados = await getClientes();
        if (busca) {
          const filtrados = dados.filter(c =>
            c.nome.toLowerCase().includes(busca.toLowerCase())
          );
          setClientes(filtrados);
        } else {
          setClientes(dados);
        }
        setErro('');
      } catch (err) {
        console.error('Erro ao carregar clientes:', err);
        setErro('Erro ao carregar clientes');
        toast.error('Erro ao carregar clientes');
      } finally {
        setCarregando(false);
      }
    };
    carregarClientes();
  }, [busca]);

  const handleBusca = (e) => {
    e.preventDefault();
    const termoBusca = e.target.elements.busca.value;
    if (termoBusca.trim()) {
      setSearchParams({ busca: termoBusca });
    } else {
      setSearchParams({});
    }
  };

  const handleExcluir = async (id, nome) => {
    if (!window.confirm(`Deseja excluir o cliente "${nome}"?`)) return;
    try {
      await deletarCliente(id);
      setClientes(clientes.filter(c => c.id !== id));
      toast.success('Cliente excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir:', err);
      toast.error('Erro ao excluir cliente');
    }
  };

  const formatarCPF = (cpf) => {
    if (!cpf) return '-';
    const digits = cpf.replace(/\D/g, '');
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  };

  const formatarRG = (rg) => {
    if (!rg) return '-';
    return rg.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
  };

  const calcularRendimentoTotal = (cliente) => {
    const values = [cliente.rendimento1, cliente.rendimento2, cliente.rendimento3].filter(v => v);
    const total = values.reduce((sum, v) => sum + (v || 0), 0);
    return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Clientes Cadastrados</h2>
          <p className="text-slate-500 text-sm">Gerencie o cadastro de clientes do sistema</p>
        </div>
        <button
          onClick={() => navigate('/clientes/novo')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      <form onSubmit={handleBusca} className="flex gap-2 mb-5">
        <input
          type="text"
          name="busca"
          placeholder="Buscar por nome..."
          defaultValue={busca}
          className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition"
        >
          Buscar
        </button>
        {busca && (
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 transition"
          >
            Limpar
          </button>
        )}
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {carregando ? (
          <div className="text-center py-20 text-slate-400">
            <Users size={36} className="mx-auto mb-3 opacity-40" />
            <p>Carregando clientes...</p>
          </div>
        ) : erro ? (
          <div className="text-center py-12">
            <p className="text-red-600">{erro}</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-40" />
            <p className="mb-4">Nenhum cliente encontrado.</p>
            <button
              onClick={() => navigate('/clientes/novo')}
              className="px-5 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition"
            >
              Cadastrar primeiro cliente
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">CPF</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">RG</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Profissão</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Rendimento Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Endereço</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {cliente.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{cliente.nome}</td>
                      <td className="px-6 py-4 text-slate-600">{formatarCPF(cliente.cpf)}</td>
                      <td className="px-6 py-4 text-slate-600">{formatarRG(cliente.rg)}</td>
                      <td className="px-6 py-4 text-slate-600">{cliente.profissao}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{calcularRendimentoTotal(cliente)}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{cliente.endereco}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleExcluir(cliente.id, cliente.nome)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 transition"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-slate-500">
              Total: {clientes.length} cliente(s) encontrado(s)
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Listar;
