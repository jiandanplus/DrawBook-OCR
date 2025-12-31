import { FileText, FileCode, Braces } from 'lucide-react';


const Workflow = () => {
    // We need to sync animations, so getting path lengths might be needed for precise timing
    // purely CSS animation is fine if we carefully calculate percentages.

    return (
        <section className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">工作流程展示</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        支持PDF、image转Markdown/Json，可坐标追溯
                    </p>
                </div>

                {/* Workflow Container */}
                <div className="relative">

                    {/* Connection Lines (Desktop Only) */}
                    <div className="hidden md:block absolute top-[calc(56px+32px+210px)] left-0 right-0 -translate-y-1/2 z-0">
                        {/* Line 1 (Card 1 to 2) */}
                        <div className="absolute left-[30%] right-[68%] h-[2px]">
                            <div className="absolute inset-0 border-t-2 border-dashed border-gray-700" />
                            {/* Dot */}
                            <div className="absolute top-[-3px] w-1.5 h-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] opacity-0 animate-dot-connect-1" />
                        </div>

                        {/* Line 2 (Card 2 to 3) */}
                        <div className="absolute left-[64%] right-[34%] h-[2px]">
                            <div className="absolute inset-0 border-t-2 border-dashed border-gray-700" />
                            {/* Dot */}
                            <div className="absolute top-[-3px] w-1.5 h-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] opacity-0 animate-dot-connect-2" />
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {/* Card 1: 原文 */}
                        <div className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5 h-[56px]">
                                <FileText size={18} className="text-gray-400" />
                                <span className="font-medium text-white">原文</span>
                            </div>
                            <div className="p-8 pb-10 flex-1">
                                <div className="relative h-[420px] group">
                                    {/* Base Border */}
                                    <div className="absolute -inset-3 rounded-xl border-2 border-dashed border-gray-700" />

                                    {/* Travelling Dot SVG */}
                                    <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none z-20 overflow-visible">
                                        <rect width="100%" height="100%" rx="12" fill="none" stroke="none" />
                                        <circle r="3" fill="#f97316" className="opacity-0 animate-dot-rect-1">
                                            {/* Motion path along the rect */}
                                            <animateMotion
                                                dur="6s"
                                                repeatCount="indefinite"
                                                path="M 12,0 H 340 A 12,12 0 0 1 352,12 V 432 A 12,12 0 0 1 340,444 H 12 A 12,12 0 0 1 0,432 V 12 A 12,12 0 0 1 12,0 Z"
                                                calcMode="linear"
                                                keyPoints="0;0.25;0.25;0.25;1"
                                                keyTimes="0;0.25;0.26;0.99;1"
                                            />
                                            {/* Note: The rect path above is an approximation. For responsive rects, CSS offset-path is better but support varies.
                                                We'll use a CSS-based approach for the dot movement around a generic box which is robust. 
                                            */}
                                        </circle>
                                    </svg>

                                    {/* CSS-based Moving Dot Container */}
                                    <div className="absolute -inset-3 pointer-events-none overflow-visible z-20">
                                        <div className="absolute top-0 left-0 w-full h-[2px] overflow-visible">
                                            {/* Dot Top Edge */}
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -top-[2px] animate-dot-top-1 opacity-0" />
                                        </div>
                                        <div className="absolute top-0 right-0 w-[2px] h-full overflow-visible">
                                            {/* Dot Right Edge */}
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -right-[2px] animate-dot-right-1 opacity-0" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-full h-[2px] overflow-visible">
                                            {/* Dot Bottom Edge */}
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -bottom-[2px] animate-dot-bottom-1 opacity-0" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-[2px] h-full overflow-visible">
                                            {/* Dot Left Edge */}
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -left-[2px] animate-dot-left-1 opacity-0" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="bg-white rounded-lg h-full overflow-hidden shadow-inner relative z-10">
                                        <img
                                            src="https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/public/OCR/system/workflow-source.png"
                                            alt="原文文档"
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </div>

                                    {/* Connector Node */}
                                    <div className="hidden md:block absolute top-1/2 -right-[19px] w-3 h-3 rounded-full bg-gray-900 border-2 border-gray-600 z-20 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Markdown */}
                        <div className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5 h-[56px]">
                                <FileCode size={18} className="text-gray-400" />
                                <span className="font-medium text-white">Markdown</span>
                            </div>
                            <div className="p-8 pb-10 flex-1">
                                <div className="relative h-[420px] group">
                                    <div className="absolute -inset-3 rounded-xl border-2 border-dashed border-gray-700" />

                                    {/* CSS Moving Dot */}
                                    <div className="absolute -inset-3 pointer-events-none overflow-visible z-20">
                                        <div className="absolute top-0 left-0 w-full h-[2px]">
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -top-[2px] animate-dot-top-2 opacity-0" />
                                        </div>
                                        <div className="absolute top-0 right-0 w-[2px] h-full">
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -right-[2px] animate-dot-right-2 opacity-0" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-full h-[2px]">
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -bottom-[2px] animate-dot-bottom-2 opacity-0" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-[2px] h-full">
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -left-[2px] animate-dot-left-2 opacity-0" />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg h-full overflow-hidden shadow-inner relative z-10 scale-[0.99]">
                                        <img
                                            src="https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/public/OCR/system/workflow-markdow.png"
                                            alt="Markdown输出"
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </div>

                                    <div className="hidden md:block absolute top-1/2 -left-[19px] w-3 h-3 rounded-full bg-gray-900 border-2 border-gray-600 z-20 -translate-y-1/2" />
                                    <div className="hidden md:block absolute top-1/2 -right-[19px] w-3 h-3 rounded-full bg-gray-900 border-2 border-gray-600 z-20 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>

                        {/* Card 3: JSON */}
                        <div className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5 h-[56px]">
                                <Braces size={18} className="text-accent-orange" />
                                <span className="font-medium text-white">JSON</span>
                            </div>
                            <div className="p-8 pb-10 flex-1">
                                <div className="relative h-[420px] group">
                                    <div className="absolute -inset-3 rounded-xl border-2 border-dashed border-gray-700" />

                                    {/* CSS Moving Dot */}
                                    <div className="absolute -inset-3 pointer-events-none overflow-visible z-20">
                                        <div className="absolute top-0 left-0 w-full h-[2px]">
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -top-[2px] animate-dot-top-3 opacity-0" />
                                        </div>
                                        <div className="absolute top-0 right-0 w-[2px] h-full">
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -right-[2px] animate-dot-right-3 opacity-0" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-full h-[2px]">
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -bottom-[2px] animate-dot-bottom-3 opacity-0" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-[2px] h-full">
                                            <div className="absolute h-1.5 w-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(249,115,22,1)] -left-[2px] animate-dot-left-3 opacity-0" />
                                        </div>
                                    </div>

                                    <div className="bg-[#1e1e1e] rounded-lg h-full overflow-hidden relative z-10">
                                        <img
                                            src="https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/public/OCR/system/workflow-json.png"
                                            alt="JSON输出"
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </div>

                                    <div className="hidden md:block absolute top-1/2 -left-[19px] w-3 h-3 rounded-full bg-gray-900 border-2 border-gray-600 z-20 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                /* Total Duration per cycle: 8s */
                /* 
                   Card 1 Perimeter: 2s (approx)
                   Gap 1: 0.5s
                   Card 2 Perimeter: 2s
                   Gap 2: 0.5s
                   Card 3 Perimeter: 2s
                   Reset: 1s
                */
                
                /* CARD 1 (0s - 2s) */
                .animate-dot-top-1    { animation: dot-horz-fwd 8s linear infinite; animation-delay: 0s; }
                .animate-dot-right-1  { animation: dot-vert-fwd 8s linear infinite; animation-delay: 0.5s; }
                .animate-dot-bottom-1 { animation: dot-horz-rev 8s linear infinite; animation-delay: 1.0s; }
                .animate-dot-left-1   { animation: dot-vert-rev 8s linear infinite; animation-delay: 1.5s; }

                /* GAP 1 (2s - 2.6s) */
                .animate-dot-connect-1 { animation: dot-connect 8s linear infinite; animation-delay: 2.0s; }

                /* CARD 2 (2.6s - 4.6s) */
                .animate-dot-top-2    { animation: dot-horz-fwd 8s linear infinite; animation-delay: 2.6s; }
                .animate-dot-right-2  { animation: dot-vert-fwd 8s linear infinite; animation-delay: 3.1s; }
                .animate-dot-bottom-2 { animation: dot-horz-rev 8s linear infinite; animation-delay: 3.6s; }
                .animate-dot-left-2   { animation: dot-vert-rev 8s linear infinite; animation-delay: 4.1s; }

                /* GAP 2 (4.6s - 5.2s) */
                .animate-dot-connect-2 { animation: dot-connect 8s linear infinite; animation-delay: 4.6s; }

                /* CARD 3 (5.2s - 7.2s) */
                .animate-dot-top-3    { animation: dot-horz-fwd 8s linear infinite; animation-delay: 5.2s; }
                .animate-dot-right-3  { animation: dot-vert-fwd 8s linear infinite; animation-delay: 5.7s; }
                .animate-dot-bottom-3 { animation: dot-horz-rev 8s linear infinite; animation-delay: 6.2s; }
                .animate-dot-left-3   { animation: dot-vert-rev 8s linear infinite; animation-delay: 6.7s; }


                /* Reusable Keyframes for sides */
                @keyframes dot-horz-fwd {
                    0% { left: 0%; opacity: 1; }
                    6% { left: 100%; opacity: 1; }  /* ~0.5s out of 8s */
                    6.1% { opacity: 0; }
                    100% { opacity: 0; }
                }
                @keyframes dot-vert-fwd {
                    0% { top: 0%; opacity: 1; }
                    6% { top: 100%; opacity: 1; }
                    6.1% { opacity: 0; }
                    100% { opacity: 0; }
                }
                @keyframes dot-horz-rev {
                    0% { right: 0%; opacity: 1; }
                    6% { right: 100%; opacity: 1; }
                    6.1% { opacity: 0; }
                    100% { opacity: 0; }
                }
                @keyframes dot-vert-rev {
                    0% { bottom: 0%; opacity: 1; }
                    6% { bottom: 100%; opacity: 1; }
                    6.1% { opacity: 0; }
                    100% { opacity: 0; }
                }
                @keyframes dot-connect {
                    0% { left: 0%; opacity: 1; }
                    7.5% { left: 100%; opacity: 1; } /* ~0.6s out of 8s */
                    7.6% { opacity: 0; }
                    100% { opacity: 0; }
                }
            `}</style>
        </section>
    );
};

export default Workflow;
