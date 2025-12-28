import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronLeft } from 'lucide-react';

const ResetPassword = () => {
    const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form states
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);

    // Mock countdown
    const [countdown, setCountdown] = useState(0);

    const handleSendCode = () => {
        if (countdown > 0) return;
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="flex min-h-screen bg-[#0A0A0A] font-sans text-white">
            {/* Left Side - Form */}
            <div className="w-full lg:w-[480px] flex flex-col p-8 lg:p-12 relative z-10 bg-[#0A0A0A]">
                <div className="mb-12">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg"></div>
                        <span className="text-xl font-bold">DrawBookAI</span>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-[360px] mx-auto w-full">
                    <div className="mb-8">
                        <Link to="/login" className="text-gray-400 hover:text-white flex items-center gap-1 mb-4 text-sm transition-colors">
                            <ChevronLeft size={16} />
                            返回登录
                        </Link>
                        <h1 className="text-3xl font-bold mb-2">重置密码</h1>
                        <p className="text-gray-400 text-sm">请输入您的账号信息以重置密码</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10 mb-8">
                        <button
                            onClick={() => setActiveTab('phone')}
                            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'phone' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            手机验证码
                            {activeTab === 'phone' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`pb-4 px-2 text-sm font-medium transition-colors relative ml-8 ${activeTab === 'email' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            邮箱验证码
                            {activeTab === 'email' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full"></div>
                            )}
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {activeTab === 'phone' ? (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">手机号码 <span className="text-orange-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="请输入手机号码"
                                        className="w-full bg-[#141414] border border-white/10 rounded-lg h-12 px-4 pl-11 text-white placeholder:text-gray-600 focus:border-orange-500 focus:outline-none transition-colors"
                                    />
                                    <Smartphone className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">邮箱地址 <span className="text-orange-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="请输入邮箱地址"
                                        className="w-full bg-[#141414] border border-white/10 rounded-lg h-12 px-4 pl-11 text-white placeholder:text-gray-600 focus:border-orange-500 focus:outline-none transition-colors"
                                    />
                                    <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                </div>
                            </div>
                        )}

                        {/* Verification Code */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">验证码 <span className="text-orange-500">*</span></label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="请输入验证码"
                                        className="w-full bg-[#141414] border border-white/10 rounded-lg h-12 px-4 pl-11 text-white placeholder:text-gray-600 focus:border-orange-500 focus:outline-none transition-colors"
                                    />
                                    <ShieldCheck className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                </div>
                                <button
                                    onClick={handleSendCode}
                                    disabled={countdown > 0}
                                    className={`px-4 h-12 rounded-lg text-sm font-medium transition-colors border border-white/10 ${countdown > 0
                                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                >
                                    {countdown > 0 ? `${countdown}s 后获取` : '获取验证码'}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">新密码 <span className="text-orange-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="8-20位，包含字母、数字或符号"
                                    className="w-full bg-[#141414] border border-white/10 rounded-lg h-12 px-4 pl-11 pr-10 text-white placeholder:text-gray-600 focus:border-orange-500 focus:outline-none transition-colors"
                                />
                                <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">确认密码 <span className="text-orange-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="请再次输入新密码"
                                    className="w-full bg-[#141414] border border-white/10 rounded-lg h-12 px-4 pl-11 pr-10 text-white placeholder:text-gray-600 focus:border-orange-500 focus:outline-none transition-colors"
                                />
                                <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Agreement */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="agreement"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-transparent text-orange-500 focus:ring-offset-0 focus:ring-transparent"
                            />
                            <label htmlFor="agreement" className="text-xs text-gray-400 select-none">
                                我已阅读并同意 <Link to="#" className="text-orange-500 hover:text-orange-400">用户协议</Link> 和 <Link to="#" className="text-orange-500 hover:text-orange-400">隐私政策</Link>
                            </label>
                        </div>

                        <button className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white h-12 rounded-lg font-medium hover:opacity-90 transition-opacity">
                            重置密码
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-600">
                    &copy; 2024 DrawBookAI. All rights reserved.
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex flex-1 relative bg-[#050505] items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-[#050505] to-[#050505]"></div>

                {/* Decorative Elements */}
                <div className="relative z-10 w-[600px] h-[600px]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]"></div>

                    {/* Floating Cards Mockup */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                        <div className="w-[400px] h-[500px] border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-6 transform -rotate-6 shadow-2xl">
                            <div className="h-4 w-1/3 bg-white/10 rounded mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-white/5 rounded"></div>
                                <div className="h-2 w-5/6 bg-white/5 rounded"></div>
                                <div className="h-2 w-4/6 bg-white/5 rounded"></div>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="h-24 bg-white/5 rounded-lg"></div>
                                <div className="h-24 bg-white/5 rounded-lg"></div>
                            </div>
                        </div>
                        <div className="absolute w-[400px] h-[500px] border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl rounded-2xl p-6 transform rotate-3 shadow-2xl translate-x-12 translate-y-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <Lock className="text-orange-500" />
                                </div>
                                <div>
                                    <div className="h-3 w-24 bg-white/20 rounded mb-2"></div>
                                    <div className="h-2 w-32 bg-white/10 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-full bg-white/5 rounded-lg border border-white/5"></div>
                                <div className="h-12 w-full bg-white/5 rounded-lg border border-white/5"></div>
                                <button className="w-full h-12 bg-orange-500 rounded-lg opacity-80"></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
