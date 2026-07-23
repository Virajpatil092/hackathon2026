import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Shield, TrendingDown, Wallet, Building2, User } from 'lucide-react';
import { getGreenFinancing, applyGreenProduct } from '@/services/api';

function formatAmount(amt) {
  if (!amt || amt === 0) return null;
  if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1).replace(/\.0$/, '')} Lakh`;
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
  return `₹${amt}`;
}

export default function GreenFinancing() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState({});
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    getGreenFinancing()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (id) => {
    await applyGreenProduct(id);
    setApplied((prev) => ({ ...prev, [id]: true }));
  };

  const filteredItems = items.filter((p) => {
    if (activeTab === 'ALL') return true;
    return p.customerType === activeTab;
  });

  if (loading)
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Green Financing Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore sustainable financial products aligned with ESG criteria ({filteredItems.length} active products).
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ALL'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Products ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('INDIVIDUAL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'INDIVIDUAL'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Individual ({items.filter(i => i.customerType === 'INDIVIDUAL').length})
          </button>
          <button
            onClick={() => setActiveTab('BUSINESS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'BUSINESS'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Business ({items.filter(i => i.customerType === 'BUSINESS').length})
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
        <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-teal-800">Verified ESG Framework Aligned Products</p>
          <p className="text-xs text-teal-600 mt-0.5">
            All products listed here meet environmental sustainability standards.
            CO₂e savings are estimated based on standard usage benchmarks.
          </p>
        </div>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((p) => {
          const minFormatted = formatAmount(p.minAmount);
          const maxFormatted = formatAmount(p.maxAmount);
          const amountText = minFormatted && maxFormatted
            ? `${minFormatted} - ${maxFormatted}`
            : minFormatted || maxFormatted || 'Flexible';

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    {p.type}
                  </span>
                  {p.customerType && (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {p.customerType}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded-lg">
                  {p.rate}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mt-3">{p.name}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-1">{p.description}</p>

              {/* Features */}
              {p.features && p.features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.features.map((f, i) => (
                    <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* CO2 saving */}
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <TrendingDown className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="font-medium text-slate-700">{p.co2Saving}</span>
              </div>

              {/* Loan details */}
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Financing Amount</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{amountText}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tenure</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{p.term}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full truncate max-w-[200px]" title={p.badge}>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  <span className="truncate">{p.badge}</span>
                </span>
                {applied[p.id] ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply(p.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
