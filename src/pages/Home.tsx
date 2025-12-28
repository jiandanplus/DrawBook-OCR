import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Workflow from '../components/Workflow';
import ScenarioTabs from '../components/ScenarioTabs';
import ElementsGrid from '../components/ElementsGrid';
import Integration from '../components/Integration';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <main>
            <Navbar />
            <Hero />
            <Stats />
            <Workflow />
            <ScenarioTabs />
            <ElementsGrid />
            <Integration />
            <Pricing />
            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden bg-black">
                <div className="absolute inset-0 bg-accent-orange/5" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-orange/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">好数据，决定好效果</h2>
                    <p className="text-xl text-gray-400 mb-10">
                        立即开始体验新一代文档智能解析引擎
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="px-8 py-4 bg-accent-orange text-white text-lg font-medium rounded hover:bg-orange-600 transition-colors w-full sm:w-auto shadow-[0_0_20px_rgba(255,140,0,0.3)] hover:shadow-[0_0_30px_rgba(255,140,0,0.5)]">
                            免费试用
                        </button>
                        <button className="px-8 py-4 bg-white text-black text-lg font-medium rounded hover:bg-gray-200 transition-colors w-full sm:w-auto">
                            商务咨询
                        </button>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    )
}

export default Home;
