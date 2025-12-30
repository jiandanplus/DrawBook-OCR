
import { ArrowRight } from 'lucide-react';

const Workflow = () => {
    return (
        <section className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">工作流程展示</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        从原始文档到结构化数据的完整链路
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Step 1: Original */}
                    <div className="bg-card-bg border border-white/10 rounded-xl p-6 h-[400px] flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-center">原文 (PDF/Image)</h3>
                        <div className="flex-1 bg-white/5 rounded-lg border-dashed border-2 border-white/10 flex items-center justify-center overflow-hidden relative group">
                            <div className="absolute inset-4 bg-white/5 rounded blur-[1px] group-hover:blur-0 transition-all duration-500">
                                <div className="w-full h-4 bg-white/10 mb-2 rounded" />
                                <div className="w-3/4 h-4 bg-white/10 mb-6 rounded" />
                                <div className="w-full h-32 bg-white/10 rounded" />
                            </div>
                            <span className="relative z-10 px-4 py-2 bg-black/50 rounded backdrop-blur text-sm">Input Document</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex justify-center text-accent-orange">
                        <ArrowRight size={32} />
                    </div>

                    {/* Step 2: SoMark Engine */}
                    <div className="bg-card-bg border border-accent-orange/30 rounded-xl p-6 h-[400px] flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(255,140,0,0.1)]">
                        <div className="absolute inset-0 bg-accent-orange/5" />
                        <h3 className="text-lg font-semibold mb-4 text-center text-accent-orange">DrawBookAI Engine</h3>
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
                            <div className="w-20 h-20 rounded-full border-2 border-accent-orange flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                <div className="w-16 h-16 rounded-full border border-dashed border-white/30" />
                            </div>
                            <div className="text-center space-y-2">
                                <div className="px-3 py-1 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-xs text-accent-orange">Layout Analysis</div>
                                <div className="px-3 py-1 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-xs text-accent-orange">Formula Recognition</div>
                                <div className="px-3 py-1 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-xs text-accent-orange">Table Reconstruction</div>
                            </div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex justify-center text-accent-orange">
                        <ArrowRight size={32} />
                    </div>

                    {/* Step 3: Result */}
                    <div className="bg-card-bg border border-white/10 rounded-xl p-6 h-[400px] flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-center">Markdown / JSON</h3>
                        <div className="flex-1 bg-[#0d1117] rounded-lg border border-white/10 p-4 font-mono text-xs text-gray-400 overflow-y-auto custom-scrollbar">
                            <span className="text-blue-400"># Heading</span>
                            <br />
                            <br />
                            <span className="text-gray-300">Text content extracted perfectly...</span>
                            <br />
                            <br />
                            <span className="text-purple-400">```json</span>
                            <br />
                            {`{`}
                            <br />
                            &nbsp;&nbsp;<span className="text-green-400">"type"</span>: <span className="text-yellow-400">"table"</span>,
                            <br />
                            &nbsp;&nbsp;<span className="text-green-400">"content"</span>: [...]
                            <br />
                            {`}`}
                            <br />
                            <span className="text-purple-400">```</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Workflow;
