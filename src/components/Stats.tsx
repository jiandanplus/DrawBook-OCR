
import { Zap, Layers, Cpu } from 'lucide-react';

const Stats = () => {
    const stats = [
        {
            icon: <Layers className="w-6 h-6 text-accent-orange" />,
            value: "高精准",
            label: "21+元素类型",
            desc: "坐标精准追溯、精确解析"
        },
        {
            icon: <Zap className="w-6 h-6 text-accent-orange" />,
            value: "效率高",
            label: "极速处理",
            desc: "1000页长文档1分钟完成"
        },
        {
            icon: <Cpu className="w-6 h-6 text-accent-orange" />,
            value: "成本低",
            label: "按需选择",
            desc: "一张RTX2080即可私有部署"
        }
    ];

    return (
        <section className="py-12 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-4 md:justify-center">
                            <div className="w-12 h-12 rounded-lg bg-accent-orange/10 flex items-center justify-center border border-accent-orange/20">
                                {stat.icon}
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                                    <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
