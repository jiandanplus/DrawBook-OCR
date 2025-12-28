import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const Consulting = () => {
    useEffect(() => {
        // In a real app, this might redirect or open a modal
        const timer = setTimeout(() => {
            window.location.href = "https://www.feishu.cn/invitation/page/add_contact/?token=example";
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
            <Navbar />
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-accent-orange animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-2">正在跳转至商务咨询...</h2>
                <p className="text-gray-500">Redirecting to contact form</p>
            </div>
        </div>
    );
};

export default Consulting;
