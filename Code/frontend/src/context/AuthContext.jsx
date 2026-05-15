import { createContext, useContext, useState } from 'react';
import { criarCliente, getClientes } from '../api/clientes'; // Nomes exatos da sua API

const AuthContext = createContext(null);

const USUARIOS_MOCK = [
  { id: 100, email: 'agente@aluguel.com', senha: '123456', perfil: 'agente', nome: 'Carlos Agente' },
  { id: 201, email: 'ana@cliente.com', senha: '123456', perfil: 'cliente', nome: 'Ana Cliente', cpf: '987.654.321-00', rg: '9876543', profissao: 'Engenheira' },
  { id: 202, email: 'bruno@cliente.com', senha: '123456', perfil: 'cliente', nome: 'Bruno Cliente', cpf: '112.233.445-56', rg: '1122334', profissao: 'Analista' },
];

export function AuthProvider({ children }) {
  const [usuariosDinamicos, setUsuariosDinamicos] = useState(() => {
    const salvo = sessionStorage.getItem('usuariosDinamicos');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [usuario, setUsuario] = useState(() => {
    const salvo = sessionStorage.getItem('usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  const login = async (email, senha) => {
    try {
      // 1. Tenta buscar no Banco H2 usando sua função getClientes()
      const clientesDoBanco = await getClientes();
      
      const usuarioBanco = clientesDoBanco.find(
        (u) => u.email === email && u.senha === senha
      );

      if (usuarioBanco) {
        const { senha: _, ...dados } = usuarioBanco;
        const dadosComPerfil = { ...dados, perfil: 'cliente' };
        
        setUsuario(dadosComPerfil);
        sessionStorage.setItem('usuario', JSON.stringify(dadosComPerfil));
        return { ok: true, perfil: 'cliente' };
      }
    } catch (error) {
      console.warn("Backend offline ou erro ao buscar clientes, tentando Mocks...");
    }

    // 2. Fallback: Se não achar no banco, tenta nos usuários fixos
    const todos = [...USUARIOS_MOCK, ...usuariosDinamicos];
    const encontrado = todos.find(
      (u) => u.email === email && u.senha === senha
    );

    if (encontrado) {
      const { senha: _, ...dados } = encontrado;
      setUsuario(dados);
      sessionStorage.setItem('usuario', JSON.stringify(dados));
      return { ok: true, perfil: dados.perfil };
    }

    return { ok: false, erro: 'E-mail ou senha inválidos.' };
  };

  const register = async (dadosFormulario) => {
    try {
      const clienteData = {
        nome: dadosFormulario.nome,
        email: dadosFormulario.email, 
        senha: dadosFormulario.senha, 
        cpf: dadosFormulario.cpf?.replace(/\D/g, '') || '',
        rg: dadosFormulario.rg?.replace(/\D/g, '') || '',
        endereco: dadosFormulario.endereco,
        profissao: dadosFormulario.profissao,
        rendimento1: parseFloat(dadosFormulario.rendimento1) || 0,
      };

      const clienteCriado = await criarCliente(clienteData);

      const novoUsuario = {
        id: clienteCriado.id || Date.now(),
        email: dadosFormulario.email,
        senha: dadosFormulario.senha,
        perfil: 'cliente',
        nome: dadosFormulario.nome,
      };

      const atualizados = [...usuariosDinamicos, novoUsuario];
      setUsuariosDinamicos(atualizados);
      sessionStorage.setItem('usuariosDinamicos', JSON.stringify(atualizados));

      const { senha: _, ...dadosLogin } = novoUsuario;
      setUsuario(dadosLogin);
      sessionStorage.setItem('usuario', JSON.stringify(dadosLogin));

      return { ok: true };
    } catch (err) {
      return { ok: false, erro: 'Erro ao cadastrar no servidor.' };
    }
  };

  const logout = () => {
    setUsuario(null);
    sessionStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}