import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowRight, Activity, Database, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
    const [timeRange, setTimeRange] = useState('30days');
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        usedPages: 0,
        remainingPages: 0,
        usedIncrease: 0 // Mocked for now, or calculate from logs
    });
    const [rewardNotification, setRewardNotification] = useState({ show: false, message: '', amount: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 0. Check & Claim Daily Reward
                const { data: rewardResult } = await supabase.rpc('claim_daily_reward', { p_user_id: user.id });
                if (rewardResult && rewardResult.success) {
                    setRewardNotification({
                        show: true,
                        message: `🎉 每日登录奖励已到账：+${rewardResult.amount}页`,
                        amount: rewardResult.amount
                    });
                    // Hide after 5 seconds
                    setTimeout(() => setRewardNotification(prev => ({ ...prev, show: false })), 5000);
                }

                // 1. Get Profile (Balance)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('balance_pages')
                    .eq('id', user.id)
                    .single();

                // 2. Get Usage Logs (For Chart & Total Used)
                // Calculate date range start
                const now = new Date();
                const startDate = new Date();
                if (timeRange === '7days') startDate.setDate(now.getDate() - 7);
                else if (timeRange === '90days') startDate.setDate(now.getDate() - 90);
                else startDate.setDate(now.getDate() - 30);

                const { data: logs, error: logsError } = await supabase
                    .from('usage_logs')
                    .select('created_at, pages_processed')
                    .eq('user_id', user.id)
                    .gte('created_at', startDate.toISOString())
                    .order('created_at', { ascending: true });

                console.log('Usage logs query result:', { logs, logsError, startDate: startDate.toISOString() });

                // Process logs for Stats & Chart
                let totalUsed = 0;
                // Group by date for chart
                const dateMap = new Map<string, number>();

                // Helper to format date consistently
                const formatDateKey = (date: Date) => {
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${month}/${day}`;
                };

                // Initialize dates in range with 0
                for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
                    dateMap.set(formatDateKey(new Date(d)), 0);
                }

                logs?.forEach(log => {
                    totalUsed += log.pages_processed || 0;
                    const logDate = new Date(log.created_at);
                    const dateKey = formatDateKey(logDate);
                    if (dateMap.has(dateKey)) {
                        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + (log.pages_processed || 0));
                    }
                });

                console.log('Calculated stats:', { totalUsed, dateMap: Object.fromEntries(dateMap) });

                setStats({
                    usedPages: totalUsed,
                    remainingPages: profile?.balance_pages || 0,
                    usedIncrease: 12 // Mock
                });

                const formattedChartData = Array.from(dateMap).map(([name, value]) => ({ name, value }));
                setChartData(formattedChartData);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 relative">
            {/* Daily Reward Notification */}
            {rewardNotification.show && (
                <div className="absolute top-0 right-0 z-50 animate-in fade-in slide-in-from-top-5 duration-500">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-white/20">
                        <div className="p-1 bg-white/20 rounded-full">
                            <Activity size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{rewardNotification.message}</p>
                        </div>
                        <button
                            onClick={() => setRewardNotification(prev => ({ ...prev, show: false }))}
                            className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors"
                        >
                            <ArrowRight size={14} className="rotate-45" /> {/* Close icon lookalike */}
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">已使用额度</span>
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Activity size={20} className="text-orange-500" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl font-bold text-white">{stats.usedPages.toLocaleString()} <span className="text-sm font-normal text-gray-500">页</span></div>
                        <div className="text-xs text-green-500 flex items-center gap-1">
                            <ArrowUpRight size={12} />
                            <span>较昨日 +{stats.usedIncrease}%</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 space-y-4 relative overflow-hidden group">
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 p-8 bg-orange-500/20 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-gray-400">剩余额度</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Database size={20} className="text-blue-500" />
                        </div>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <div className="text-3xl font-bold text-white">{stats.remainingPages.toLocaleString()} <span className="text-sm font-normal text-gray-500">页</span></div>
                        <Link to="/workbench/purchase" className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1 cursor-pointer">
                            <span>余额不足? 去充值</span>
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Usage Chart */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">使用记录</h3>
                    <div className="flex bg-white/5 rounded-lg p-1">
                        {['7days', '30days', '90days'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${timeRange === range
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {range === '7days' ? '近7天' : range === '30days' ? '近30天' : '近3个月'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#666"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                    dy={10}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="#666"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            暂无数据
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
