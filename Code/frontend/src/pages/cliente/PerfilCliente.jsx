import { useState } from 'react';
import { User, Mail, CreditCard, Briefcase, Lock, X, Eye, EyeOff } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-slate-800 font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

function ModalAlterarSenha({ onClose }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');
    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    setSucesso(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Lock size={15} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Alterar Senha</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {sucesso ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Lock size={20} className="text-green-600" />
              </div>
              <p className="font-semibold text-slate-800 mb-1">Senha alterada com sucesso!</p>
              <p className="text-slate-500 text-sm mb-5">Sua senha foi atualizada.</p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{erro}</p>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Senha atual</label>
                <div className="relative">
                  <input
                    type={mostrarAtual ? 'text' : 'password'}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="••••••"
                  />
                  <button type="button" onClick={() => setMostrarAtual((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {mostrarAtual ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nova senha</label>
                <div className="relative">
                  <input
                    type={mostrarNova ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setMostrarNova((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {mostrarNova ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repita a nova senha"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PerfilCliente() {
  const { usuario } = useAuth();
  const [modalSenha, setModalSenha] = useState(false);

  const inicial = usuario?.nome?.charAt(0)?.toUpperCase() ?? 'C';

  return (
    <Layout>
      {modalSenha && <ModalAlterarSenha onClose={() => setModalSenha(false)} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Meu Perfil</h2>
        <p className="text-slate-500 text-sm">Informações da sua conta</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
              {inicial}
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">{usuario?.nome}</h3>
              <p className="text-slate-300 text-sm capitalize">{usuario?.perfil ?? 'cliente'}</p>
            </div>
          </div>

          <div className="px-6 py-2">
            <InfoRow icon={User} label="Nome completo" value={usuario?.nome} />
            <InfoRow icon={Mail} label="E-mail" value={usuario?.email} />
            <InfoRow icon={CreditCard} label="CPF" value={usuario?.cpf} />
            <InfoRow icon={CreditCard} label="RG" value={usuario?.rg} />
            <InfoRow icon={Briefcase} label="Profissao" value={usuario?.profissao} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <h4 className="text-sm font-semibold text-slate-700 mb-1">Seguranca da conta</h4>
          <p className="text-xs text-slate-400 mb-4">Mantenha sua conta segura alterando sua senha periodicamente.</p>
          <button
            onClick={() => setModalSenha(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
          >
            <Lock size={14} />
            Alterar Senha
          </button>
        </div>
      </div>
    </Layout>
  );
}
