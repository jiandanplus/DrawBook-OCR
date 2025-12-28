import { useState } from 'react';
import { QrCode, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
    const [loginMethod, setLoginMethod] = useState<'qrcode' | 'password'>('password');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen bg-black flex overflow-hidden">
            {/* Left - Auth Form */}
            <div className="w-full lg:w-[480px] p-8 flex flex-col justify-center border-r border-white/10 bg-card-bg relative z-20">
                <div className="max-w-xs w-full mx-auto">
                    <div className="mb-12">
                        <Link to="/" className="text-2xl font-bold text-white tracking-tighter">
                            DrawBookAI
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold mb-8">
                        {loginMethod === 'qrcode'
                            ? '微信扫码登录/注册'
                            : (isRegistering ? '注册新账号' : '账号密码登录')}
                    </h1>

                    {/* Tabs */}
                    <div className="flex items-center gap-6 mb-8 border-b border-white/10">
                        <button
                            onClick={() => setLoginMethod('qrcode')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${loginMethod === 'qrcode' ? 'text-accent-orange' : 'text-gray-500 hover:text-white'}`}
                        >
                            二维码登录
                            {loginMethod === 'qrcode' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-orange" />}
                        </button>
                        <button
                            onClick={() => setLoginMethod('password')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${loginMethod === 'password' ? 'text-accent-orange' : 'text-gray-500 hover:text-white'}`}
                        >
                            密码登录
                            {loginMethod === 'password' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-orange" />}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-[350px]">
                        {loginMethod === 'qrcode' ? (
                            <div className="flex flex-col items-center">
                                <div className="w-48 h-48 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center mb-4">
                                    <QrCode size={96} className="text-white opacity-80" />
                                </div>
                                <p className="text-sm text-gray-500">
                                    请使用 <span className="text-green-500">微信</span> 扫描二维码登录
                                </p>
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={async (e) => {
                                e.preventDefault();
                                setLoading(true);
                                const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                                const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

                                try {
                                    if (isRegistering) {
                                        // Sign Up
                                        const { error } = await supabase.auth.signUp({
                                            email,
                                            password,
                                            options: {
                                                data: {
                                                    balance_pages: 100 // Give initial balance
                                                }
                                            }
                                        });
                                        if (error) throw error;
                                        alert('注册成功！请检查您的邮箱完成验证，或直接登录 (如果此项目禁用了验证)。');
                                        setIsRegistering(false); // Switch back to login
                                    } else {
                                        // Sign In
                                        const { error } = await supabase.auth.signInWithPassword({
                                            email,
                                            password
                                        });
                                        if (error) throw error;
                                        window.location.href = '/workbench';
                                    }
                                } catch (error: any) {
                                    alert('操作失败: ' + error.message);
                                } finally {
                                    setLoading(false);
                                }
                            }}>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">手机号 / 邮箱</label>
                                    <input
                                        name="email"
                                        type="text"
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-orange transition-colors"
                                        placeholder="请输入手机号或邮箱"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <div className="flex justify-between mb-1.5">
                                        <label className="block text-xs font-medium text-gray-400">密码</label>
                                        {!isRegistering && (
                                            <Link to="/reset-password" className="text-xs text-accent-orange hover:text-orange-400">忘记密码?</Link>
                                        )}
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-orange transition-colors"
                                        placeholder={isRegistering ? "设置您的登录密码" : "请输入密码"}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-8 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-orange focus:ring-accent-orange" required={isRegistering} />
                                    <label htmlFor="remember" className="text-xs text-gray-400">
                                        {isRegistering ? '同意服务条款和隐私协议' : '30天内自动登录'}
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-accent-orange text-white font-medium py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={18} className="animate-spin" />}
                                    {isRegistering ? '注册并登录' : '登录'}
                                </button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsRegistering(!isRegistering)}
                                        className="text-sm text-gray-500 hover:text-white transition-colors"
                                    >
                                        {isRegistering ? '已有账号？去登录' : '没有账号？注册新账号'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="mt-12 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-gray-500">
                            登录即代表同意 <a href="#" className="text-gray-300 hover:text-accent-orange">用户协议</a> 和 <a href="#" className="text-gray-300 hover:text-accent-orange">隐私政策</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right - Art/Showcase */}
            <div className="hidden lg:flex flex-1 relative bg-[#050505] items-center justify-center p-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-orange/10 via-transparent to-transparent opacity-50" />

                <div className="relative z-10 max-w-2xl w-full">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-accent-orange text-xs font-medium mb-6">
                            <ShieldCheck size={14} /> Enterprise Grade Security
                        </div>
                        <h2 className="text-5xl font-bold mb-6 leading-tight">
                            释放非结构化数据的<br />
                            <span className="text-accent-orange">无限潜能</span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            加入 10,000+ 企业，使用 DrawBookAI 构建更智能的文档处理工作流。
                        </p>
                    </div>

                    {/* Abstract UI Mockup */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl blur opacity-20" />
                        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-2xl">
                            <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-white/10 rounded-full w-3/4" />
                                <div className="h-2 bg-white/10 rounded-full w-1/2" />
                                <div className="h-32 bg-white/5 rounded-lg mt-4 border border-white/5 flex items-center justify-center text-gray-600 text-xs">
                                    AI Processing...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
