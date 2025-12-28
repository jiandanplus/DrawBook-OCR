import { useEffect, useState } from 'react';
import { Mail, Smartphone, Lock, Edit2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const getProfile = async () => {
            try {
                // Get Auth User
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    setUser(user);
                    // Get Profile Data
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (data) setProfile(data);
                    if (error && error.code !== 'PGRST116') {
                        console.error('Error fetching profile:', error);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white">个人中心</h2>

            <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-8 border-b border-white/10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-3xl font-bold text-white">
                        {user?.email?.[0].toUpperCase() || 'S'}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            注册时间：{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-orange-500 text-sm mt-1">
                            剩余额度：{profile?.balance_pages || 0} 页
                        </p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Phone Item */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">手机号码</div>
                                <div className="text-white font-mono">
                                    {profile?.phone || '未绑定'}
                                </div>
                            </div>
                        </div>
                        <button className="text-sm text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1">
                            <Edit2 size={14} />
                            修改
                        </button>
                    </div>

                    {/* Email Item */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">绑定邮箱</div>
                                <div className="text-white font-mono">{user?.email || 'N/A'}</div>
                            </div>
                        </div>
                        <button className="text-sm text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1">
                            <Edit2 size={14} />
                            修改
                        </button>
                    </div>

                    {/* Password Item */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <Lock size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">登录密码</div>
                                <div className="text-white font-mono">••••••••</div>
                            </div>
                        </div>
                        <button className="text-sm text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1">
                            <Edit2 size={14} />
                            重置
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
