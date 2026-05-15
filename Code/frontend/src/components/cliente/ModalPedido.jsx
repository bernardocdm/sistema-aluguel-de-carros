import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ModalPedido({ automovel, clientes, onConfirmar, onFechar }) {
  const { usuario } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const isAgente = Array.isArray(clientes) && clientes.length > 0;

  const onSubmit = (dados) => {
    onConfirmar({
      clienteId: isAgente ? parseInt(dados.clienteId) : usuario.id,
      automovelId: automovel.id,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      objetivo: dados.objetivo || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-slate-900">Solicitar Aluguel</h3>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-slate-600">Veículo selecionado:</p>
          <p className="font-bold text-slate-900">{automovel.marca} {automovel.modelo} — {automovel.ano}</p>
          <p className="text-blue-600 font-semibold text-sm">
            {Number(automovel.valorDiaria).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / dia
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {isAgente && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                {...register('clienteId', { required: 'Selecione um cliente' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              {errors.clienteId && <p className="text-red-500 text-xs mt-1">{errors.clienteId.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Início <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('dataInicio', { required: 'Obrigatório' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              {errors.dataInicio && <p className="text-red-500 text-xs mt-1">{errors.dataInicio.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Fim <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('dataFim', { required: 'Obrigatório' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              {errors.dataFim && <p className="text-red-500 text-xs mt-1">{errors.dataFim.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Objetivo do aluguel{' '}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Viagem em família, reunião de negócios..."
              {...register('objetivo')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Confirmar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
