import { Type, Image, Table, Sigma, LayoutTemplate, List, FileDigit, Grip, Heading1, CaseSensitive, BrainCircuit, Quote, Minus, ImagePlus } from 'lucide-react';

const ElementsGrid = () => {
    // A subset of elements to represent the grid
    const elements = [
        { icon: <Heading1 size={20} />, label: "标题" },
        { icon: <Type size={20} />, label: "段落" },
        { icon: <Image size={20} />, label: "图片" },
        { icon: <Table size={20} />, label: "表格" },
        { icon: <Sigma size={20} />, label: "公式" },
        { icon: <LayoutTemplate size={20} />, label: "页眉页脚" },
        { icon: <List size={20} />, label: "列表" },
        { icon: <FileDigit size={20} />, label: "页码" },
        { icon: <CaseSensitive size={20} />, label: "印章" },
        { icon: <Grip size={20} />, label: "二维码" },
        { icon: <Quote size={20} />, label: "图注" },
        { icon: <Minus size={20} />, label: "分割线" },
        { icon: <BrainCircuit size={20} />, label: "流程图" },
        { icon: <ImagePlus size={20} />, label: "手写体" },
    ];

    return (
        <section className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">丰富解析元素</h2>
                    <p className="text-gray-400">全面覆盖各类文档元素，还原度高达 99%</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {elements.map((el, idx) => (
                        <div key={idx} className="group bg-card-bg border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-accent-orange/50 hover:bg-accent-orange/5 transition-all duration-300 cursor-default">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-accent-orange group-hover:bg-accent-orange/10 transition-colors">
                                {el.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{el.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ElementsGrid;
