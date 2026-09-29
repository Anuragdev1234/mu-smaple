import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  FileText,
  ShoppingBag,
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  Scale,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Download,
  AlertTriangle,
  Building,
  Check,
  Tag,
  ArrowUpRight
} from 'lucide-react';
import { playSuccessTone } from '../../utils/audio';

export const LocalBuyerView: React.FC = () => {
  const {
    user,
    marketLots,
    placeBid,
    activeTab,
    setActiveTab,
    addNotification
  } = useApp();

  // Part 17: Feed & Filtering State
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Quota Surplus' | 'Commercial Non-FAQ' | 'Direct Farm'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLotId, setSelectedLotId] = useState<string>(marketLots[0]?.id || '');

  // Part 18: Bidding Desk & Purchase State
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [bidFeedback, setBidFeedback] = useState<{ lotId: string; message: string; type: 'success' | 'error' } | null>(null);
  const [purchasedLots, setPurchasedLots] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [activeInvoiceLot, setActiveInvoiceLot] = useState<typeof marketLots[0] | null>(null);

  const selectedLot = marketLots.find(l => l.id === selectedLotId) || marketLots[0];

  // Handle Bidding Submission
  const handlePlaceBid = (lotId: string, currentBid: number) => {
    const rawAmount = bidInputs[lotId] || `${currentBid + 50}`;
    const amount = Number(rawAmount);

    if (amount <= currentBid) {
      setBidFeedback({
        lotId,
        message: `Your bid must exceed the current highest bid of ₹${currentBid}/Qtl.`,
        type: 'error'
      });
      return;
    }

    const success = placeBid(lotId, amount);
    if (success) {
      playSuccessTone();
      setBidFeedback({
        lotId,
        message: `Highest bid placed! ₹${amount}/Qtl submitted on Lot ${lotId}.`,
        type: 'success'
      });
      setTimeout(() => setBidFeedback(null), 3000);
    }
  };

  // Handle Instant Direct Purchase at Asking Price
  const handleInstantBuy = (lot: typeof marketLots[0]) => {
    setPurchasedLots(prev => [...prev, lot.id]);
    setActiveInvoiceLot(lot);
    setShowInvoiceModal(true);
    playSuccessTone();

    addNotification({
      title: `Direct Purchase Confirmed: ${lot.id}`,
      message: `Purchased ${lot.weightKg} kg ${lot.cropType} from farmer ${lot.farmerName} at ₹${lot.basePricePerQuintal}/Qtl. Total: ₹${Math.round((lot.weightKg / 100) * lot.basePricePerQuintal).toLocaleString('en-IN')}.`,
      type: 'payment',
      roleTarget: 'local_buyer'
    });
  };

  // Filter lots based on category and search query
  const filteredLots = marketLots.filter((lot) => {
    if (selectedCategory === 'Quota Surplus' && !lot.rejectionReason?.includes('quota')) return false;
    if (selectedCategory === 'Commercial Non-FAQ' && lot.rejectionReason?.includes('quota')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        lot.cropType.toLowerCase().includes(q) ||
        lot.farmerName.toLowerCase().includes(q) ||
        lot.centerLocation.toLowerCase().includes(q) ||
        lot.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // =========================================================================
  // PART 17: Local Buyer Marketplace Feed & Open Market Board
  // =========================================================================
  const renderMarketBoard = () => (
    <div className="space-y-6">
      {/* Merchant Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Open Market Board & Secondary Auction</span>
              <span className="text-xl">📈</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Verified Merchant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Merchant: {user.name} • {user.organization} • {user.licenseOrId || 'GSTIN: 09AABCA1234F1Z8'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop, farmer, or lot..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Transparent Dual-Channel Mechanism Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent Secondary Marketplace:</span> When farmers bring produce that exceeds official government procurement quotas or has custom commercial specifications, they are offered immediate direct sale to licensed private buyers with official Mandi lab assay certification.
        </div>
      </div>

      {/* Category Filter Pills (Matching Video 00:02 - 00:09 Filter Style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {(['All', 'Quota Surplus', 'Commercial Non-FAQ', 'Direct Farm'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Produce Lots Grid with Photos, Location, Quantity & Verified Quality Seals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => {
          const isPurchased = purchasedLots.includes(lot.id);
          const totalEstimatedValue = Math.round((lot.weightKg / 100) * lot.currentHighestBidPerQuintal);

          return (
            <div
              key={lot.id}
              className="bg-white rounded-2xl border border-surface-border shadow-xs overflow-hidden hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                {/* Crop Photo with Overlays & Verified Quality Seal */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={lot.imageUrl}
                    alt={lot.cropType}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    {lot.variety}
                  </span>

                  {/* Verified Quality Seal (Part 17 Requirement) */}
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-200" />
                    <span>DoCA Lab Verified</span>
                  </span>

                  {/* Weight Badge */}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
                    {lot.weightKg} kg ({(lot.weightKg / 100).toFixed(1)} Qtl)
                  </span>
                </div>

                {/* Lot Details */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{lot.cropType}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                      {lot.centerLocation}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Farmer: <strong className="text-slate-700">{lot.farmerName}</strong> • {lot.farmerLocation}
                  </p>

                  {/* Reason for Open Market Listing */}
                  {lot.rejectionReason && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{lot.rejectionReason}</span>
                    </p>
                  )}

                  {/* Verified Quality Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase">Moisture Content</span>
                      <span className="font-bold text-slate-800">{lot.moisturePercent}%</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase">Assayed Grade</span>
                      <span className="font-bold text-emerald-700">{lot.grade}</span>
                    </div>
                  </div>

                  {/* Pricing & Bidding Summary */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Current High Bid</span>
                      <span className="text-sm font-black text-slate-900">
                        ₹{lot.currentHighestBidPerQuintal} <span className="text-[10px] font-normal text-slate-400">/ Qtl</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Lot Value</span>
                      <span className="text-xs font-bold text-emerald-800">
                        ₹{totalEstimatedValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bidding Control Desk & Direct Purchase Buttons (Part 18 Requirement) */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2.5">
                {bidFeedback?.lotId === lot.id && (
                  <div
                    className={`p-2 rounded-lg text-[11px] font-bold text-center ${
                      bidFeedback.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {bidFeedback.message}
                  </div>
                )}

                {!isPurchased ? (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={bidInputs[lot.id] || ''}
                          onChange={(e) => setBidInputs({ ...bidInputs, [lot.id]: e.target.value })}
                          placeholder={`${lot.currentHighestBidPerQuintal + 50}`}
                          className="w-full pl-6 pr-2 py-1.5 text-xs font-bold border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                      <button
                        onClick={() => handlePlaceBid(lot.id, lot.currentHighestBidPerQuintal)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors active:scale-95"
                      >
                        Place Bid
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        onClick={() => {
                          setSelectedLotId(lot.id);
                          setActiveTab('reports');
                        }}
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lab Assay Report</span>
                      </button>

                      <button
                        onClick={() => handleInstantBuy(lot)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] active:scale-95"
                        title="Accept farmer's base price immediately"
                      >
                        Buy at ₹{lot.basePricePerQuintal}/Qtl
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Purchased (Invoice Generated)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Confirmation Modal for Instant Purchase */}
      {showInvoiceModal && activeInvoiceLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-brand-dark px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Official Commercial Purchase Invoice</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Number:</span>
                  <span className="font-bold text-slate-900">INV-MKT-2026-9904</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">Date & Location:</span>
                  <span className="text-slate-900">28 Sep 2026 • {activeInvoiceLot.centerLocation}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Farmer Seller:</span>
                  <span className="font-bold text-slate-900">{activeInvoiceLot.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Buyer:</span>
                  <span className="font-bold text-slate-900">{user.name} ({user.licenseOrId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Produce:</span>
                  <span className="font-bold text-slate-900">{activeInvoiceLot.cropType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Quantity:</span>
                  <span className="font-bold text-slate-900">{activeInvoiceLot.weightKg} kg ({(activeInvoiceLot.weightKg / 100).toFixed(1)} Qtl)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rate Agreed:</span>
                  <span className="font-bold text-slate-900">₹{activeInvoiceLot.basePricePerQuintal} / Quintal</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-emerald-900">
                  <span>Total Amount Paid:</span>
                  <span>₹{Math.round((activeInvoiceLot.weightKg / 100) * activeInvoiceLot.basePricePerQuintal).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    alert('Official digital GST invoice downloaded.');
                    setShowInvoiceModal(false);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Invoice</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // PART 18: Local Buyer Quality Reports & Bidding Desk
  // =========================================================================
  const renderQualityReports = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              🔬
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official Quality Assay & Inspection Certificate
              </h2>
              <p className="text-xs text-slate-500">
                Authorized Lab Testing Report issued by Mandi Quality Control Inspector.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            ← Back to Market Board
          </button>
        </div>

        {/* Certificate Data Summary */}
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 block uppercase text-[10px]">Lot Identifier</span>
              <p className="font-mono font-bold text-slate-900">{selectedLot.id}</p>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px]">Commodity & Variety</span>
              <p className="font-bold text-slate-900">{selectedLot.cropType} ({selectedLot.variety})</p>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px]">Net Weighed Weight</span>
              <p className="font-bold text-slate-900">{selectedLot.weightKg} kg ({(selectedLot.weightKg / 100).toFixed(1)} Qtl)</p>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px]">Physical Mandi Bay</span>
              <p className="font-bold text-slate-900">{selectedLot.centerLocation}</p>
            </div>
          </div>

          {/* Detailed Lab Assay Table (Moisture, Impurities, Test Weight, Damaged Grains) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Assay Parameter</th>
                  <th className="p-3">Measured Lab Value</th>
                  <th className="p-3">Permissible Standard</th>
                  <th className="p-3">Lab Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-medium">Moisture Content</td>
                  <td className="p-3 font-bold text-slate-900">{selectedLot.moisturePercent}%</td>
                  <td className="p-3 text-slate-500">Max 14.0%</td>
                  <td className="p-3 text-emerald-700 font-bold">Pass (Optimal)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Inert Impurities / Foreign Matter</td>
                  <td className="p-3 font-bold text-slate-900">1.2%</td>
                  <td className="p-3 text-slate-500">Max 2.0%</td>
                  <td className="p-3 text-emerald-700 font-bold">Within Limit</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Test Weight (Hectolitre)</td>
                  <td className="p-3 font-bold text-slate-900">76.4 kg/hL</td>
                  <td className="p-3 text-slate-500">Min 74.0 kg/hL</td>
                  <td className="p-3 text-emerald-700 font-bold">High Density Grade A</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Damaged / Discolored Grains</td>
                  <td className="p-3 font-bold text-slate-900">2.1%</td>
                  <td className="p-3 text-slate-500">Max 4.0%</td>
                  <td className="p-3 text-emerald-700 font-bold">Excellent</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inspector Digital Stamp & Notes */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <div>
                <p className="font-bold text-emerald-950">DoCA Mandi QC Inspector Seal: VERIFIED</p>
                <p className="text-[10px] text-slate-500">Inspected by: Dr. V. K. Sharma (Senior Quality Chemist)</p>
              </div>
            </div>
            <span className="font-mono text-[10px] bg-white text-slate-600 px-2 py-1 rounded border border-slate-200">
              HASH: 8F2A901C
            </span>
          </div>

          {/* Interactive Bidding Desk for this Lot */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Bidding Desk for Lot {selectedLot.id}
            </h4>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Highest Offer:</span>
              <span className="font-bold text-sm text-slate-900">
                ₹{selectedLot.currentHighestBidPerQuintal} / Quintal ({selectedLot.bidCount} bids placed)
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={bidInputs[selectedLot.id] || ''}
                onChange={(e) => setBidInputs({ ...bidInputs, [selectedLot.id]: e.target.value })}
                placeholder={`Enter bid > ₹${selectedLot.currentHighestBidPerQuintal}`}
                className="flex-1 px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handlePlaceBid(selectedLot.id, selectedLot.currentHighestBidPerQuintal)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Submit Offer
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleInstantBuy(selectedLot)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Accept Asking Price (₹{selectedLot.basePricePerQuintal}/Qtl) & Issue Invoice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'reports':
      return renderQualityReports();
    default:
      return renderMarketBoard();
  }
};
