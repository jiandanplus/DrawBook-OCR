import { ArrowRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-orange/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                    >
                        DrawBookAI <span className="text-accent-orange">文档智能</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
                    >
                        新一代文档解析与转换引擎，将 PDF、图片精准转换为 Markdown 与 JSON 数据。
                        <br className="hidden md:block" />
                        让数据更懂业务，让模型更智能。
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/newTrial" className="px-8 py-4 bg-accent-orange text-white text-lg font-medium rounded hover:bg-orange-600 transition-colors w-full sm:w-auto inline-block">
                            免费体验
                        </Link>
                        <Link to="/consulting" className="px-8 py-4 bg-white/5 text-white border border-white/10 text-lg font-medium rounded hover:bg-white/10 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                            商务咨询 <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </div>

                {/* Visual Flow Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative max-w-5xl mx-auto mt-12 bg-card-bg border border-white/5 rounded-2xl p-4 md:p-8 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative">
                        {/* Left: Input */}
                        <div className="flex-1 bg-black/50 rounded-xl p-6 border border-white/5 w-full">
                            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-xs text-gray-500 ml-auto">input.pdf</span>
                            </div>
                            <div className="aspect-[3/4] bg-white/5 rounded flex flex-col items-center justify-center gap-3">
                                <FileText size={48} className="text-gray-600" />
                                <span className="text-sm text-gray-500">PDF / Images</span>
                            </div>
                        </div>

                        {/* Middle: Processing */}
                        <div className="flex flex-col items-center gap-2 text-accent-orange">
                            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-accent-orange to-transparent animate-pulse" />
                            <div className="w-12 h-12 rounded-full bg-accent-orange/20 flex items-center justify-center border border-accent-orange relative">
                                <div className="absolute inset-0 rounded-full animate-ping bg-accent-orange/20" />
                                <span className="font-bold text-sm">AI</span>
                            </div>
                            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-accent-orange to-transparent animate-pulse" />
                        </div>

                        {/* Right: Output */}
                        <div className="flex-1 bg-black/50 rounded-xl p-6 border border-white/5 w-full">
                            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                                </div>
                                <span className="text-xs text-gray-500 ml-auto">output.md</span>
                            </div>
                            <div className="aspect-[3/4] bg-white/5 rounded p-4 font-mono text-xs text-gray-400 overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card-bg to-transparent opacity-50" />
                                <p># Title</p>
                                <p className="mt-2">This is parsed text content from the original document.</p>
                                <p className="mt-2 text-blue-400">![Image](url)</p>
                                <p className="mt-2 text-green-400">| Table | Data |</p>
                                <p className="text-green-400">|-------|------|</p>
                                <p className="text-green-400">| Value | 123  |</p>
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
