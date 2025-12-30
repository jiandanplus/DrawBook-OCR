import { useEffect, useState, useRef } from 'react';
import { Mail, Smartphone, Lock, Edit2, Loader2, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadFileToS3 } from '../../services/storageService';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            // New path format: user/{uuid}/logo/{timestamp}.{ext}
            const fileName = `user/${user.id}/logo/${Date.now()}.${fileExt}`;

            // 1. Upload to S3
            const { url } = await uploadFileToS3(file, fileName);

            // 2. Update Profile in DB
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    avatar_url: url,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // 3. Update Local State
            setProfile((prev: any) => ({ ...prev, avatar_url: url }));

        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('头像上传失败，请重试');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

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
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-2 border-transparent group-hover:border-orange-500 transition-all">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.email?.[0].toUpperCase() || 'S'
                            )}
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {uploading ? (
                                <Loader2 size={20} className="text-white animate-spin" />
                            ) : (
                                <Camera size={20} className="text-white" />
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
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
