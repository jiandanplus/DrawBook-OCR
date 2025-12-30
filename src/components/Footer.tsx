

const Footer = () => {
    return (
        <footer className="bg-[#050505] border-t border-white/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/sign/OCR/system/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZDVkYTBlZi1hMDFmLTQ5MGItODI4MC1iNzg1N2E2M2Y3NWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJPQ1Ivc3lzdGVtL2xvZ28ucG5nIiwiaWF0IjoxNzY3MDE1NjQ3LCJleHAiOjMxNTM2MDE3MzU0Nzk2NDd9.mAmIp6aAlBXUY0o9-h4p2WZss6jhm2VogjoPTx2eCUI" alt="DrawBookAI Logo" className="h-8 w-auto rounded-lg" />
                            <div className="text-2xl font-bold tracking-tighter text-white">
                                DrawBookAI
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            致力于为 AI 时代提供最精准的文档解析不仅是工具，更是基础设施。
                        </p>
                        <div className="text-sm text-gray-500">
                            © 2024 DrawBookAI Tech.
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">产品</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">功能特性</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">API 文档</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">定价方案</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">更新日志</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">资源</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">开发者社区</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">帮助中心</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">开源贡献</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">关于</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">团队介绍</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">联系我们</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-accent-orange transition-colors">加入我们</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Terms of Service</a>
                    </div>
                    <p className="text-xs text-gray-600">Designed with ❤️ for AI</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
