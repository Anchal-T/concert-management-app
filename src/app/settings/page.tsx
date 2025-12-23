"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Settings as SettingsIcon,
    Save,
    Loader2,
    ChevronRight,
    Globe,
    DollarSign,
    Bell,
    Ticket,
    Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface Setting {
    id: number;
    key: string;
    value: string | null;
    description: string | null;
}

const settingIcons: Record<string, React.ReactNode> = {
    'app_name': <Building2 className="w-5 h-5" />,
    'timezone': <Globe className="w-5 h-5" />,
    'currency': <DollarSign className="w-5 h-5" />,
    'ticket_warning_threshold': <Ticket className="w-5 h-5" />,
    'notifications_enabled': <Bell className="w-5 h-5" />,
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);

                // Initialize form data
                const initialData: Record<string, string> = {};
                data.forEach((s: Setting) => {
                    initialData[s.key] = s.value || '';
                });
                setFormData(initialData);
            }
        } catch (error) {
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save each changed setting
            for (const [key, value] of Object.entries(formData)) {
                await fetch(`/api/settings/${key}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value }),
                });
            }

            toast.success('Settings saved successfully!');
            fetchSettings();
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateValue = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[900px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <span className="text-muted-foreground">Event Management</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                        <span className="text-foreground font-bold">Settings</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Application Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure your concert management system</p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl h-10 bg-primary shadow-lg shadow-primary/20"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
            </div>

            {/* Settings Cards */}
            <div className="space-y-4">
                {settings.length === 0 ? (
                    <Card className="bg-card/50 border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
                                <SettingsIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold">No settings configured</h3>
                            <p className="text-muted-foreground mt-2 text-center max-w-sm">
                                Settings will appear here once initialized. Try refreshing the page.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-card/50 border-border">
                        <CardContent className="p-6 space-y-6">
                            {settings.map((setting) => (
                                <div key={setting.id} className="flex items-start gap-4 pb-6 border-b border-border last:border-0 last:pb-0">
                                    <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center text-primary shrink-0">
                                        {settingIcons[setting.key] || <SettingsIcon className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-bold capitalize">
                                                    {setting.key.replace(/_/g, ' ')}
                                                </Label>
                                                {setting.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        {setting.key === 'notifications_enabled' ? (
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={formData[setting.key] === 'true'}
                                                    onCheckedChange={(checked) => updateValue(setting.key, checked ? 'true' : 'false')}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {formData[setting.key] === 'true' ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                        ) : (
                                            <Input
                                                value={formData[setting.key] || ''}
                                                onChange={(e) => updateValue(setting.key, e.target.value)}
                                                className="max-w-md"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Add New Setting */}
            <Card className="bg-card/30 border-dashed border-2">
                <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Add Custom Setting</h3>
                    <form className="flex gap-4" onSubmit={async (e) => {
                        e.preventDefault();
                        const formEl = e.target as HTMLFormElement;
                        const keyInput = formEl.elements.namedItem('newKey') as HTMLInputElement;
                        const valueInput = formEl.elements.namedItem('newValue') as HTMLInputElement;

                        if (keyInput.value && valueInput.value) {
                            try {
                                await fetch('/api/settings', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        key: keyInput.value,
                                        value: valueInput.value
                                    }),
                                });
                                toast.success('Setting added!');
                                fetchSettings();
                                keyInput.value = '';
                                valueInput.value = '';
                            } catch {
                                toast.error('Failed to add setting');
                            }
                        }
                    }}>
                        <Input name="newKey" placeholder="Setting key (e.g., max_tickets)" className="flex-1" />
                        <Input name="newValue" placeholder="Value" className="flex-1" />
                        <Button type="submit" variant="outline" className="rounded-xl">Add</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
