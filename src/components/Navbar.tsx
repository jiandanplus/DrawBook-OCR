import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: '免费体验', path: '/newTrial' },
        {
            name: '产品接入',
            path: '#',
            dropdown: [
                { name: '产品定价', path: '/#api-pricing' }, // Simple anchor for now
                { name: 'API 工作台', path: '/login' },
                { name: 'API 文档', path: 'https://apifox.com/apidoc/shared-def8d80c-0335-433b-8533-5c8e426639d6' },
                { name: '更新日志', path: '#' }
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

                {/* CTA Button */}
                <div className="hidden md:block">
                    <Link to="/login" className="px-5 py-2 text-sm font-medium text-black bg-white rounded hover:bg-gray-200 transition-colors">
                        请登录 / 注册
                    </Link>
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
                        <Link to="/login" className="block text-center w-full px-5 py-3 text-sm font-medium text-black bg-white rounded hover:bg-gray-200 transition-colors mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                            请登录 / 注册
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
