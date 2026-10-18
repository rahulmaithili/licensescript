import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Check,
  Star,
  Download,
  IndianRupee,
  Flame,
  Printer,
  FileCheck2,
  Headphones,
} from 'lucide-react';
import { getProducts, getPlans } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Product, Plan } from '@/types';
import { IndianOilLogo, HpGasLogo, BharatGasLogo, GasAgencyMasterLogo } from '@/components/GasLogos';

export const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    getProducts().then((p) => setProducts(p));
    getPlans().then((pl) => setPlans(pl));
  }, []);

  const faqs = [
    {
      q: 'CDCMS Gas Agency Multi-Tool किन-किन गैस कंपनियों के पोर्टल पर काम करता है?',
      a: 'यह टूल IndianOil (Indane SDMS), HP Gas (HPCL CMS / WebPortal) और Bharat Gas (EBharat / BPCL) तीनों मुख्य कंपनियों के आधिकारिक डिस्ट्रीब्यूटर पोर्टल पर 100% सुचारू रूप से कार्य करता है।',
    },
    {
      q: 'पेमेंट के बाद लाइसेंस की (License Key) कितनी देर में मिलती है?',
      a: 'तुरंत (Instant Key Delivery)! जैसे ही आपका UPI, कार्ड या नेटबैंकिंग द्वारा पेमेंट सफल होता है, स्क्रीन पर आपका सिक्योर 256-बिट लाइसेंस कोड आ जाता है और आपके ईमेल पर टैक्स इनवॉइस व सर्टिफिकेट भेज दिया जाता है।',
    },
    {
      q: 'हार्डवेयर डिवाइस बाइंडिंग (HWID Machine Lock) कैसे काम करता है?',
      a: 'जब आप अपने गैस एजेंसी काउंटर वाले कंप्यूटर के एक्सटेंशन या टूल में लाइसेंस की दर्ज करते हैं, तो यह उस कंप्यूटर की मदरबोर्ड/डिवाइस आईडी से ऑटोमैटिक बाइंड हो जाता है। इससे आपकी एजेंसी का लाइसेंस कोई दूसरा कॉपी नहीं कर सकता।',
    },
    {
      q: 'क्या 1 क्लिक कैश मेमो प्रिंटिंग और बल्क बुकिंग में सहायता मिलेगी?',
      a: 'हाँ! टूल में 1-Click Fast Cash Memo Auto-Print, Bulk Refill Booking, Ujjwala PMUY 2.0 KYC सत्यापन और ग्राहक को ऑटोमैटिक WhatsApp डिलीवरी इनवॉइस भेजने की सुविधा उपलब्ध है।',
    },
    {
      q: 'क्या कंप्यूटर बदलने या पोर्टल अपडेट होने पर सपोर्ट मिलेगा?',
      a: 'जी बिल्कुल! अगर गैस कंपनी का पोर्टल अपडेट होता है तो टूल का फ्री ऑटो-अपडेट तुरंत मिलता है। साथ ही अगर एजेंसी का पीसी बदलना हो तो कस्टमर पोर्टल से डिवाइस रीसेट कर सकते हैं या RM Rahul की टीम से WhatsApp/AnyDesk पर 24/7 सहायता ले सकते हैं।',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION - GAS AGENCY AUTOMATION */}
      <section className="relative pt-10 sm:pt-16 lg:pt-24 pb-16 overflow-hidden">
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-blue-600/15 blur-[130px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Top Gas Agency Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/15 via-blue-500/15 to-emerald-500/15 border border-orange-500/30 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold mb-6 shadow-sm">
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
            <span>भारत का #1 गैस एजेंसी ऑटोमेशन और लाइसेंस सॉफ्टवेयर पोर्टल</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
              2026 Verified
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.12]">
            Indane, HP Gas & Bharat Gas{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 bg-clip-text text-transparent">
              Agency Multi-Tool Suite
            </span>{' '}
            और लाइसेंस पैकेज
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            गैस एजेंसी डिस्ट्रीब्यूटरों के लिए सबसे भरोसेमंद ऑटोमेशन टूल्स — <strong>1-Click Cash Memo Printing</strong>, <strong>Bulk Refill Booking</strong>, <strong>Ujjwala KYC Verification</strong>, और ग्राहक <strong>WhatsApp इनवॉइस</strong>। इंस्टेंट लाइसेंस की एक्टिवेशन और सिक्योर हार्डवेयर बाइंडिंग।
          </p>

          {/* GAS COMPANY BRAND TRUST BADGES */}
          <div className="mt-10 py-5 px-6 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl max-w-3xl mx-auto backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-4">
              सपोर्टेड एलपीजी गैस डिस्ट्रीब्यूटर कंपनियां (Official Tool Support)
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
              {/* IndianOil / Indane */}
              <div className="flex items-center gap-3 group">
                <IndianOilLogo size={46} className="group-hover:scale-110 transition-transform shadow-md rounded-full" />
                <div className="text-left">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">IndianOil (Indane)</div>
                  <div className="text-[11px] text-orange-500 dark:text-orange-400 font-semibold">SDMS 1-Click Fast Tool</div>
                </div>
              </div>

              {/* HP Gas */}
              <div className="flex items-center gap-3 group">
                <HpGasLogo size={46} className="group-hover:scale-110 transition-transform shadow-md rounded-full" />
                <div className="text-left">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">HP Gas (HPCL)</div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">CMS Auto Cash Memo</div>
                </div>
              </div>

              {/* Bharat Gas */}
              <div className="flex items-center gap-3 group">
                <BharatGasLogo size={46} className="group-hover:scale-110 transition-transform shadow-md rounded-full" />
                <div className="text-left">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">Bharat Gas (BPCL)</div>
                  <div className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold">EBharat Refill Sync</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <GasAgencyMasterLogo size={24} />
              <span>गैस एजेंसी टूल्स और पैकेज देखें</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>

            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>लाइसेंस रेट लिस्ट (Pricing)</span>
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>तुरंत लाइसेंस की एक्टिवेशन</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>हार्डवेयर पीसी बाइंडिंग (एंटी-क्लोन)</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Printer className="w-4 h-4 text-blue-500" />
              <span>सुपरफ़ास्ट 1-क्लिक कैश मेमो</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Headphones className="w-4 h-4 text-purple-500" />
              <span>AnyDesk 1-on-1 हेल्प & सपोर्ट</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW GAS AGENCY TOOLS WORK */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
            सरल और सुरक्षित प्रक्रिया
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            3 आसान स्टेप्स में गैस एजेंसी टूल चालू करें
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-orange-500/50 transition-all">
            <span className="text-5xl font-black text-orange-500/20 absolute top-6 right-6 font-mono">01</span>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold mb-6">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">अपनी एजेंसी का पैकेज चुनें</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Indane, HP Gas, या Bharat Gas के लिए <strong>CDCMS Pro Multi-Tool</strong>, ऑटो रीफिल टूल या ऑल-इन-वन मास्टर पैकेज सेलेक्ट करें।
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-blue-500/50 transition-all">
            <span className="text-5xl font-black text-blue-500/20 absolute top-6 right-6 font-mono">02</span>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-6">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">UPI या कार्ड से सुरक्षित भुगतान</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Google Pay, PhonePe, Paytm, नेटबैंकिंग या कार्ड द्वारा सुरक्षित पेमेंट करें। पेमेंट होते ही ऑटोमैटिक GST इनवॉइस जनरेट होता है।
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-emerald-500/50 transition-all">
            <span className="text-5xl font-black text-emerald-500/20 absolute top-6 right-6 font-mono">03</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-6">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">तुरंत एक्टिवेशन और काउंटर सेटअप</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              लाइसेंस की तुरंत स्क्रीन पर मिल जाती है। अपने क्रोम एक्सटेंशन में पेस्ट करें, काउंटर पीसी बाइंड करें और सुपरफास्ट काम शुरू करें!
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED GAS AGENCY PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>प्रमाणित एवं टेस्टेड ऑटोमेशन पैकेज</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              गैस एजेंसी ऑटोमेशन सॉफ्टवेयर व एक्सटेंशन
            </h3>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1.5"
          >
            <span>सभी पैकेज देखें</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p, idx) => {
            const productPlans = plans.filter((pl) => pl.product_id === p.id);
            const lowestPrice = productPlans.length > 0 ? Math.min(...productPlans.map((pl) => pl.price)) : 499;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:shadow-2xl hover:border-orange-500/40 transition-all group"
              >
                <div>
                  {/* Gas Logo representation */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <div className="flex items-center -space-x-2">
                          <IndianOilLogo size={36} />
                          <HpGasLogo size={36} />
                          <BharatGasLogo size={36} />
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="flex items-center -space-x-2">
                          <HpGasLogo size={36} />
                          <IndianOilLogo size={36} />
                        </div>
                      )}
                      {idx === 2 && (
                        <div className="flex items-center -space-x-2">
                          <GasAgencyMasterLogo size={38} />
                          <IndianOilLogo size={34} />
                          <HpGasLogo size={34} />
                          <BharatGasLogo size={34} />
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      {p.category || 'Gas Agency'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xl text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-orange-500 transition-colors">
                    {p.name}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                    {p.short_description || p.description}
                  </p>

                  <div className="space-y-2.5 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {p.features?.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">शुरुआती कीमत</span>
                    <div className="font-black text-2xl text-slate-900 dark:text-white">
                      {formatCurrency(lowestPrice)}
                    </div>
                  </div>

                  <Link
                    to={`/products/${p.slug}`}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>लाइसेंस लें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 mb-2">
            <IndianRupee className="w-4 h-4" />
            <span>पारदर्शी और किफायती रेट लिस्ट</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            गैस डिस्ट्रीब्यूटर एवं एजेंसी लाइसेंस प्लान्स
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            कोई छुपा हुआ शुल्क नहीं। 18% GST टैक्स इनवॉइस व इनपुट टैक्स क्रेडिट (ITC) तुरंत प्राप्त करें।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.slice(0, 3).map((plan, index) => {
            const isPopular = index === 1;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                  isPopular
                    ? 'bg-gradient-to-b from-orange-950/40 via-slate-900 to-slate-900 border-2 border-orange-500 shadow-2xl shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    एजेंसियों की पहली पसंद (Best Value)
                  </span>
                )}

                <div>
                  <div className="mb-4">
                    <span className="text-xs font-extrabold uppercase text-orange-600 dark:text-orange-400">
                      {(plan.billing_period || (plan.is_lifetime ? 'lifetime' : 'monthly')).replace('_', ' ')}
                    </span>
                    <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 my-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / {plan.duration_days >= 3650 ? 'लाइफटाइम' : `${plan.duration_days} दिन`}
                    </span>
                  </div>

                  <div className="space-y-3 py-6 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-semibold text-orange-600 dark:text-orange-400">
                      <Lock className="w-4 h-4" />
                      <span>{plan.max_devices} काउंटर पीसी हार्डवेयर बाइंडिंग</span>
                    </div>
                    {plan.features?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/checkout/${plan.id}`}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-sm text-center shadow-lg transition-all ${
                    isPopular
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
                      : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  लाइसेंस खरीदें (Instant Key)
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY CHOOSE FOR GAS DISTRIBUTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold mb-4 border border-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>गैस एजेंसी डिस्ट्रीब्यूटरों का विश्वसनीय साथी</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                घंटों का कैश मेमो और बुकिंग का काम सिर्फ मिनटों में पूरा करें
              </h3>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                Slow Server, बार-बार Session Expire होना और सैकड़ों ग्राहकों के कैश मेमो मैन्युअली प्रिंट करने की समस्या से मुक्ति पाएं। हमारा एक्सटेंशन सीधे IndianOil, HPCL व Bharat Gas पोर्टल पर बैकग्राउंड में काम करता है।
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Click Bulk Cash Memo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No Portal Ban / Safe API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PMUY Ujjwala 2.0 Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Delivery Receipt</span>
                </div>
              </div>
            </div>

            {/* Official Logos Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-6">
              <div className="text-sm font-bold text-slate-300">
                ऑल-इन-वन कम्पैटिबल LPG डिस्ट्रीब्यूटर नेटवर्क
              </div>
              <div className="flex items-center justify-center gap-8 py-2">
                <div className="flex flex-col items-center gap-2">
                  <IndianOilLogo size={64} className="shadow-lg rounded-full" />
                  <span className="text-xs font-extrabold text-orange-400">IndianOil Indane</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <HpGasLogo size={64} className="shadow-lg rounded-full" />
                  <span className="text-xs font-extrabold text-blue-400">HP Gas HPCL</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BharatGasLogo size={64} className="shadow-lg rounded-full" />
                  <span className="text-xs font-extrabold text-amber-400">Bharat Gas BPCL</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 max-w-sm">
                लाइसेंस एक्टिवेट होते ही तीनों कंपनियों के आधिकारिक पोर्टल पर एक्सटेंशन ऑटोमैटिक डिटेक्ट हो जाता है।
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
            सवालों के जवाब
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            अक्सर पूछे जाने वाले प्रश्न (FAQ)
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-base hover:text-orange-600 dark:hover:text-orange-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-orange-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-blue-700 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-extrabold">
              अपनी गैस एजेंसी का काउंटर आज ही डिजिटल और सुपरफ़ास्ट बनाएं!
            </h3>
            <p className="text-sm sm:text-base text-orange-100">
              तुरंत 60 सेकंड में ऑनलाइन पेमेंट करें और अपनी लाइसेंस की स्क्रीन पर प्राप्त करें।
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm shadow-xl hover:bg-orange-50 transition-all hover:scale-105"
              >
                गैस एजेंसी टूल्स एक्सप्लोर करें
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 text-white font-bold text-sm border border-white/20 transition-all"
              >
                रेट लिस्ट व प्लान्स देखें
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
