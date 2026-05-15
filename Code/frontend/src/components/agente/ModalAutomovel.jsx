import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

export default function ModalAutomovel({ automovel, onSalvar, onFechar }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      marca: '',
      modelo: '',
      ano: '',
      placa: '',
      valorDiaria: '',
      status: 'disponivel',
      urlImagem: '',
    },
  });

  useEffect(() => {
    if (automovel) {
      reset({
        marca: automovel.marca ?? '',
        modelo: automovel.modelo ?? '',
        ano: automovel.ano ?? '',
        placa: automovel.placa ?? '',
        valorDiaria: automovel.valorDiaria ?? '',
        status: automovel.status ?? 'disponivel',
        urlImagem: automovel.urlImagem ?? '',
      });
    }
  }, [automovel, reset]);

  const onSubmit = (dados) => {
    onSalvar({
      ...dados,
      ano: parseInt(dados.ano),
      valorDiaria: parseFloat(dados.valorDiaria),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-slate-900">{automovel ? 'Editar Veículo' : 'Novo Veículo'}</h3>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Marca <span className="text-red-500">*</span></label>
              <input
                {...register('marca', { required: 'Obrigatório' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="Toyota"
              />
              {errors.marca && <p className="text-red-500 text-xs mt-1">{errors.marca.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo <span className="text-red-500">*</span></label>
              <input
                {...register('modelo', { required: 'Obrigatório' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="Corolla"
              />
              {errors.modelo && <p className="text-red-500 text-xs mt-1">{errors.modelo.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ano <span className="text-red-500">*</span></label>
              <input
                type="number"
                {...register('ano', { required: 'Obrigatório', min: { value: 1990, message: 'Ano mínimo 1990' } })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="2022"
              />
              {errors.ano && <p className="text-red-500 text-xs mt-1">{errors.ano.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Placa <span className="text-red-500">*</span></label>
              <input
                {...register('placa', { required: 'Obrigatório' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="ABC-1234"
              />
              {errors.placa && <p className="text-red-500 text-xs mt-1">{errors.placa.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Diária (R$) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('valorDiaria', { required: 'Obrigatório' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="150.00"
              />
              {errors.valorDiaria && <p className="text-red-500 text-xs mt-1">{errors.valorDiaria.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="disponivel">Disponível</option>
                <option value="alugado">Alugado</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL da Imagem</label>
            <input
              {...register('urlImagem')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="https://..."
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
              {automovel ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
