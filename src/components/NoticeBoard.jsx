import { useState, useEffect } from 'react';
import api from '../services/api';

const NoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                // Matches your SchoolController @GetMapping("/announcements")
                const res = await api.get('/api/school/announcements');
                setNotices(res.data);
            } catch (err) {
                console.error("Broadcast sync failed. Check if backend is running.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotices();
    }, []);

    if (isLoading) {
        return <div className="animate-pulse text-[#222] font-black text-[10px] tracking-widest mb-10">SYNCING BROADCASTS...</div>;
    }

    return (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-6 mb-10 shadow-2xl relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[80px] rounded-full"></div>
            
            <h2 className="text-[10px] font-black tracking-[0.4em] text-indigo-500 uppercase mb-6 flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                Digital Bulletin Board
            </h2>

            <div className="space-y-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {notices.length === 0 ? (
                    <div className="py-4">
                        <p className="text-[#333] font-bold italic text-sm uppercase tracking-tighter">No active transmissions from administration.</p>
                    </div>
                ) : (
                    notices.map(notice => (
                        <div key={notice.announcementId} className="group border-l border-[#222] hover:border-indigo-600 pl-6 py-1 transition-all duration-500">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-white text-sm uppercase group-hover:text-indigo-400 transition-colors">
                                    {notice.title}
                                </h3>
                                <span className="text-[8px] font-bold text-[#222] bg-[#111] px-2 py-1 rounded">
                                    {new Date(notice.postedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed group-hover:text-gray-400 transition-colors">
                                {notice.content}
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-4 h-[1px] bg-indigo-900"></div>
                                <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">
                                    OFFICIAL NOTICE BY: {notice.postedBy?.name || 'ADMINISTRATION'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NoticeBoard;