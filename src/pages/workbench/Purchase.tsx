import { useState } from 'react';
import { Check, Info } from 'lucide-react';

const plans = [
    {
        id: 'newbie',
        name: '新人体验包',
        price: 9.9,
        pages: 1000,
        tag: '限购一次',
        features: ['1000页解析额度', '永久有效', '支持所有解析类型'],
        popular: false
    },
    {
        id: 'standard',
        name: '基础产品规格',
        price: 50,
        pages: 2500, // Implied calc
        isCustom: true,
        features: ['低至 0.02元/页', '量大更优', '企业级SLA支持'],
        popular: true
    },
    {
        id: 'special',
        name: '发布特惠包',
        price: 1000,
        pages: 50000,
        tag: '限时优惠',
        features: ['50000页解析额度', '低至 0.02元/页', '优先技术支持'],
        popular: false
    }
];

const Purchase = () => {
    const [selectedPlan, setSelectedPlan] = useState('standard');
    const [customAmount, setCustomAmount] = useState(100);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white">费用中心</h2>
                <p className="text-gray-400">选择适合您的套餐，即刻开启智能文档处理之旅</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative p-6 rounded-2xl border transition-all cursor-pointer ${selectedPlan === plan.id
                            ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500'
                            : 'bg-[#141414] border-white/10 hover:border-orange-500/50'
                            }`}
                    >
                        {plan.tag && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">
                                {plan.tag}
                            </div>
                        )}
                        {plan.popular && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">
                                推荐
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-sm font-bold text-orange-500">¥</span>
                                <span className="text-4xl font-bold text-white">
                                    {plan.isCustom ? (customAmount * 0.05).toFixed(1) : plan.price}
                                </span>
                                {plan.isCustom && <span className="text-sm text-gray-400">起</span>}
                            </div>
                        </div>

                        {plan.isCustom ? (
                            <div className="bg-black/20 p-4 rounded-xl mb-6 border border-white/5">
                                <label className="text-xs text-gray-500 mb-2 block">自定义充值金额 (元)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">¥</span>
                                    <input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                                        className="bg-transparent border-none outline-none text-white font-mono w-full text-lg placeholder-gray-600"
                                        placeholder="100"
                                    />
                                </div>
                                <div className="mt-2 text-xs text-orange-400">
                                    预计获得 {Math.floor(customAmount / 0.05)} 页 (约 0.05元/页)
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-gray-400 text-sm">包含额度</div>
                                <div className="text-xl font-mono text-white mt-1">{plan.pages} 页</div>
                            </div>
                        )}

                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm text-gray-400">
                                    <Check size={16} className="text-orange-500 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full py-3 rounded-xl font-medium transition-colors ${selectedPlan === plan.id
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}>
                            立即支付
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Info size={24} className="text-blue-500" />
                </div>
                <div>
                    <h4 className="text-white font-medium mb-1">计费说明</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        所有文档解析均按页计费。充值金额永久有效，无过期时间。
                        支持微信支付和支付宝支付。如需企业对公转账或发票，请联系商务客服。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Purchase;
