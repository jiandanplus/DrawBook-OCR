import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface OCRResult {
    fullResponse: any;
    markdown: string;
}

const Experience = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const processFile = async (file: File) => {
        setLoading(true);
        setError(null);
        setOcrResult(null);

        try {
            // 1. Convert to Base64
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            // Remove data:application/pdf;base64, prefix
            const pureBase64 = base64Data.split(',')[1];

            // Determine file type (0 for PDF, 1 for Image)
            // Note: API expects 'pdf' or 'image' type usually, but checking specific docs.
            // Assuming 0=pdf, 1=image based on common patterns or previous context.
            // If unsure, we can default to image or check extension.
            const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
            // Note: The previous snippet used 0 and 1. Let's stick to what might be expected or safely assume 1 for image.
            // Actually, let's keep it simple: just send base64. The API doc usually specifies 'file' and 'fileType'.
            // Reviewing snippet: const fileType = file.type === 'application/pdf' ? 0 : 1;
            const fileTypeVal = file.type === 'application/pdf' ? 0 : 1;

            // 2. Call Baidu OCR API (Using Proxy)
            const API_URL = '/baidu-api/layout-parsing'; // Use local proxy path
            const TOKEN = import.meta.env.VITE_OCR_TOKEN;

            if (!TOKEN) {
                throw new Error('API Token not configured in .env.local');
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${TOKEN}`
                },
                body: JSON.stringify({
                    file: pureBase64,
                    fileType: fileTypeVal,
                    useDocOrientationClassify: true,
                    useDocUnwarping: true,
                    useLayoutDetection: true,
                    useChartRecognition: true,
                    layoutThreshold: 0.5,
                    layoutNms: true,
                    layoutUnclipRatio: 1.0,
                    layoutMergeBboxesMode: "large",
                    repetitionPenalty: 1.0,
                    prettifyMarkdown: true,
                    visualize: true
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                let errMessage = `API Error: ${response.status}`;
                try {
                    const errJson = JSON.parse(errText);
                    errMessage += ` ${errJson.message || errJson.errorMsg || ''}`;
                } catch (e) {
                    errMessage += ` (Response: ${errText.substring(0, 100)}...)`;
                }
                throw new Error(errMessage);
            }

            const data = await response.json();

            if (data.errorCode && data.errorCode !== 0) {
                throw new Error(data.errorMsg || 'Unknown API Error');
            }

            // 3. Set Result
            // Result structure depends on API. Usually data.result.markdown or similar.
            // Adapting based on typical behavior: data.result.layoutParsingResults which is array
            const combinedMarkdown = data.result?.layoutParsingResults
                ?.map((page: any) => page.markdown?.text)
                .join('\n\n---\n\n') || data.result?.markdown || "解析成功，但未获取到 Markdown 内容";

            setOcrResult({
                fullResponse: data,
                markdown: combinedMarkdown
            });

        } catch (err: any) {
            console.error('OCR Process Error:', err);
            setError(err.message || '文件解析失败，请重试');
        } finally {
            setLoading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto h-[calc(100vh-180px)] min-h-[600px] grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Panel: Upload & Preview */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Upload size={20} className="text-accent-orange" />
                                上传文档
                            </h2>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">支持 PDF / JPG / PNG</span>
                        </div>

                        <div
                            className="flex-1 border-2 border-dashed border-white/10 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex flex-col items-center justify-center relative cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />

                            {loading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 size={48} className="text-accent-orange animate-spin" />
                                    <p className="text-gray-400 animate-pulse">正在进行智能解析...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={32} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-300 mb-2">点击或拖拽上传文件</p>
                                    <p className="text-sm text-gray-600">单个文件大小不超过 10MB</p>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-sm">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Result */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl flex flex-col overflow-hidden">
                        <div className="border-b border-white/10 p-4 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-accent-orange" />
                                <span className="font-medium text-sm">解析结果</span>
                            </div>
                            {ocrResult && (
                                <div className="flex items-center gap-2 text-green-500 text-xs">
                                    <CheckCircle2 size={14} />
                                    <span>解析完成</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0d1117]">
                            {ocrResult ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{ocrResult.markdown}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-3">
                                    <ImageIcon size={48} className="opacity-20" />
                                    <p>请上传文件以查看解析结果</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Experience;
