
import { Cloud, Server, Database } from 'lucide-react';

const Integration = () => {
    const cards = [
        {
            icon: <Cloud className="w-8 h-8 text-blue-400" />,
            title: "API 接入",
            desc: "标准 REST API 接口，一行代码快速调用，支持 Python/Java/Go 等多语言 SDK。",
            badge: "最推荐"
        },
        {
            icon: <Server className="w-8 h-8 text-purple-400" />,
            title: "离线批量处理",
            desc: "提供高性能离线处理工具，支持 TB 级历史文档批量迁移与转换。",
            badge: "高效"
        },
        {
            icon: <Database className="w-8 h-8 text-green-400" />,
            title: "私有化部署",
            desc: "支持本地服务器或私有云部署，数据不出域，保障核心资产安全。",
            badge: "安全"
        }
    ];

    return (
        <section className="py-24 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">灵活接入方式</h2>
                    <p className="text-gray-400">满足不同规模企业的业务需求</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-card-bg border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 bg-white/10 rounded text-gray-300 border border-white/5">{card.badge}</div>
                            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Integration;
