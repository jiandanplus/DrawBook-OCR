import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const { user, signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Close user menu on outside click
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await signOut();
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { name: '免费体验', path: '/newTrial' },
        {
            name: '产品接入',
            path: '#',
            dropdown: [
                { name: '产品定价', path: '/pricing' },
                { name: 'API 工作台', path: '/workbench' },
                { name: 'API 文档', path: '/api-docs' },
                { name: '更新日志', path: '/changelog' }
            ]
        },
        { name: '商务咨询', path: '/consulting' },
        { name: '关于我们', path: '/about' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${location.pathname !== '/' || isScrolled ? 'bg-black/90 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src="https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/sign/OCR/system/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZDVkYTBlZi1hMDFmLTQ5MGItODI4MC1iNzg1N2E2M2Y3NWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJPQ1Ivc3lzdGVtL2xvZ28ucG5nIiwiaWF0IjoxNzY3MDE1NjQ3LCJleHAiOjMxNTM2MDE3MzU0Nzk2NDd9.mAmIp6aAlBXUY0o9-h4p2WZss6jhm2VogjoPTx2eCUI" alt="DrawBookAI Logo" className="h-8 w-auto rounded-lg" />
                    <div className="text-2xl font-bold tracking-tighter text-white">
                        DrawBookAI <span className="text-[10px] align-top bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent border border-orange-500/30 rounded px-1 ml-1">Beta</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative group"
                            onMouseEnter={() => setActiveDropdown(link.name)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            {link.dropdown ? (
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-accent-orange transition-colors">
                                    {link.name} <ChevronDown size={14} />
                                </button>
                            ) : (
                                <Link
                                    to={link.path}
                                    className="text-sm font-medium text-gray-300 hover:text-accent-orange transition-colors"
                                >
                                    {link.name}
                                </Link>
                            )}

                            {/* Dropdown */}
                            {link.dropdown && activeDropdown === link.name && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-40">
                                    <div className="bg-[#111] border border-white/10 rounded-lg p-2 shadow-xl flex flex-col gap-1">
                                        {link.dropdown.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.path}
                                                className="text-sm text-gray-400 hover:text-white hover:bg-white/10 px-3 py-2 rounded transition-colors text-center"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Desktop User Menu / Auth Button */}
                <div className="hidden md:block">
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg hover:ring-2 ring-white/20 transition-all border border-white/10 shadow-lg"
                            >
                                {user.email?.[0]?.toUpperCase() || <User size={20} />}
                            </button>

                            {/* User Dropdown */}
                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 pt-4 w-48">
                                    <div className="bg-[#161616] border border-white/10 rounded-xl p-2 shadow-2xl flex flex-col gap-1 overflow-hidden">
                                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                                            <p className="text-xs text-gray-500">已登录账号</p>
                                            <p className="text-sm text-white font-medium truncate" title={user.email}>{user.email}</p>
                                        </div>

                                        <Link
                                            to="/workbench/profile"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            <User size={16} />
                                            个人中心
                                        </Link>
                                        <Link
                                            to="/workbench"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            <LayoutDashboard size={16} />
                                            控制台
                                        </Link>
                                        <div className="bg-white/5 h-[1px] my-1 mx-2" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors w-full text-left"
                                        >
                                            <LogOut size={16} />
                                            退出登录
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-5 py-2 text-sm font-medium text-black bg-white rounded hover:bg-gray-200 transition-colors">
                            请登录 / 注册
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 md:hidden">
                    <div className="flex flex-col gap-4">
                        {user && (
                            <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-lg border border-white/10 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                    <p className="text-xs text-green-500">已登录</p>
                                </div>
                            </div>
                        )}

                        {navLinks.map((link) => (
                            <div key={link.name}>
                                {link.dropdown ? (
                                    <div className="space-y-2">
                                        <span className="text-base font-medium text-gray-300 block mb-2">{link.name}</span>
                                        <div className="pl-4 border-l border-white/10 space-y-2">
                                            {link.dropdown.map(item => (
                                                <Link key={item.name} to={item.path} className="block text-sm text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to={link.path}
                                        className="text-base font-medium text-gray-300 hover:text-accent-orange transition-colors block"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </div>
                        ))}

                        {user ? (
                            <>
                                <Link to="/workbench" className="block text-center w-full px-5 py-3 text-sm font-medium text-white bg-white/10 border border-white/10 rounded hover:bg-white/20 transition-colors mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    进入控制台
                                </Link>
                                <button onClick={handleLogout} className="block text-center w-full px-5 py-3 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors mt-2">
                                    退出登录
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="block text-center w-full px-5 py-3 text-sm font-medium text-black bg-white rounded hover:bg-gray-200 transition-colors mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                                请登录 / 注册
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
