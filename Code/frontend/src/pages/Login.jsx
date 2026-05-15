import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/DriveHub_Logo.png';
import carBg from '../assets/carrofundo.jpg';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => { // 1. Adicionamos o async aqui
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // 2. Adicionamos o await aqui para esperar o Java/H2 responder
      const resultado = await login(email, senha); 
      
      setCarregando(false);

      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }

      // 3. Redirecionamento baseado no perfil
      if (resultado.perfil === 'agente') {
        navigate('/agente/dashboard');
      } else {
        navigate('/cliente/portal');
      }
    } catch (err) {
      setCarregando(false);
      setErro("Erro de conexão com o servidor.");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage: `url(${carBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-slate-900 opacity-70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">

        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-24 rounded-2xl bg-white overflow-hidden shadow-2xl flex items-center justify-center p-2">
            <img
              src={logo}
              alt="DriveHub"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-slate-400 text-sm mt-3 tracking-wide">
            Sistema de Gestão de Aluguel de Veículos
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-slate-900 font-bold text-xl mb-1">Bem-vindo de volta</h2>
          <p className="text-slate-500 text-sm mb-6">Entre com suas credenciais para continuar</p>

          {erro && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input
                placeholder="seu@email.com"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <input
                type="password"
                placeholder="••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 mt-2"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Criar conta
              </button>
            </p>
          </div>

          {/* COMENTADO PARA A APRESENTAÇÃO 
              Esta parte abaixo não aparecerá mais na tela 
          */}
          {/* <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-slate-400 text-center font-medium mb-2">Credenciais de demonstração</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="font-semibold text-slate-600 mb-0.5">Agente</p>
                <p>agente@aluguel.com</p>
                <p>Senha: 123456</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="font-semibold text-slate-600 mb-0.5">Cliente</p>
                <p>ana@cliente.com</p>
                <p>Senha: 123456</p>
              </div>
            </div>
          </div> 
          */}
        </div>

      </div>
    </div>
  );
}

export default Login;