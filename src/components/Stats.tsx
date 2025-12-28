
import { Zap, Layers, Cpu } from 'lucide-react';

const Stats = () => {
    const stats = [
        {
            icon: <Layers className="w-6 h-6 text-accent-orange" />,
            value: "21+",
            label: "解析元素类型",
            desc: "涵盖文本、表格、公式、图片等"
        },
        {
            icon: <Zap className="w-6 h-6 text-accent-orange" />,
            value: "100页/5s",
            label: "极速处理",
            desc: "高并发架构，实时响应"
        },
        {
            icon: <Cpu className="w-6 h-6 text-accent-orange" />,
            value: "低资源",
            label: "硬件需求",
            desc: "支持消费级显卡部署"
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
