
import { Check } from 'lucide-react';

const Pricing = () => {
    const plans = [
        {
            name: "免费体验",
            price: "0",
            unit: "元 / 100页",
            features: ["全功能体验", "每月100页额度", "API 接入", "社区支持"],
            cta: "立即试用",
            highlight: false
        },
        {
            name: "标准版",
            price: "0.1",
            unit: "元 / 页",
            features: ["按量付费", "QPS 无限制", "优先技术支持", "99.9% 可用性"],
            cta: "充值使用",
            highlight: true
        },
        {
            name: "企业版",
            price: "定制",
            unit: "",
            features: ["私有化部署", "专属模型微调", "1对1 客户经理", "SLA 保障"],
            cta: "联系商务",
            highlight: false
        }
    ];

    return (
        <section className="py-24 bg-black border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">简单透明的定价</h2>
                    <p className="text-gray-400">无隐形费用，按需付费</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`rounded-2xl p-8 flex flex-col relative ${plan.highlight
                                ? 'bg-card-bg border-2 border-accent-orange shadow-[0_0_40px_rgba(255,140,0,0.15)] transform md:-translate-y-4'
                                : 'bg-card-bg border border-white/10'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-300 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-sm text-gray-500">{plan.unit}</span>
                                </div>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feat, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-accent-orange/20 text-accent-orange' : 'bg-white/10 text-gray-400'}`}>
                                            <Check size={12} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.highlight
                                    ? 'bg-accent-orange text-white hover:bg-orange-600'
                                    : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
