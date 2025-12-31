import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Pricing = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center pt-20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4 text-white">产品定价</h1>
                    <p className="text-gray-400">更灵活的计费方案正在规划中，敬请期待...</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Pricing;
