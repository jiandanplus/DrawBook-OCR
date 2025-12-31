import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h1 className="text-4xl md:text-6xl font-bold mb-8">
                            让数据 <span className="text-accent-orange">更懂业务</span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                            DrawBookAI 致力于解决 AI 时代"暗数据"难题。
                            我们将 PDF、图片等非结构化文档转化为 LLM 可理解的高质量数据，
                            成为大模型应用的坚实地基。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                        <div className="p-8 rounded-2xl bg-card-bg border border-white/10 hover:border-accent-orange/30 transition-colors">
                            <div className="text-3xl font-bold text-white mb-2">轻量级</div>
                            <div className="text-sm text-gray-500 mb-6">模块化设计</div>
                            <p className="text-gray-400">
                                模块化设计，易于扩展，支持各种垂直场景拓展微调。
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-card-bg border border-white/10 hover:border-accent-orange/30 transition-colors">
                            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                            <div className="text-sm text-gray-500 mb-6">解析还原度</div>
                            <p className="text-gray-400">
                                不仅仅是 OCR，更是对文档逻辑结构的深度理解与精准还原。
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-10 text-center border border-white/10">
                        <h2 className="text-2xl font-bold mb-6">联系我们</h2>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                            <div className="text-left">
                                <div className="text-sm text-gray-500 mb-1">官方邮箱</div>
                                <div className="text-lg font-medium text-white mb-4">jfd001@drawbookai.cn</div>

                                <div className="text-sm text-gray-500 mb-1">总部地址</div>
                                <div className="text-lg font-medium text-white">苏州市 · 高新区</div>
                            </div>
                            <div className="w-32 h-32 bg-white p-2 rounded-lg">
                                <img src="https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/public/OCR/system/qrcode_for_gh_29f004336b5d_258.jpg" alt="WeChat QR Code" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default About;
