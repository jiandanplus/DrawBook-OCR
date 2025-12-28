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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

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

                const { data: logs } = await supabase
                    .from('usage_logs')
                    .select('created_at, pages_processed')
                    .eq('user_id', user.id)
                    .gte('created_at', startDate.toISOString())
                    .order('created_at', { ascending: true });

                // Process logs for Stats & Chart
                let totalUsed = 0;
                // Group by date for chart
                const dateMap = new Map<string, number>();

                // Initialize dates in range with 0
                for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
                    dateMap.set(d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }), 0);
                }

                logs?.forEach(log => {
                    totalUsed += log.pages_processed || 0;
                    const dateKey = new Date(log.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
                    if (dateMap.has(dateKey)) {
                        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + (log.pages_processed || 0));
                    }
                });

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
        <div className="space-y-8">
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
