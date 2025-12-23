"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Tags as TagsIcon,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    ChevronRight,
    Hash
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Tag {
    id: number;
    name: string;
    color: string;
    createdAt: string;
}

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState({ name: '', color: '#8b5cf6' });

    const fetchTags = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tags');
            if (res.ok) {
                const data = await res.json();
                setTags(data);
            }
        } catch (error) {
            toast.error('Failed to fetch tags');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingTag ? `/api/tags/${editingTag.id}` : '/api/tags';
            const method = editingTag ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save tag');

            toast.success(editingTag ? 'Tag updated!' : 'Tag created!');
            setDialogOpen(false);
            setEditingTag(null);
            setFormData({ name: '', color: '#8b5cf6' });
            fetchTags();
        } catch (error) {
            toast.error('Failed to save tag');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        try {
            const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            toast.success(`Tag "${name}" deleted`);
            fetchTags();
        } catch (error) {
            toast.error('Failed to delete tag');
        }
    };

    const openEditDialog = (tag: Tag) => {
        setEditingTag(tag);
        setFormData({ name: tag.name, color: tag.color });
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingTag(null);
        setFormData({ name: '', color: '#8b5cf6' });
        setDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading Tags...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <span className="text-muted-foreground">Event Management</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                        <span className="text-foreground font-bold">Tags</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Tag Management</h1>
                    <p className="text-muted-foreground mt-1">Organize events with custom tags</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog} className="rounded-xl h-10 bg-primary shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" /> Add Tag
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tag Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., VIP, Sold Out, Premium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        id="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-12 h-10 rounded-lg cursor-pointer border border-border"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        placeholder="#8b5cf6"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary">
                                    {editingTag ? 'Update' : 'Create'} Tag
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tags Grid */}
            {tags.length === 0 ? (
                <Card className="bg-card/50 border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
                            <TagsIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">No tags yet</h3>
                        <p className="text-muted-foreground mt-2 text-center max-w-sm">
                            Create your first tag to start organizing events with labels like "VIP", "Sold Out", or "Premium".
                        </p>
                        <Button onClick={openCreateDialog} className="mt-6 rounded-xl">
                            <Plus className="w-4 h-4 mr-2" /> Create First Tag
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tags.map((tag) => (
                        <Card key={tag.id} className="group bg-card/50 border-border hover:border-primary/30 transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${tag.color}20` }}
                                        >
                                            <Hash className="w-5 h-5" style={{ color: tag.color }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">{tag.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{tag.color}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEditDialog(tag)}
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(tag.id, tag.name)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
