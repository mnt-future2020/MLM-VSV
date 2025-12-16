"use client";

import { useState, useEffect } from "react";
import {
    Play,
    Clock,
    List,
    Search,
    LayoutGrid,
    MonitorPlay,
    X
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/api";

type Video = {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    description: string;
    createdAt: string;
};

type PlaylistGroup = {
    id: string;
    name: string;
    description: string;
    videos: Video[];
};

export default function TutorialsPage() {
    const [groups, setGroups] = useState<PlaylistGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePlaylist, setActivePlaylist] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

    useEffect(() => {
        fetchTutorials();
    }, []);

    const fetchTutorials = async () => {
        try {
            const res = await axiosInstance.get("/api/tutorials");
            if (res.data.success) {
                setGroups(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching tutorials:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to extract embed ID
    const getEmbedUrl = (url: string) => {
        // Basic regex for youtube ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const id = (match && match[2].length === 11) ? match[2] : null;
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    };

    // Filter logic
    const filteredGroups = groups.map(group => ({
        ...group,
        videos: group.videos.filter(v =>
            v.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(group => group.videos.length > 0);

    const displayedGroups = activePlaylist === "all"
        ? filteredGroups
        : filteredGroups.filter(g => g.id === activePlaylist);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header / Top Bar */}
            <div className="flex items-center gap-4 p-4 border-b bg-white dark:bg-slate-950">
                <div className="flex items-center gap-2 text-primary font-bold text-xl mr-8">
                    <div className="p-2 bg-red-600 rounded-lg text-white">
                        <MonitorPlay className="w-5 h-5" />
                    </div>
                    <span>Tutorials</span>
                </div>

                <div className="flex-1 max-w-xl relative">
                    <h1 className="sr-only">Search Tutorials</h1>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tutorials..."
                        className="pl-9 bg-slate-100 dark:bg-slate-900 border-none rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Playlists) */}
                <div className="w-64 border-r bg-slate-50 dark:bg-slate-900/50 hidden md:block">
                    <div className="h-full py-4 overflow-y-auto">
                        <div className="px-3 space-y-1">
                            <Button
                                variant={activePlaylist === "all" ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", activePlaylist === "all" && "bg-slate-200 dark:bg-slate-800")}
                                onClick={() => setActivePlaylist("all")}
                            >
                                <LayoutGrid className="w-4 h-4 mr-2" />
                                All Videos
                            </Button>

                            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Playlists
                            </div>

                            {groups.map(group => (
                                <Button
                                    key={group.id}
                                    variant={activePlaylist === group.id ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start", activePlaylist === group.id && "bg-slate-200 dark:bg-slate-800")}
                                    onClick={() => setActivePlaylist(group.id)}
                                >
                                    <List className="w-4 h-4 mr-2" />
                                    <span className="truncate">{group.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content (Video Grid) */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
                    {displayedGroups.map(group => (
                        <div key={group.id} className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-xl font-bold">{group.name}</h2>
                                <span className="text-sm text-muted-foreground bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    {group.videos.length}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {group.videos.map(video => (
                                    <div
                                        key={video.id}
                                        className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all shadow-sm hover:shadow-md"
                                        onClick={() => setPlayingVideo(video)}
                                    >
                                        <div className="aspect-video relative bg-black/10">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
                                                    <Play className="w-5 h-5 ml-1" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3">
                                            <h3 className="font-semibold line-clamp-2 leading-tight mb-2" title={video.title}>
                                                {video.title}
                                            </h3>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3 mr-1" />
                                                <span>Added {new Date(video.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {displayedGroups.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Search className="w-8 h-8 mb-2 opacity-20" />
                            <p>No tutorials found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Player Modal */}
            <Dialog open={!!playingVideo} onOpenChange={(open) => !open && setPlayingVideo(null)}>
                <DialogContent className="max-w-4xl p-0 bg-black overflow-hidden border-none aspect-video">
                    <DialogTitle className="sr-only">
                        {playingVideo?.title || "Video Player"}
                    </DialogTitle>
                    <div className="relative w-full h-full">
                        <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-4 right-4 z-50 text-white/50 hover:text-white bg-black/50 rounded-full p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        {playingVideo && (
                            <iframe
                                src={getEmbedUrl(playingVideo.url) || ""}
                                title={playingVideo.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
