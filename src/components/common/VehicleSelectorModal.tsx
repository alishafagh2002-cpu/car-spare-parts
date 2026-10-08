import React, { useState, useEffect } from 'react';
import { Car, X, Check, ChevronLeft, Search, RefreshCw } from 'lucide-react';
import type { Vehicle, VehicleModel } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';

interface VehicleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleSelectorModal: React.FC<VehicleSelectorModalProps> = ({ isOpen, onClose }) => {
  const { selectedVehicle, setSelectedVehicle } = useCart();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/vehicles')
        .then((res) => res.json())
        .then((data) => {
          setVehicles(data.vehicles || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSelectMake = async (makeName: string) => {
    setSelectedMake(makeName);
    setSelectedModel(null);
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles/models');
      const data = await res.json();
      const filtered = (data.models || []).filter((m: VehicleModel) => m.vehicleMake === makeName);
      setModels(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedModel) {
      setSelectedVehicle({
        make: selectedMake,
        model: selectedModel,
      });
      onClose();
    }
  };

  const handleClearVehicle = () => {
    setSelectedVehicle(null);
    setSelectedMake('');
    setSelectedModel(null);
    onClose();
  };

  if (!isOpen) return null;

  const filteredModels = models.filter((m) =>
    m.modelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">گاراژ من: انتخاب خودروی شما</h3>
              <p className="text-xs text-zinc-400 mt-0.5">فقط قطعات کاملاً سازگار با این خودرو نمایش داده می‌شوند</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Active selection info */}
          {selectedVehicle?.model && (
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-600" />
                <span>
                  خودروی فعال فعلی: <strong>{selectedVehicle.model.vehicleMake} - {selectedVehicle.model.modelName}</strong>
                </span>
              </div>
              <button
                onClick={handleClearVehicle}
                className="text-amber-800 hover:text-amber-950 font-medium underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                حذف فیلتر خودرو
              </button>
            </div>
          )}

          {/* Step 1: Select Brand / Make */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">
              ۱. انتخاب سازنده / برند خودرو:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {vehicles.map((v) => {
                const isSelected = selectedMake === v.make;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectMake(v.make)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-zinc-950 font-bold shadow-sm'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <span className="text-xs">{v.make}</span>
                    <span className="text-[10px] text-zinc-400 mt-1">{v.country}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Model */}
          {selectedMake && (
            <div className="animate-fade-in pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-700">
                  ۲. مدل و تیپ خودرو ({selectedMake}):
                </label>
                <span className="text-[11px] text-zinc-400">{filteredModels.length} مدل موجود</span>
              </div>

              {/* Search in models */}
              {models.length > 5 && (
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در مدل‌های این برند..."
                    className="w-full px-3 py-2 pr-9 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                </div>
              )}

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {loading ? (
                  <div className="py-6 text-center text-xs text-zinc-400">در حال بارگذاری مدل‌ها...</div>
                ) : filteredModels.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400">مدلی یافت نشد</div>
                ) : (
                  filteredModels.map((m) => {
                    const isModelSelected = selectedModel?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModel(m)}
                        className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                          isModelSelected
                            ? 'border-zinc-900 bg-zinc-900 text-white font-medium shadow-sm'
                            : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{m.modelName}</div>
                          <div className={`text-[10px] mt-0.5 ${isModelSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            سال‌های ساخت: {m.yearStart} تا {m.yearEnd}
                          </div>
                        </div>
                        <ChevronLeft className={`w-4 h-4 ${isModelSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={!selectedModel}
            onClick={handleConfirm}
            className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
          >
            <span>اعمال و نمایش قطعات سازگار</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
