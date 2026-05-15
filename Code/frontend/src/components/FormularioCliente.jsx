import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { criarCliente, atualizarCliente, getClienteById } from '../api/clientes';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './Layout';

const FormularioCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const modo = id ? 'editar' : 'novo';
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      nome: '',
      cpf: '',
      rg: '',
      endereco: '',
      profissao: '',
      rendimento1: '',
      rendimento2: '',
      rendimento3: '',
    }
  });

  const [carregando, setCarregando] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const cpfWatch = watch('cpf');
  const rgWatch = watch('rg');
  // Carregar dados do cliente se for editar
  useEffect(() => {
    if (id) {
      getClienteById(id)
        .then(cliente => {
          setValue('nome', cliente.nome);
          setValue('cpf', cliente.cpf);
          setValue('rg', cliente.rg);
          setValue('endereco', cliente.endereco);
          setValue('profissao', cliente.profissao);
          if (cliente.rendimento1) setValue('rendimento1', cliente.rendimento1);
          if (cliente.rendimento2) setValue('rendimento2', cliente.rendimento2);
          if (cliente.rendimento3) setValue('rendimento3', cliente.rendimento3);
        })
        .catch(err => {
          console.error('Erro ao carregar cliente:', err);
          setServerErrors(['Erro ao carregar cliente']);
        });
    }
  }, [id, setValue]);

  // Formatadores
  const formatarCPF = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9, 11)}`;
  };

  const formatarRG = (value) => {
    return value.replace(/[^\d]/g, '').slice(0, 14);
  };

  const validarCPF = (cpf) => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return 'CPF deve ter 11 dígitos';
    return true;
  };

  const validarRG = (rg) => {
    const digits = rg.replace(/[^\d]/g, '');
    if (digits.length < 5) return 'RG deve ter pelo menos 5 dígitos';
    return true;
  };

  const onSubmit = async (dados) => {
    setServerErrors([]);
    setCarregando(true);

    try {
      // Converter rendimentos para números
      const clienteData = {
        nome: dados.nome,
        cpf: dados.cpf.replace(/\D/g, ''),
        rg: dados.rg.replace(/\D/g, ''),
        endereco: dados.endereco,
        profissao: dados.profissao,
        rendimento1: dados.rendimento1 ? parseFloat(dados.rendimento1) : null,
        rendimento2: dados.rendimento2 ? parseFloat(dados.rendimento2) : null,
        rendimento3: dados.rendimento3 ? parseFloat(dados.rendimento3) : null,
      };

      if (modo === 'novo') {
        await criarCliente(clienteData);
        toast.success('Cliente cadastrado com sucesso!');
        setTimeout(() => navigate('/clientes'), 1500);
      } else {
        await atualizarCliente(id, clienteData);
        toast.success('Cliente atualizado com sucesso!');
        setTimeout(() => navigate('/clientes'), 1500);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      if (error.response?.data) {
        let erros = error.response.data;
        // Converter objeto em array de strings
        if (typeof erros === 'object' && !Array.isArray(erros)) {
          erros = [erros.details || erros.message || JSON.stringify(erros)];
        } else if (!Array.isArray(erros)) {
          erros = [String(erros)];
        } else {
          erros = erros.map(e => typeof e === 'string' ? e : String(e));
        }
        setServerErrors(erros);
      } else {
        setServerErrors(['Erro ao salvar cliente']);
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-2xl">
        <div className="text-sm text-slate-500 mb-5 flex items-center gap-1">
          <button onClick={() => navigate('/clientes')} className="text-blue-600 hover:underline">Clientes</button>
          <span>/</span>
          <span>{modo === 'editar' ? 'Editar' : 'Novo'}</span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {modo === 'editar' ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <p className="text-slate-500 text-sm">Preencha os dados do cliente abaixo</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="bg-blue-50 px-7 py-5 border-b border-blue-200">
            <h2 className="text-lg font-bold text-slate-900">
              {modo === 'editar' ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Preencha os dados abaixo. Campos marcados com <span className="text-red-600">*</span> são obrigatórios.
            </p>
          </div>

          {/* Card Body */}
          <div className="px-7 py-5">
            {/* Erros do servidor */}
            {serverErrors.length > 0 && (
              <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-600 rounded p-4 mb-6">
                <h4 className="font-semibold text-red-600 text-sm mb-2">Corrija os erros abaixo:</h4>
                <ul className="list-none space-y-1">
                  {serverErrors.map((erro, idx) => (
                    <li key={idx} className="text-sm text-red-700 before:content-['•'] before:mr-2 before:text-red-600">
                      {erro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Dados Pessoais */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 pb-2 border-b border-gray-200">
                Dados Pessoais
              </h3>

              <div className="space-y-4 mb-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nome Completo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o nome completo"
                    maxLength={100}
                    {...register('nome', {
                      required: 'Nome é obrigatório',
                      minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm"
                  />
                  {errors.nome && <p className="text-red-600 text-xs mt-1">{errors.nome.message}</p>}
                </div>

                {/* CPF e RG */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      CPF <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      {...register('cpf', {
                        required: 'CPF é obrigatório',
                        validate: (value) => validarCPF(value) === true || validarCPF(value)
                      })}
                      onChange={(e) => {
                        e.target.value = formatarCPF(e.target.value);
                        e.target.dispatchEvent(new Event('change', { bubbles: true }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm"
                    />
                    <p className="text-gray-500 text-xs mt-1">Formato: 000.000.000-00</p>
                    {errors.cpf && <p className="text-red-600 text-xs mt-1">{errors.cpf.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      RG <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="00.000.000-0"
                      maxLength={20}
                      {...register('rg', {
                        required: 'RG é obrigatório',
                        validate: (value) => validarRG(value) === true || validarRG(value)
                      })}
                      onChange={(e) => {
                        e.target.value = formatarRG(e.target.value);
                        e.target.dispatchEvent(new Event('change', { bubbles: true }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm"
                    />
                    {errors.rg && <p className="text-red-600 text-xs mt-1">{errors.rg.message}</p>}
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Endereço <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Rua, número, bairro, cidade - UF"
                    maxLength={255}
                    {...register('endereco', { required: 'Endereço é obrigatório' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm"
                  />
                  {errors.endereco && <p className="text-red-600 text-xs mt-1">{errors.endereco.message}</p>}
                </div>
              </div>

              {/* Dados Profissionais */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 pb-2 border-b border-gray-200">
                Dados Profissionais
              </h3>

              <div className="space-y-4 mb-6">
                {/* Profissão */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Profissão <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Engenheiro, Médico, Advogado..."
                    maxLength={100}
                    {...register('profissao', { required: 'Profissão é obrigatória' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm"
                  />
                  {errors.profissao && <p className="text-red-600 text-xs mt-1">{errors.profissao.message}</p>}
                </div>

                {/* Rendimentos */}
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-600 mb-3">
                    Rendimentos (máximo 3)
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((num) => (
                      <div key={num}>
                        <label className="block text-xs text-gray-600 mb-1">
                          Rendimento {num}
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          {...register(`rendimento${num}`, {
                            validate: (value) => {
                              if (value === '' || value === null) return true;
                              const num = parseFloat(value);
                              return num >= 0 || `Rendimento ${num} não pode ser negativo`;
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm"
                        />
                        {errors[`rendimento${num}`] && (
                          <p className="text-red-600 text-xs mt-1">{errors[`rendimento${num}`].message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded mt-3 border border-gray-200">
                    O sistema aceita no máximo 3 rendimentos por cliente. Campos não preenchidos são ignorados.
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-7 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/clientes')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {carregando ? 'Salvando...' : modo === 'editar' ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormularioCliente;
