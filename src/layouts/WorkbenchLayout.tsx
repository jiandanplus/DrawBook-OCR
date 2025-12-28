import { useEffect, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Key, CreditCard, FileText, User, MessageSquare, HelpCircle, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WorkbenchLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate('/login');
                } else {
                    setUser(session.user);
                }
            } catch (error) {
                console.error('Session check error:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                navigate('/login');
            } else {
                setUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
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
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg"></div>
                        <span className="text-xl font-bold">Sumark</span>
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
