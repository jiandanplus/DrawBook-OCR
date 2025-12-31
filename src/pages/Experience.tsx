import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileUp, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, File as FileIcon, Download, MessageSquare, Clipboard, Check, FileText, Image as ImageIcon, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadFileToS3, deleteFileFromS3 } from '../services/storageService';
import { Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import ReactJson from 'react-json-view';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';



// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ExampleFile {
    id: string;
    name: string;
    category: string | null;
    url: string | null;
    type: string;
    ocr_result?: any; // Cached OCR result
}

interface UserFile {
    id: string;
    filename: string;
    file_path: string;
    file_url: string;
    created_at: string;
    ocr_result?: any; // Cached OCR result
}

interface OCRResult {
    fullResponse: any;
    markdown: string;
    json: any;
}

const Experience = () => {
    const { user, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    console.log('Experience Render:', { authLoading, userId: user?.id });

    useEffect(() => {
        if (!authLoading && !user) {
            console.log('Redirecting to login...');
            navigate('/login');
        }
    }, [user, authLoading, navigate]);



    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [visualizedUrl, setVisualizedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'markdown' | 'json'>('markdown');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [zoom, setZoom] = useState(100);
    const [copied, setCopied] = useState(false);

    // PDF State
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfPageWidth, setPdfPageWidth] = useState(600);
    const pdfWrapperRef = useRef<HTMLDivElement>(null);

    // Sync Scroll Refs
    const markdownRef = useRef<HTMLDivElement>(null);
    const pdfPageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isScrollingFromPdf = useRef(false);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Resize Observer for PDF Wrapper
    useEffect(() => {
        if (!pdfWrapperRef.current) return;

        const updateWidth = () => {
            if (pdfWrapperRef.current) {
                const width = pdfWrapperRef.current.clientWidth - 64; // Subtract p-8 padding (32px * 2)
                setPdfPageWidth(width > 200 ? width : 800);
            }
        };

        const resizeObserver = new ResizeObserver(() => updateWidth());
        resizeObserver.observe(pdfWrapperRef.current);

        // Initial set
        updateWidth();

        return () => resizeObserver.disconnect();
    }, [previewUrl]);



    // User files state
    const [userFiles, setUserFiles] = useState<UserFile[]>([]);

    // Fetch user files
    const fetchUserFiles = async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('user_files')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setUserFiles(data);
        } catch (err) {
            console.error('Error fetching user files:', err);
        }
    };

    useEffect(() => {
        if (user) fetchUserFiles();
    }, [user]);

    // Handle user file delete
    const handleDeleteFile = async (e: React.MouseEvent, file: UserFile) => {
        e.stopPropagation();
        if (!confirm('确定要删除这个文件吗？')) return;

        try {
            // 1. Delete from S3
            await deleteFileFromS3(file.file_path);

            // 2. Delete from DB
            const { error } = await supabase
                .from('user_files')
                .delete()
                .eq('id', file.id);

            if (error) throw error;

            // 3. Update UI
            setUserFiles(prev => prev.filter(f => f.id !== file.id));
            if (selectedFile === file.id) setSelectedFile(null); // Clear selection if deleted

        } catch (err) {
            console.error('Error deleting file:', err);
            alert('删除文件失败');
        }
    };

    // Handle user file selection
    // Handle user file selection
    const handleUserFileSelect = async (file: UserFile) => {
        if (!file.file_url) return;

        setSelectedFile(file.id);
        setLoading(true);
        setError(null);
        setOcrResult(null);
        setPreviewUrl(null);
        setVisualizedUrl(null);

        try {
            // Fetch the file from the URL (needed for preview & base64 calc if cache miss)
            const response = await fetch(file.file_url);
            if (!response.ok) throw new Error('无法加载文件');
            const blob = await response.blob();
            const fileObj = new File([blob], file.filename, { type: blob.type });

            // Call handleFileUpload with cache context
            // If file.ocr_result is present, handleFileUpload will use it.
            // If not, it will fetch from API and then we update user_files table.
            // User file already exists - only charge if it's a NEW parse (no cache)
            const shouldCharge = !file.ocr_result; // Charge only if no cached result
            const ocrData = await handleFileUpload(fileObj, { table: 'user_files', id: file.id }, file.ocr_result, shouldCharge);

            // If we got new data and it wasn't from cache (file.ocr_result was null), save it
            if (ocrData?.data && !file.ocr_result) {
                console.log('Saving new OCR result to database for existing file:', file.id);
                // Create a clean copy without the large base64 image
                const dbData = JSON.parse(JSON.stringify(ocrData.data));
                if (dbData.result && dbData.result.image) {
                    delete dbData.result.image;
                }

                const { error } = await supabase
                    .from('user_files')
                    .update({ ocr_result: dbData })
                    .eq('id', file.id);

                if (error) {
                    console.error('Failed to update file with OCR result:', error);
                } else {
                    // Update local state so next click uses cache
                    setUserFiles(prev => prev.map(f => f.id === file.id ? { ...f, ocr_result: ocrData.data } : f));
                }
            }

        } catch (err) {
            console.log(err);
            setError('加载文件失败');
            setLoading(false);
        }
    };

    // Example files state
    const [exampleFiles, setExampleFiles] = useState<ExampleFile[]>([]);
    const [loadingExamples, setLoadingExamples] = useState(true);

    // Fetch example files
    useEffect(() => {
        const fetchExamples = async () => {
            try {
                const { data, error } = await supabase
                    .from('example_files')
                    .select('*')
                    .order('created_at');

                if (error) throw error;
                if (data) setExampleFiles(data);
            } catch (err) {
                console.error('Error fetching examples:', err);
            } finally {
                setLoadingExamples(false);
            }
        };

        fetchExamples();
    }, []);

    // Handle example selection
    const handleExampleSelect = async (fileId: string) => {
        const file = exampleFiles.find(f => f.id === fileId);
        if (!file || !file.url) return;

        setSelectedFile(fileId);
        setLoading(true);
        setError(null);
        setOcrResult(null);
        setPreviewUrl(null);
        setVisualizedUrl(null);

        try {
            const response = await fetch(file.url);
            if (!response.ok) throw new Error('无法加载示例文件');

            const blob = await response.blob();
            const filename = file.name + (file.type.startsWith('.') ? file.type : `.${file.type}`);
            const minetype = file.type === '.pdf' ? 'application/pdf' : 'image/jpeg';
            const fileObj = new File([blob], filename, { type: minetype });

            // Pass example_files context and existing cache if available
            // Example files are FREE - pass false for shouldChargeUsage
            const ocrData = await handleFileUpload(fileObj, { table: 'example_files', id: fileId }, file.ocr_result, false);

            // If we got new data and it wasn't from cache (file.ocr_result was null), save it
            if (ocrData?.data && !file.ocr_result) {
                console.log('Saving new OCR result to database for example file:', fileId);
                // Create a clean copy without the large base64 image
                const dbData = JSON.parse(JSON.stringify(ocrData.data));
                if (dbData.result && dbData.result.image) {
                    delete dbData.result.image;
                }

                const { error } = await supabase
                    .from('example_files')
                    .update({ ocr_result: dbData })
                    .eq('id', fileId);

                if (error) {
                    console.error('Failed to update example file with OCR result:', error);
                } else {
                    // Update local state so next click uses cache
                    setExampleFiles(prev => prev.map(f => f.id === fileId ? { ...f, ocr_result: ocrData.data } : f));
                }
            }

        } catch (err: any) {
            console.error('Error loading example:', err);
            setError('加载示例文件失败');
            setLoading(false);
        }
    };

    // Handle file upload
    // shouldChargeUsage: only true for user-uploaded NEW files (not examples, not cached)
    const handleFileUpload = async (
        file: File,
        dbParams?: { table: 'user_files' | 'example_files', id: string },
        existingOcrResult?: any,
        shouldChargeUsage: boolean = false
    ): Promise<{ data: any; pagesProcessed: number } | null> => {
        setUploadedFile(file);
        // If manual upload, clear selection
        if (selectedFile && !exampleFiles.find(f => f.name === file.name) && !dbParams) {
            // Only clear if it's a manual fresh upload (no dbParams usually implies manual)
            if (!userFiles.find(f => f.id === selectedFile)) {
                setSelectedFile(null);
            }
        }

        setLoading(true);
        setError(null);
        setOcrResult(null);
        setVisualizedUrl(null);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        try {
            // 1. Check if we already have the result (Optimization)
            if (existingOcrResult) {
                console.log('Using cached OCR result');
                processOcrResult(existingOcrResult);
                return { data: existingOcrResult, pagesProcessed: existingOcrResult.result?.layoutParsingResults?.length || 1 };
            }

            // 2. Need to call API
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            const pureBase64 = base64Data.split(',')[1];
            // Determine file type (0 for PDF, 1 for Image)
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
            const fileTypeVal = isPdf ? 0 : 1;

            // Call OCR API
            const API_URL = '/baidu-api/layout-parsing';
            const TOKEN = import.meta.env.VITE_OCR_TOKEN;

            if (!TOKEN) {
                throw new Error('API Token 未配置');
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
                    //图片方向矫正 boolean | null	是否在推理时使用文本图像方向矫正模块，开启后，可以自动识别并矫正 0°、90°、180°、270°的图片。
                    useDocOrientationClassify: false,
                    format_block_content: true,
                    //图片扭曲矫正 boolean | null	是否在推理时使用文本图像矫正模块，开启后，可以自动矫正扭曲图片，例如褶皱、倾斜等情况。
                    useDocUnwarping: false,
                    //版面分析：是否在推理时使用版面区域检测排序模块，开启后，可以自动检测文档中不同区域并排序。
                    useLayoutDetection: true,
                    //图表识别	boolean | null	是否在推理时使用图表解析模块，开启后，可以自动解析文档中的图表（如柱状图、饼图等）并转换为表格形式，方便查看和编辑数据。
                    useChartRecognition: false,
                    //版面区域过滤强度 | object | null	版面模型得分阈值。0-1 之间的任意浮点数。如果不设置，将使用产线初始化的该参数值，默认初始化为 0.5。
                    layoutThreshold: null,
                    //NMS后处理	boolean | null	版面检测是否使用后处理NMS，开启后，会自动移除重复或高度重叠的区域框。
                    layoutNms: true,
                    //扩张系数	number | array | object | null	版面区域检测模型检测框的扩张系数。 任意大于 0 浮点数。如果不设置，将使用产线初始化的该参数值，默认初始化为 1.0。
                    layoutUnclipRatio: null,
                    //版面区域检测的重叠框过滤方式	string | object | null	
                    //large，设置为large时，表示在模型输出的检测框中，对于互相重叠包含的检测框，只保留外部最大的框，删除重叠的内部框；
                    //small，设置为small，表示在模型输出的检测框中，对于互相重叠包含的检测框，只保留内部被包含的小框，删除重叠的外部框；
                    //union，不进行框的过滤处理，内外框都保留；
                    //如果不设置，将使用产线初始化的该参数值，默认初始化为large。
                    layoutMergeBboxesMode: "large",
                    //重复抑制强度	number | null	结果中出现重复文字、重复表格内容时，可适当调高。
                    repetitionPenalty: null,
                    //识别稳定性 | null	结果不稳定或出现明显幻觉时调低，漏识别或者重复较多时可略微调高。
                    temperature: null,
                    //结果可信范围	topP	number | null	结果发散、不够可信时可适当调低，让模型更保守。
                    topP: null,
                    //最小图像尺寸	minPixels	number | null	输入图片太小、文字看不清时可适当调高，一般无需调整。
                    minPixels: null,
                    //最大图像尺寸	maxPixels	number | null	输入图片特别大、处理变慢或显存压力较大时可适当调低。
                    maxPixels: null,
                    //公式编号展示	showFormulaNumber	boolean	输出的 Markdown 文本中是否包含公式编号。
                    showFormulaNumber: false,
                    //Markdown 美化	prettifyMarkdown	boolean	是否输出美化后的 Markdown 文本。
                    prettifyMarkdown: false,
                    //可视化	visualize	boolean | null	支持返回可视化结果图及处理过程中的中间图像。开启此功能后，将增加结果返回时间。
                    //传入 true：返回图像。
                    //传入 false：不返回图像。
                    //若请求体中未提供该参数或传入 null：遵循产线配置文件Serving.visualize 的设置。
                    //例如，在产线配置文件中添加如下字段：
                    //Serving:
                    //  visualize: False
                    //将默认不返回图像，通过请求体中的visualize参数可以覆盖默认行为。如果请求体和配置文件中均未设置（或请求体传入null、配置文件中未设置），则默认返回图像。
                    visualize: true
                })
            });

            if (!response.ok) {
                // const errText = await response.text();
                throw new Error(`API 错误: ${response.status}`);
            }

            const data = await response.json();

            if (data.errorCode && data.errorCode !== 0) {
                throw new Error(data.errorMsg || '解析失败');
            }

            let combinedMarkdown = "";

            // Process per-page markdown and images
            if (data.result?.layoutParsingResults) {
                combinedMarkdown = data.result.layoutParsingResults.map((page: any, index: number) => {
                    // Use prunedResult to reconstruct Markdown
                    const blocks = page.prunedResult?.parsing_res_list || [];
                    const pageImages = page.markdown?.images || {};
                    let pageText = "";

                    blocks.forEach((block: any) => {
                        const type = block.block_label;
                        const content = block.block_content || "";

                        if (type === 'title') {
                            pageText += `## ${content}\n\n`;
                        } else if (type === 'header') {
                            pageText += `*${content}*\n\n`;
                        } else if (type === 'image') {
                            // Find image URL match in pageImages keys
                            // content usually contains the image path or token
                            let imgUrl = "";
                            const filename = content.split('/').pop();

                            // Try to find url that ends with this filename
                            if (filename) {
                                Object.entries(pageImages).forEach(([k, v]) => {
                                    if (k.endsWith(filename)) {
                                        imgUrl = v as string;
                                    }
                                });
                            }
                            // Fallback: check if content itself is a key
                            if (!imgUrl && pageImages[content]) {
                                imgUrl = pageImages[content];
                            }

                            if (imgUrl) {
                                pageText += `![image](${imgUrl})\n\n`;
                            } else {
                                // Keep original reference if URL not found
                                pageText += `![image](${content})\n\n`;
                            }
                        } else if (type === 'table') {
                            // Table content is usually HTML
                            pageText += `${content}\n\n`;
                        } else {
                            // Default text
                            pageText += `${content}\n\n`;
                        }
                    });

                    // Still need to do general image URL replacement just in case
                    Object.entries(pageImages).forEach(([key, url]) => {
                        const urlStr = url as string;
                        const filename = key.split('/').pop();
                        if (filename) {
                            const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(`src=["'](?!http|data:)[^"']*${escapedFilename}["']`, 'g');
                            // This handles HTML table images
                            pageText = pageText.replace(regex, `src="${urlStr}"`);
                        }
                    });

                    // Inject hidden anchor for sync scrolling
                    return `<div id="markdown-page-${index + 1}" data-page="${index + 1}" class="markdown-page-marker" style="height: 1px; width: 100%; visibility: hidden;"></div>\n\n${pageText}`;
                }).join('\n\n---\n\n');
            } else {
                // Fallback for non-paginated structure
                combinedMarkdown = data.result?.markdown || "解析成功";
            }

            let processedMarkdown = combinedMarkdown;
            // Also check global images (fallback support)
            if (data.result?.images) {
                Object.entries(data.result.images).forEach(([key, url]) => {
                    const urlStr = url as string;
                    processedMarkdown = processedMarkdown.split(key).join(urlStr);
                    const filename = key.split('/').pop();
                    if (filename) {
                        const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`src=["'](?!http|data:)[^"']*${escapedFilename}["']`, 'g');
                        processedMarkdown = processedMarkdown.replace(regex, `src="${urlStr}"`);
                    }
                });
            }

            // Perform LaTeX normalization for remark-math (wrap environments in $$)
            const normalizeMath = (text: string) => {
                // Regex to find \begin{...} ... \end{...} blocks that are NOT already inside $$ or $
                // This is a simplified regex; detecting "not inside $$" perfectly is hard with regex alone,
                // but usually PaddleOCR returns raw blocks.
                // We'll target specific common environments to be safe.
                const environments = ['align', 'equation', 'gather', 'alignat', 'flalign', 'split', 'multline'];
                const envRegex = new RegExp(`(\\\\begin\\{(${environments.join('|')})\\*?\\}[\\s\\S]*?\\\\end\\{(${environments.join('|')})\\*?\\})`, 'g');

                return text.replace(envRegex, (match) => {
                    // Check if already wrapped (simple check)
                    // If the match seems to be surrounded by $$, skip. 
                    // However, since we replace globally, we rely on the fact that raw output is usually bare.
                    return `$$\n${match}\n$$`;
                });
            };

            processedMarkdown = normalizeMath(processedMarkdown);

            // Check for visualized image
            if (data.result?.image) {
                setVisualizedUrl(`data:image/jpeg;base64,${data.result.image}`);
            }

            setTotalPages(data.result?.layoutParsingResults?.length || 1);
            setOcrResult({
                fullResponse: data,
                markdown: processedMarkdown,
                json: data.result
            });

            // Reset PDF page refs array and allow time for DOM to update
            setTimeout(() => {
                pdfPageRefs.current = pdfPageRefs.current.slice(0, data.result?.layoutParsingResults?.length || 1);
            }, 100);

            // 4. Render Result
            processOcrResult(data);

            // 5. Log usage and deduct balance (only if shouldChargeUsage is true)
            const pagesProcessed = data.result?.layoutParsingResults?.length || 1;
            if (shouldChargeUsage && user) {
                try {
                    // Use combined RPC that logs usage AND decrements balance atomically
                    const { data: newBalance, error: rpcError } = await supabase.rpc('log_usage_and_decrement', {
                        p_user_id: user.id,
                        p_pages: pagesProcessed,
                        p_file_name: file.name
                    });

                    if (rpcError) {
                        console.error('Usage RPC error:', rpcError);
                    } else {
                        console.log(`Usage charged: ${pagesProcessed} pages for ${file.name}. New balance: ${newBalance}`);
                    }
                } catch (usageError) {
                    console.error('Failed to log usage:', usageError);
                }
            } else {
                console.log(`No charge (cached or example): ${pagesProcessed} pages for ${file.name}`);
            }

            return { data, pagesProcessed };

        } catch (err: any) {
            console.error('OCR Error:', err);
            setError(err.message || '文件解析失败');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Helper: Process and render OCR result
    const processOcrResult = (data: any) => {
        let combinedMarkdown = "";

        // Process per-page markdown and images
        if (data.result?.layoutParsingResults) {
            combinedMarkdown = data.result.layoutParsingResults.map((page: any, index: number) => {
                const blocks = page.prunedResult?.parsing_res_list || [];
                const pageImages = page.markdown?.images || {};
                let pageText = "";

                blocks.forEach((block: any) => {
                    const type = block.block_label;
                    const content = block.block_content || "";

                    if (type === 'title') {
                        pageText += `## ${content}\n\n`;
                    } else if (type === 'header') {
                        pageText += `*${content}*\n\n`;
                    } else if (['image', 'chart', 'figure', 'header_image', 'footer_image'].includes(type)) {
                        let imgUrl: string | null = null;

                        // 1. Try to get URL from content if it exists
                        if (content && content.trim() !== "") {
                            let imagePath = content;
                            const match = content.match(/!\[.*?\]\((.*?)\)/);
                            if (match && match[1]) imagePath = match[1];

                            imgUrl = pageImages[imagePath];
                            if (!imgUrl) {
                                const filename = imagePath.split('/').pop();
                                if (filename) {
                                    const exactMatch = Object.entries(pageImages).find(([k]) => k.endsWith(filename));
                                    if (exactMatch) imgUrl = exactMatch[1] as string;
                                }
                            }
                            // Fallback: check if content itself is a key
                            if (!imgUrl && pageImages[content]) imgUrl = pageImages[content];
                        }

                        // 2. If no URL found yet, try constructing key from bbox
                        // Pattern: imgs/img_in_{type}_box_{x}_{y}_{w}_{h}.jpg
                        if ((!imgUrl || imgUrl.trim() === '') && block.block_bbox && Array.isArray(block.block_bbox)) {
                            const [x, y, w, h] = block.block_bbox;
                            if (x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
                                // Important: parsing_res_list uses [x,y,x2,y2] or [x,y,w,h]? 
                                // Based on sample: [232, 646, 843, 915] which looks like [x1, y1, x2, y2]. 
                                // But the image key in JSON is: imgs/img_in_chart_box_232_646_843_915.jpg
                                // So we just join them with underscores.
                                const bboxStr = block.block_bbox.join('_');
                                const key = `imgs/img_in_${type}_box_${bboxStr}.jpg`;
                                if (pageImages[key]) {
                                    imgUrl = pageImages[key];
                                }
                            }
                        }

                        if (imgUrl && imgUrl.trim() !== "") {
                            pageText += `![${type}](${imgUrl})\n\n`;
                        } else if (content && content.trim() !== "") {
                            // If we have content but no image URL, render content as image path only if it looks like one,
                            // otherwise maybe it is just text. But for type 'image' content usually IS path or md image.
                            // For 'chart' content is often empty.
                            if (content.includes('![')) {
                                pageText += `${content}\n\n`;
                            } else {
                                pageText += `![${type}](${content})\n\n`;
                            }
                        }
                    } else if (type === 'table') {
                        pageText += `${content}\n\n`;
                    } else {
                        pageText += `${content}\n\n`;
                    }
                });

                Object.entries(pageImages).forEach(([key, url]) => {
                    const urlStr = url as string;
                    const filename = key.split('/').pop();
                    if (filename) {
                        const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`src=["'](?!http|data:)[^"']*${escapedFilename}["']`, 'g');
                        pageText = pageText.replace(regex, `src="${urlStr}"`);
                    }
                });

                return `<div id="markdown-page-${index + 1}" data-page="${index + 1}" class="markdown-page-marker" style="height: 1px; width: 100%; visibility: hidden;"></div>\n\n${pageText}`;
            }).join('\n\n---\n\n');
        } else {
            combinedMarkdown = data.result?.markdown || "解析成功";
        }

        let processedMarkdown = combinedMarkdown;
        if (data.result?.images) {
            Object.entries(data.result.images).forEach(([key, url]) => {
                const urlStr = url as string;
                processedMarkdown = processedMarkdown.split(key).join(urlStr);
                const filename = key.split('/').pop();
                if (filename) {
                    const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`src=["'](?!http|data:)[^"']*${escapedFilename}["']`, 'g');
                    processedMarkdown = processedMarkdown.replace(regex, `src="${urlStr}"`);
                }
            });
        }

        const normalizeMath = (text: string) => {
            const environments = ['align', 'equation', 'gather', 'alignat', 'flalign', 'split', 'multline'];
            const envRegex = new RegExp(`(\\\\begin\\{(${environments.join('|')})\\*?\\}[\\s\\S]*?\\\\end\\{(${environments.join('|')})\\*?\\})`, 'g');
            return text.replace(envRegex, (match) => `$$\n${match}\n$$`);
        };
        processedMarkdown = normalizeMath(processedMarkdown);

        if (data.result?.image) {
            setVisualizedUrl(`data:image/jpeg;base64,${data.result.image}`);
        }

        setTotalPages(data.result?.layoutParsingResults?.length || 1);
        setOcrResult({
            fullResponse: data,
            markdown: processedMarkdown,
            json: data.result
        });

        setTimeout(() => {
            pdfPageRefs.current = pdfPageRefs.current.slice(0, data.result?.layoutParsingResults?.length || 1);
        }, 100);

        setLoading(false);
    };

    const uploadToStorage = async (file: File) => {
        if (!user) return null;
        try {
            // Format: user/{userId}/files/{timestamp}_{filename}
            // Sanitize filename to avoid issues
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `user/${user.id}/files/${Date.now()}_${sanitizedName}`;

            const { url } = await uploadFileToS3(file, filePath);

            const { data: newFile, error } = await supabase.from('user_files').insert({
                user_id: user.id,
                filename: file.name,
                file_path: filePath,
                file_url: url,
                file_size: file.size,
                file_type: file.type
            }).select().single();

            if (error) throw error;

            if (newFile) {
                setUserFiles(prev => [newFile, ...prev]);
                return newFile;
            }
            return null;
        } catch (err) {
            console.error('Storage Upload Error:', err);
            return null;
        }
    };

    // Handle file input change
    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(null);

            // Start OCR (for preview) and S3 Upload (for storage) concurrently
            // New user upload - CHARGE for usage
            const ocrPromise = handleFileUpload(file, undefined, undefined, true);

            if (user) {
                const uploadPromise = uploadToStorage(file);

                // Wait for both to likely create the DB connection if successful
                try {
                    console.log('Waiting for OCR and Upload to complete...');
                    const [ocrResult, newFile] = await Promise.all([ocrPromise, uploadPromise]);
                    console.log('Promise.all completed:', { hasOcrResult: !!ocrResult, hasNewFile: !!newFile });

                    if (ocrResult?.data && newFile) {
                        console.log('Updating new file with OCR result', newFile.id);

                        // Create a clean copy without the large base64 image
                        const dbData = JSON.parse(JSON.stringify(ocrResult.data));
                        if (dbData.result && dbData.result.image) {
                            delete dbData.result.image;
                        }

                        const { error } = await supabase
                            .from('user_files')
                            .update({ ocr_result: dbData })
                            .eq('id', newFile.id);

                        if (error) {
                            console.error('Failed to update new file with OCR result', error);
                        } else {
                            console.log('Successfully updated user file with OCR result');
                            // Update local state to reflect the new cached result
                            setUserFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, ocr_result: dbData } : f));
                        }
                    } else {
                        console.warn('Skipping DB update - missing OCR result or new file record', { ocrResult, newFile });
                    }
                } catch (err) {
                    console.error('Error coordinating upload and OCR:', err);
                }
            } else {
                await ocrPromise;
            }
        }
    };

    // Handle drag and drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(null);
            handleFileUpload(file, undefined, undefined, true); // Drag/drop = new upload, charge
            // Upload to S3 if logged in
            if (user) {
                uploadToStorage(file);
            }
        }
    };

    // Handle paste (Ctrl+V)
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                            setSelectedFile(null);
                            handleFileUpload(file, undefined, undefined, true); // Paste = new upload, charge
                        }
                    }
                }
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    // Copy to clipboard
    // Copy to clipboard
    const handleCopy = async () => {
        if (!ocrResult) return;
        console.log('Copying content. Active Tab:', activeTab);
        // Default to markdown unless explicitly JSON
        const content = activeTab === 'json' ? JSON.stringify(ocrResult.json, null, 2) : ocrResult.markdown;
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Export file
    const handleExport = () => {
        if (!ocrResult) return;
        const content = activeTab === 'json' ? JSON.stringify(ocrResult.json, null, 2) : ocrResult.markdown;
        const ext = activeTab === 'json' ? 'json' : 'md';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `result.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Sync Scroll Logic: PDF -> Markdown
    useEffect(() => {
        const observerOptions = {
            root: pdfWrapperRef.current,
            threshold: 0.5 // Trigger when 50% of page is visible
        };

        const callback: IntersectionObserverCallback = (entries) => {
            if (isScrollingFromPdf.current) return;

            // Find the most visible page
            const visiblePage = entries.find(entry => entry.isIntersecting);
            if (visiblePage) {
                const pageNum = parseInt(visiblePage.target.getAttribute('data-page-num') || '1');
                if (!isNaN(pageNum) && pageNum !== currentPage) {
                    // Sync Markdown Scroll - use manual scrollTop to avoid scrolling ancestor containers
                    const markdownAnchor = document.getElementById(`markdown-page-${pageNum}`);
                    if (markdownAnchor && markdownRef.current) {
                        const container = markdownRef.current;
                        const anchorOffset = markdownAnchor.offsetTop - container.offsetTop;
                        container.scrollTo({ top: anchorOffset, behavior: 'smooth' });
                    }
                    // Update current page state without triggering scroll back? 
                    // Actually setCurrentPage might trigger other effects, keep it simple for now.
                    setCurrentPage(pageNum);
                }
            }
        };

        const observer = new IntersectionObserver(callback, observerOptions);

        // Observe all PDF pages
        pdfPageRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [numPages, ocrResult]);

    // Handle OCR Block Click -> Scroll to Markdown Text
    const handleBlockClick = (content: string, pageIndex: number) => {
        if (!content || !markdownRef.current) return;

        const maxSearchLength = 50;
        const cleanContent = (str: string) => str.replace(/\s+/g, '').toLowerCase(); // Permissive cleaning
        const targetText = cleanContent(content).substring(0, maxSearchLength);

        if (!targetText) return;

        // 1. Identify Search Scope (Current Page to Next Page)
        const startNodeId = `markdown-page-${pageIndex + 1}`;
        const endNodeId = `markdown-page-${pageIndex + 2}`; // Might not exist if last page

        let startNode = document.getElementById(startNodeId);

        if (!startNode) {
            if (pageIndex === 0) startNode = markdownRef.current;
            else {
                console.warn(`Anchor ${startNodeId} not found.`);
                return;
            }
        }

        const treeWalker = document.createTreeWalker(
            markdownRef.current,
            NodeFilter.SHOW_TEXT,
            null
        );

        let currentNode = treeWalker.nextNode();
        let searching = false;
        let foundNode: Node | null = null;
        let bestMatchNode: Node | null = null;
        let maxMatchRatio = 0;

        while (currentNode) {
            // Check if we passed the startNode (enable searching)
            if (!searching && startNode) {
                const position = startNode.compareDocumentPosition(currentNode);
                if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
                    searching = true;
                }
            }

            // Check if we passed the endNode (stop searching)
            if (searching && endNodeId) {
                const endNode = document.getElementById(endNodeId);
                if (endNode) {
                    const position = endNode.compareDocumentPosition(currentNode);
                    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
                        break;
                    }
                }
            }

            if (searching && currentNode.textContent) {
                const nodeText = cleanContent(currentNode.textContent);

                // 1. Exact Substring Match
                if (nodeText.includes(targetText)) {
                    foundNode = currentNode;
                    break;
                }

                // 2. Partial/Split Match handling
                if (targetText.includes(nodeText) && nodeText.length > 2) {
                    if (nodeText.length > 5) {
                        foundNode = currentNode;
                        break;
                    }
                    if (!bestMatchNode || nodeText.length > maxMatchRatio) {
                        bestMatchNode = currentNode;
                        maxMatchRatio = nodeText.length;
                    }
                }
            }

            currentNode = treeWalker.nextNode();
        }

        // Use best guess if no exact match
        if (!foundNode) foundNode = bestMatchNode;

        if (foundNode && foundNode.parentElement && markdownRef.current) {
            // Scroll into view - use manual scrollTop to avoid scrolling ancestor containers
            const container = markdownRef.current;
            const element = foundNode.parentElement;
            const elementRect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const targetScrollTop = container.scrollTop + elementRect.top - containerRect.top - container.clientHeight / 2;
            container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });

            // Temporary Highlight
            const originalBg = foundNode.parentElement.style.backgroundColor;
            foundNode.parentElement.style.backgroundColor = 'rgba(250, 204, 21, 0.6)'; // Yellow
            foundNode.parentElement.style.transition = 'background-color 0.3s';

            setTimeout(() => {
                foundNode!.parentElement!.style.backgroundColor = originalBg;
            }, 1500);
        } else {
            console.warn("Text not found in page scope:", pageIndex + 1, targetText);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <p className="text-sm text-gray-400">正在验证权限...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black text-white flex overflow-hidden" style={{ overscrollBehavior: 'none' }}>
            {/* Sidebar */}
            <aside className="w-[229px] bg-[#0A0A0A] border-r border-white/10 flex flex-col shrink-0">
                {/* Logo */}
                <div className="h-12 flex items-center px-4 border-b border-white/10 shrink-0">
                    <Link to="/" className="flex items-center hover:opacity-80 transition-opacity gap-2">
                        <img src="https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/sign/OCR/system/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZDVkYTBlZi1hMDFmLTQ5MGItODI4MC1iNzg1N2E2M2Y3NWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJPQ1Ivc3lzdGVtL2xvZ28ucG5nIiwiaWF0IjoxNzY3MDE1NjQ3LCJleHAiOjMxNTM2MDE3MzU0Nzk2NDd9.mAmIp6aAlBXUY0o9-h4p2WZss6jhm2VogjoPTx2eCUI" alt="DrawBookAI Logo" className="h-7 w-auto rounded-lg" />
                        <span className="text-lg font-bold">DrawBookAI</span>
                        <span className="text-[10px] bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent border border-orange-500/30 rounded px-1">Beta</span>
                    </Link>
                </div>

                {/* Upload Button */}
                <div className="p-3 shrink-0">
                    <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FF9031] hover:bg-orange-600 text-white rounded-lg cursor-pointer transition-colors">
                        <FileUp size={18} />
                        <span className="text-sm font-medium">上传我的文件</span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.bmp,.webp"
                            onChange={handleFileInputChange}
                        />
                    </label>
                </div>

                {/* Example Files List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* User Files Section */}
                    {user && userFiles.length > 0 && (
                        <div className="px-3 py-2 border-b border-white/5">
                            <div className="flex items-center gap-2 text-xs text-green-500 mb-2 font-medium">
                                <FileIcon size={12} />
                                <span>我的文件</span>
                            </div>
                            <div className="space-y-1">
                                {userFiles.map(file => (
                                    <div
                                        key={file.id}
                                        className={`relative group w-full flex items-center justify-between px-2 py-2 rounded-lg transition-colors ${selectedFile === file.id
                                            ? 'bg-[#FF9031]/20 text-[#FF9031]'
                                            : 'text-gray-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <button
                                            onClick={() => handleUserFileSelect(file)}
                                            disabled={loading}
                                            className="flex-1 flex items-center gap-2 overflow-hidden text-left"
                                        >
                                            <FileText size={14} className={`shrink-0 ${selectedFile === file.id ? 'text-[#FF9031]' : 'text-gray-500'}`} />
                                            <span className="truncate text-sm">{file.filename}</span>
                                        </button>

                                        <button
                                            onClick={(e) => handleDeleteFile(e, file)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all shrink-0 ml-2"
                                            title="删除文件"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <FileIcon size={12} />
                            <span>示例文件</span>
                        </div>
                        <div className="space-y-1">
                            {loadingExamples ? (
                                <div className="text-center py-4 text-gray-600 text-xs">加载示例...</div>
                            ) : (
                                exampleFiles.map(file => (
                                    <button
                                        key={file.id}
                                        onClick={() => handleExampleSelect(file.id)}
                                        disabled={loading}
                                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-sm transition-colors ${selectedFile === file.id
                                            ? 'bg-[#FF9031]/20 text-[#FF9031]'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                                            }`}
                                    >
                                        <FileText size={14} className={`shrink-0 ${selectedFile === file.id ? 'text-[#FF9031]' : 'text-gray-500'}`} />
                                        <span className="truncate">{file.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* API Access Footer */}
                {/* API Access Footer */}
                <div className="p-3 border-t border-white/10 shrink-0">
                    {user ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 px-2 py-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xs">
                                    {user.email?.[0]?.toUpperCase() || <User size={14} />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-medium text-white truncate" title={user.email}>{user.email}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-green-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        已登录
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/workbench"
                                    className="flex items-center justify-center gap-1.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors"
                                >
                                    <LayoutDashboard size={12} />
                                    控制台
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center justify-center gap-1.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-xs transition-colors"
                                >
                                    <LogOut size={12} />
                                    退出
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="block w-full text-center py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                            获取 API 接入
                        </Link>
                    )}
                </div>
            </aside>


            {/* Main Content */}
            <main className="flex-1 flex min-w-0 min-h-0">
                {/* File Viewer Panel */}
                <div className="flex-1 flex flex-col border-r border-white/10 relative min-h-0 min-w-0">
                    {/* Toolbar */}
                    <div className="h-12 flex items-center justify-center gap-6 px-4 border-b border-white/10 bg-[#0A0A0A] shrink-0">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage <= 1 || loading}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm text-gray-400 min-w-[60px] text-center">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages || loading}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setZoom(z => Math.max(50, z - 10))}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="text-xs text-gray-500 min-w-[40px] text-center">{zoom}%</span>
                            <button
                                onClick={() => setZoom(z => Math.min(200, z + 10))}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div
                        className="flex-1 flex items-center justify-center p-4 overflow-hidden relative bg-black/50"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {/* Loading Overlay */}
                        {loading && (
                            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-white/10 border-t-[#FF9031] rounded-full animate-spin" />
                                    <p className="text-white font-medium animate-pulse">文件上传中...</p>
                                </div>
                            </div>
                        )}

                        {previewUrl ? (
                            <div className="absolute inset-0 overflow-auto bg-black flex justify-center p-8 pdf-wrapper" ref={pdfWrapperRef} style={{ scrollBehavior: 'smooth' }}>
                                {visualizedUrl ? (
                                    <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s', width: pdfPageWidth }}>
                                        <img
                                            src={visualizedUrl}
                                            alt="Result with Boxes"
                                            className="w-full rounded shadow-lg"
                                        />
                                    </div>
                                ) : (
                                    uploadedFile?.type === 'application/pdf' || uploadedFile?.name.endsWith('.pdf') ? (
                                        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                                            <Document
                                                file={previewUrl}
                                                onLoadSuccess={onDocumentLoadSuccess}
                                                loading={<div className="text-gray-500">正在加载文档...</div>}
                                                error={<div className="text-red-500">加载文档失败</div>}
                                                className="flex flex-col gap-4"
                                            >
                                                {Array.from(new Array(numPages), (_, index) => {
                                                    // Get parsing result for this page
                                                    const pageResult = ocrResult?.json?.layoutParsingResults?.[index]?.prunedResult;
                                                    const blocks = pageResult?.parsing_res_list || [];
                                                    const originalWidth = pageResult?.width || 0;

                                                    // Calculate scale: Target Width (Dynamic) / Original Width
                                                    const scale = originalWidth > 0 ? pdfPageWidth / originalWidth : 1;

                                                    // Debug log for the first page to verify data
                                                    if (index === 0) {
                                                        console.log('Page 1 Debug:', {
                                                            hasBlocks: blocks.length > 0,
                                                            blocksCount: blocks.length,
                                                            originalWidth,
                                                            pdfPageWidth,
                                                            scale,
                                                            firstBlock: blocks[0]
                                                        });
                                                    }

                                                    return (
                                                        <div
                                                            key={`page_${index + 1}`}
                                                            className="shadow-lg relative bg-white"
                                                            style={{ width: pdfPageWidth }}
                                                            data-page-num={index + 1}
                                                            ref={el => { pdfPageRefs.current[index] = el; }}
                                                        >
                                                            <Page
                                                                pageNumber={index + 1}
                                                                renderTextLayer={false}
                                                                renderAnnotationLayer={false}
                                                                width={pdfPageWidth}
                                                            />

                                                            {/* OCR Overlays Layer - Absolutely positioned over the page */}
                                                            <div className="absolute inset-0 z-10 pointer-events-none">
                                                                {blocks.map((block: any, i: number) => {
                                                                    const bbox = block.block_bbox; // [xmin, ymin, xmax, ymax]
                                                                    if (!bbox || bbox.length !== 4) return null;

                                                                    const [x1, y1, x2, y2] = bbox;
                                                                    // Apply scale to coordinates
                                                                    const style = {
                                                                        left: `${x1 * scale}px`,
                                                                        top: `${y1 * scale}px`,
                                                                        width: `${(x2 - x1) * scale}px`,
                                                                        height: `${(y2 - y1) * scale}px`,
                                                                    };

                                                                    // Color mapping
                                                                    let borderColor = 'rgba(59, 130, 246, 0.8)';

                                                                    if (block.block_label === 'image') {
                                                                        borderColor = 'rgba(16, 185, 129, 0.8)';
                                                                    } else if (block.block_label === 'table') {
                                                                        borderColor = 'rgba(245, 158, 11, 0.8)';
                                                                    } else if (block.block_label === 'header' || block.block_label === 'footer') {
                                                                        borderColor = 'rgba(139, 92, 246, 0.8)';
                                                                    }

                                                                    return (
                                                                        <div
                                                                            key={i}
                                                                            className="absolute border hover:bg-opacity-30 transition-colors group cursor-pointer pointer-events-auto"
                                                                            style={{
                                                                                ...style,
                                                                                backgroundColor: 'transparent',
                                                                                borderColor: borderColor,
                                                                                borderWidth: '1px'
                                                                            }}
                                                                            title={`${block.block_label}: ${block.block_content?.substring(0, 50)}...`}
                                                                            onClick={() => handleBlockClick(block.block_content, index)}
                                                                        >
                                                                            {/* Hover Label */}
                                                                            <div
                                                                                className="absolute -top-5 left-0 text-[10px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none"
                                                                                style={{ backgroundColor: borderColor }}
                                                                            >
                                                                                {block.block_label}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </Document>
                                        </div>
                                    ) : (
                                        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s', width: pdfPageWidth }}>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full rounded shadow-lg"
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#FF9031]/50 hover:bg-[#FF9031]/5 transition-all group">
                                <div className="flex flex-col items-center gap-4 transition-transform group-hover:scale-110 duration-200">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FF9031]/20 transition-colors">
                                        <FileUp size={28} className="text-gray-500 group-hover:text-[#FF9031]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400 mb-1 group-hover:text-white transition-colors">点击上传文件 / 拖拽文件到此处 / 截图后 Ctrl+V</p>
                                        <p className="text-xs text-gray-600 group-hover:text-gray-500">支持 PDF, JPG, PNG, JPEG, BMP, WebP</p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.bmp,.webp"
                                    onChange={handleFileInputChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Result Panel */}
                <div className="flex-1 flex flex-col bg-[#0A0A0A] min-h-0 min-w-0">
                    {/* Tab Toggle */}
                    <div className="h-12 flex items-center justify-center border-b border-white/10 shrink-0">
                        <div className="flex bg-white/5 rounded-full p-1">
                            <button
                                onClick={() => setActiveTab('markdown')}
                                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${activeTab === 'markdown'
                                    ? 'bg-white text-black'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Markdown
                            </button>
                            <button
                                onClick={() => setActiveTab('json')}
                                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${activeTab === 'json'
                                    ? 'bg-white text-black'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                JSON
                            </button>
                        </div>
                    </div>

                    {/* Result Content */}
                    <div ref={markdownRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {error ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-red-400">{error}</p>
                            </div>
                        ) : loading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                                <div className="h-32 bg-white/5 rounded w-full"></div>
                                <div className="h-4 bg-white/5 rounded w-2/3"></div>
                            </div>
                        ) : ocrResult ? (
                            activeTab === 'markdown' ? (
                                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath, remarkGfm]}
                                        rehypePlugins={[rehypeRaw, rehypeKatex]}
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-[#FF9031] mt-6 mb-3" {...props} />,
                                            p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-gray-300" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
                                            table: ({ node, ...props }) => <div className="overflow-x-auto my-6 rounded-lg border border-white/10"><table className="w-full text-left border-collapse" {...props} /></div>,
                                            th: ({ node, ...props }) => <th className="bg-white/5 p-3 text-white font-medium border-b border-white/10" {...props} />,
                                            td: ({ node, ...props }) => <td className="p-3 border-b border-white/5" {...props} />
                                        }}
                                    >
                                        {ocrResult.markdown}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full overflow-auto bg-[#0A0A0A] p-4 rounded-lg">
                                    <ReactJson
                                        src={ocrResult.json}
                                        theme="monokai"
                                        name={false}
                                        displayDataTypes={false}
                                        displayObjectSize={false}
                                        enableClipboard={true}
                                        collapsed={1}
                                        style={{ backgroundColor: 'transparent' }}
                                    />
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                <ImageIcon size={48} className="opacity-20 mb-4" />
                                <p>请上传文件查看解析结果</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="h-14 flex items-center justify-end gap-3 px-4 border-t border-white/10 shrink-0">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-white/20 transition-colors">
                            <MessageSquare size={14} />
                            问题反馈
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={!ocrResult}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-white/20 transition-colors disabled:opacity-30"
                        >
                            {copied ? <Check size={14} className="text-green-500" /> : <Clipboard size={14} />}
                            {copied ? '已复制' : '复制到剪贴板'}
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={!ocrResult}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#FF9031] rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-30"
                        >
                            <Download size={14} />
                            导出
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Experience;
