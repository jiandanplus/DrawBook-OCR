import { useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Key, CreditCard, FileText, User, MessageSquare, HelpCircle, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WorkbenchLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading, signOut } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: '概览', path: '/workbench/dashboard' },
        { icon: Key, label: 'APIKEY管理', path: '/workbench/apikey' },
        { icon: CreditCard, label: '费用中心', path: '/workbench/purchase' },
        { icon: FileText, label: 'API说明文档', path: '/workbench/docs' },
        { icon: User, label: '个人中心', path: '/workbench/profile' },
        { icon: MessageSquare, label: '商务咨询', path: '/workbench/inquiry' },
        { icon: HelpCircle, label: '问题反馈', path: '/workbench/feedback' },
    ];

    const isActive = (path: string) => location.pathname === path;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed h-full bg-[#0A0A0A] z-20">
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/sign/OCR/system/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZDVkYTBlZi1hMDFmLTQ5MGItODI4MC1iNzg1N2E2M2Y3NWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJPQ1Ivc3lzdGVtL2xvZ28ucG5nIiwiaWF0IjoxNzY3MDE1NjQ3LCJleHAiOjMxNTM2MDE3MzU0Nzk2NDd9.mAmIp6aAlBXUY0o9-h4p2WZss6jhm2VogjoPTx2eCUI" alt="DrawBookAI Logo" className="h-8 w-auto rounded-lg" />
                        <span className="text-xl font-bold">DrawBookAI</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-orange-500/10 text-orange-500'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                            {user?.email?.[0]?.toUpperCase() || <User size={16} />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate" title={user?.email}>
                                {user?.email || 'User'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                    >
                        <LogOut size={16} />
                        <span>登出</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>工作台</span>
                        <ChevronRight size={14} />
                        <span className="text-white">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Could add notifications or other header items here */}
                    </div>
                </header>

                <div className="p-8 flex-1 bg-[#0A0A0A]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default WorkbenchLayout;
