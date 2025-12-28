import { useState } from 'react';
import { BookOpen, TrendingUp, Building2, FlaskConical, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScenarioTabs = () => {
    const [activeTab, setActiveTab] = useState('academic');
    const [viewMode, setViewMode] = useState<'markdown' | 'json'>('markdown');

    const scenarios = [
        { id: 'academic', label: '学术论文', icon: <BookOpen size={18} /> },
        { id: 'financial', label: '金融研报', icon: <TrendingUp size={18} /> },
        { id: 'industrial', label: '工业文档', icon: <Building2 size={18} /> },
        { id: 'scientific', label: '科技文献', icon: <FlaskConical size={18} /> },
        { id: 'general', label: '通用办公', icon: <FileText size={18} /> },
    ];

    const contentMap = {
        academic: {
            markdown: "# Deep Learning in Computer Vision\n\n## Abstract\nThis paper proposes a novel architecture...\n\n$$\nL = \\frac{1}{N} \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2\n$$\n\n## 1. Introduction\nRecent advances in CNNs have shown...",
            json: "{\n  \"title\": \"Deep Learning in Computer Vision\",\n  \"sections\": [\n    {\n      \"heading\": \"Abstract\",\n      \"content\": \"This paper proposes...\"\n    }\n  ]\n}"
        },
        financial: {
            markdown: "# Q3 2024 Financial Report\n\n| Metric | Q3 2024 | Q3 2023 | YoY |\n|--------|---------|---------|-----|\n| Revenue| $10.5B  | $9.2B   | +14%|\n| Net Inc| $2.1B   | $1.8B   | +16%|\n\n## Market Analysis\nThe market showed strong resilience...",
            json: "{\n  \"report_type\": \"Financial\",\n  \"quarter\": \"Q3 2024\",\n  \"tables\": [\n    {\n      \"rows\": 3,\n      \"cols\": 4\n    }\n  ]\n}"
        },
        // Simplified for other scenarios to avoid excessive file length
        industrial: { markdown: "# Equipment Maintenance Manual", json: "{ \"manual\": \"Equipment\" }" },
        scientific: { markdown: "# Chemical Reaction Analysis", json: "{ \"type\": \"Analysis\" }" },
        general: { markdown: "# Project Proposal Draft", json: "{ \"doc\": \"Proposal\" }" },
    };

    return (
        <section className="py-24 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">多元场景通用</h2>
                    <p className="text-gray-400">一套模型，适配多种复杂文档场景</p>
                </div>

                {/* Tabs - Centered Scrollable */}
                <div className="flex justify-start md:justify-center overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar px-4">
                    {scenarios.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-black'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Preview Window */}
                <div className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden h-[600px] flex flex-col md:flex-row shadow-2xl">
                    {/* Left: Input Preview (Static Image Placeholder) */}
                    <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-white/10 p-6 bg-[#0a0a0a] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-400">原始文档 Preview</span>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                            <p className="text-gray-600">Document Preview: {scenarios.find(s => s.id === activeTab)?.label}</p>
                        </div>
                    </div>

                    {/* Right: Output Preview */}
                    <div className="w-full md:w-1/2 p-0 flex flex-col bg-[#0d1117]">
                        {/* Header with Toggle */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <span className="text-sm font-medium text-accent-orange">解析结果</span>
                            <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
                                <button
                                    onClick={() => setViewMode('markdown')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'markdown' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Markdown
                                </button>
                                <button
                                    onClick={() => setViewMode('json')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'json' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    JSON
                                </button>
                            </div>
                        </div>

                        {/* Code Content */}
                        <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeTab}-${viewMode}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <pre className="text-gray-300">
                                        {/* @ts-ignore */}
                                        {contentMap[activeTab]?.[viewMode] || "Checking content..."}
                                    </pre>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScenarioTabs;
