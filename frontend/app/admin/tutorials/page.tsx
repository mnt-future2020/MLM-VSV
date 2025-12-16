"use client";

import { useState, useEffect } from "react";
import {
    Video,
    List as ListIcon,
    Plus,
    Trash2,
    ExternalLink,
    PlaySquare,
    RefreshCw,
    Search,
    FolderOpen
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

interface Playlist {
    id: string;
    name: string;
    description: string;
    videoCount?: number;
    createdAt: string;
}

interface VideoData {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    playlistId?: string;
    playlistName?: string;
    createdAt: string;
}

export default function TutorialManagementPage() {
    // State
    const [activeTab, setActiveTab] = useState("videos");
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialogs
    const [showAddVideo, setShowAddVideo] = useState(false);
    const [showAddPlaylist, setShowAddPlaylist] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'video' | 'playlist', id: string } | null>(null);

    // Forms
    const [videoForm, setVideoForm] = useState({
        url: "",
        title: "",
        thumbnail: "",
        playlistId: "none",
        loadingMetadata: false
    });

    const [playlistForm, setPlaylistForm] = useState({
        name: "",
        description: ""
    });

    // Load Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchPlaylists(), fetchVideos()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlaylists = async () => {
        try {
            const res = await axiosInstance.get("/api/admin/tutorials/playlists");
            if (res.data.success) {
                setPlaylists(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching playlists:", error);
        }
    };

    const fetchVideos = async () => {
        try {
            const res = await axiosInstance.get("/api/admin/tutorials/videos");
            if (res.data.success) {
                setVideos(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    };

    // Handlers
    const handleUrlPaste = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setVideoForm(prev => ({ ...prev, url }));
    };

    const handleFetchPreview = async () => {
        if (!videoForm.url) {
            toast.error("Please enter a YouTube URL first");
            return;
        }

        setVideoForm(prev => ({ ...prev, loadingMetadata: true }));
        try {
            const res = await axiosInstance.post("/api/admin/tutorials/preview", { url: videoForm.url });
            if (res.data.success) {
                setVideoForm(prev => ({
                    ...prev,
                    title: res.data.data.title || prev.title,
                    thumbnail: res.data.data.thumbnail || prev.thumbnail,
                    loadingMetadata: false
                }));
                toast.success("Preview fetched successfully!");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Could not fetch video preview");
            setVideoForm(prev => ({ ...prev, loadingMetadata: false }));
        }
    };

    const handleCreatePlaylist = async () => {
        if (!playlistForm.name) {
            toast.error("Playlist name is required");
            return;
        }

        try {
            const res = await axiosInstance.post("/api/admin/tutorials/playlists", playlistForm);
            if (res.data.success) {
                toast.success("Playlist created");
                setShowAddPlaylist(false);
                setPlaylistForm({ name: "", description: "" });
                fetchPlaylists();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to create playlist");
        }
    };

    const handleAddVideo = async () => {
        if (!videoForm.url) {
            toast.error("Video URL is required");
            return;
        }

        setVideoForm(prev => ({ ...prev, loadingMetadata: true }));
        try {
            const payload: any = {
                url: videoForm.url,
                title: videoForm.title,
                thumbnail: videoForm.thumbnail
            };

            if (videoForm.playlistId !== "none") {
                payload.playlistId = videoForm.playlistId;
            }

            const res = await axiosInstance.post("/api/admin/tutorials/videos", payload);
            if (res.data.success) {
                toast.success("Video added successfully");
                setShowAddVideo(false);
                setVideoForm({
                    url: "",
                    title: "",
                    thumbnail: "",
                    playlistId: "none",
                    loadingMetadata: false
                });
                fetchVideos();
                fetchPlaylists(); // Update counts
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to add video");
        } finally {
            setVideoForm(prev => ({ ...prev, loadingMetadata: false }));
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            const endpoint = deleteConfirm.type === 'playlist'
                ? `/api/admin/tutorials/playlists/${deleteConfirm.id}`
                : `/api/admin/tutorials/videos/${deleteConfirm.id}`;

            const res = await axiosInstance.delete(endpoint);
            if (res.data.success) {
                toast.success(`${deleteConfirm.type === 'playlist' ? 'Playlist' : 'Video'} deleted`);
                setDeleteConfirm(null);
                if (deleteConfirm.type === 'playlist') fetchPlaylists();
                else fetchVideos();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Delete failed");
        }
    };

    return (
        <PageContainer maxWidth="full">
            <PageHeader
                icon={<PlaySquare className="w-6 h-6 text-white" />}
                title="Tutorial Management"
                subtitle="Manage training videos and playlists"
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            onClick={() => setShowAddVideo(true)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Add Video
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowAddPlaylist(true)}
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                            <ListIcon className="w-4 h-4 mr-2" />
                            New Playlist
                        </Button>
                    </div>
                }
            />

            <Tabs defaultValue="videos" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="bg-card border border-border p-1">
                    <TabsTrigger value="videos" className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">
                        <Video className="w-4 h-4 mr-2" />
                        All Videos ({videos.length})
                    </TabsTrigger>
                    <TabsTrigger value="playlists" className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Playlists ({playlists.length})
                    </TabsTrigger>
                </TabsList>

                {/* VIDEOS TAB */}
                <TabsContent value="videos">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {videos.map((video) => (
                            <Card key={video.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="aspect-video relative bg-black/5">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Video className="w-12 h-12 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white rounded-full hover:scale-110 transition-transform"
                                        >
                                            <PlaySquare className="w-5 h-5 text-red-600" />
                                        </a>
                                    </div>
                                    {video.playlistName && (
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white backdrop-blur-sm">
                                            {video.playlistName}
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-medium line-clamp-2 min-h-[2.5rem]" title={video.title}>
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => setDeleteConfirm({ type: 'video', id: video.id })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {videos.length === 0 && !loading && (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                                <Video className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No videos added yet</p>
                                <Button variant="link" onClick={() => setShowAddVideo(true)}>Add your first video</Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* PLAYLISTS TAB */}
                <TabsContent value="playlists">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {playlists.map((playlist) => (
                            <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <ListIcon className="w-6 h-6" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteConfirm({ type: 'playlist', id: playlist.id })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="mt-4">{playlist.name}</CardTitle>
                                    <CardDescription>{playlist.description || "No description"}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                        <Video className="w-4 h-4" />
                                        {playlist.videoCount || 0} videos
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <button
                            onClick={() => setShowAddPlaylist(true)}
                            className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all text-muted-foreground hover:text-primary"
                        >
                            <Plus className="w-8 h-8 mb-2" />
                            <span className="font-medium">Create New Playlist</span>
                        </button>
                    </div>
                </TabsContent>
            </Tabs>

            {/* --- DIALOGS --- */}

            {/* Add Video Dialog */}
            <Dialog open={showAddVideo} onOpenChange={setShowAddVideo}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Tutorial Video</DialogTitle>
                        <DialogDescription>Enter a YouTube URL. Metadata will be fetched automatically.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>YouTube URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={videoForm.url}
                                    onChange={handleUrlPaste}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleFetchPreview}
                                    disabled={videoForm.loadingMetadata || !videoForm.url}
                                    className="shrink-0"
                                >
                                    {videoForm.loadingMetadata ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>Fetch Preview</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Assign to Playlist (Optional)</Label>
                            <Select
                                value={videoForm.playlistId}
                                onValueChange={(val) => setVideoForm(prev => ({ ...prev, playlistId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Playlist" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Individual Video)</SelectItem>
                                    {playlists.map(pl => (
                                        <SelectItem key={pl.id} value={pl.id}>{pl.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title (Auto)</Label>
                                <Input
                                    value={videoForm.title}
                                    onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Video Title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Thumbnail URL (Auto)</Label>
                                <Input
                                    value={videoForm.thumbnail}
                                    onChange={(e) => setVideoForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                                    placeholder="https://..."
                                    className="text-xs"
                                />
                            </div>
                        </div>

                        {videoForm.thumbnail && (
                            <div className="rounded-lg overflow-hidden border bg-black/5 aspect-video flex items-center justify-center">
                                <img src={videoForm.thumbnail} alt="Preview" className="h-full object-cover" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddVideo(false)}>Cancel</Button>
                        <Button onClick={handleAddVideo} disabled={videoForm.loadingMetadata}>
                            {videoForm.loadingMetadata ? "Fetching..." : "Add Video"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Playlist Dialog */}
            <Dialog open={showAddPlaylist} onOpenChange={setShowAddPlaylist}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Playlist</DialogTitle>
                        <DialogDescription>Group related videos together.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Playlist Name</Label>
                            <Input
                                value={playlistForm.name}
                                onChange={(e) => setPlaylistForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Getting Started"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={playlistForm.description}
                                onChange={(e) => setPlaylistForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddPlaylist(false)}>Cancel</Button>
                        <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </PageContainer>
    );
}
