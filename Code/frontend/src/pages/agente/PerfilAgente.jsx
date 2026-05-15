import { Settings } from 'lucide-react';
import Layout from '../../components/Layout';

export default function PerfilAgente() {
  return (
    <Layout>
      <div className="max-w-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Perfil</h2>
        <p className="text-slate-500 text-sm mb-8">Configurações da sua conta de agente</p>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Settings size={28} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-lg">Configurações de Perfil em breve</h3>
          <p className="text-slate-500 text-sm max-w-sm">
            Integração de Módulo
          </p>
        </div>
      </div>
    </Layout>
  );
}
