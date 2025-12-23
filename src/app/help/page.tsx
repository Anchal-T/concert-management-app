"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    HelpCircle,
    ChevronRight,
    BookOpen,
    MessageCircle,
    Mail,
    ExternalLink,
    Ticket,
    Calendar,
    Users,
    MapPin,
    Tags,
    Settings
} from 'lucide-react';
import Link from 'next/link';

const helpCategories = [
    {
        title: 'Getting Started',
        icon: <BookOpen className="w-5 h-5" />,
        items: [
            { question: 'How do I create my first event?', answer: 'Navigate to Events, click "Schedule Event", fill in the artist, venue, date, and ticket details.' },
            { question: 'How do I add artists and venues?', answer: 'Go to the Artists or Venues page from the sidebar and use the "Add" button to create new entries.' },
            { question: 'What statuses can events have?', answer: 'Events can be Upcoming, Ongoing, Completed, or Cancelled. Status updates automatically based on dates.' },
        ]
    },
    {
        title: 'Managing Events',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { question: 'How do I track ticket sales?', answer: 'Click on any event to view its detail page. The sidebar shows real-time ticket sales and revenue.' },
            { question: 'Can I assign tags to events?', answer: 'Yes! Tags help organize events. Use the Tags page to create tags, then assign them to events from the event detail page.' },
            { question: 'How do I cancel an event?', answer: 'Open the event detail page and click the edit button. Change the status to "Cancelled".' },
        ]
    },
    {
        title: 'Artists & Venues',
        icon: <Users className="w-5 h-5" />,
        items: [
            { question: 'Can I edit artist information?', answer: 'Yes, hover over an artist card and click the menu button to edit or delete.' },
            { question: 'How is venue capacity used?', answer: 'Venue capacity determines the maximum tickets available for events at that location.' },
        ]
    },
];

const quickLinks = [
    { name: 'Dashboard', href: '/', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Events', href: '/concerts', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Artists', href: '/artists', icon: <Users className="w-4 h-4" /> },
    { name: 'Venues', href: '/venues', icon: <MapPin className="w-4 h-4" /> },
    { name: 'Tags', href: '/tags', icon: <Tags className="w-4 h-4" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
];

export default function HelpPage() {
    return (
        <div className="space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <span className="text-muted-foreground">Event Management</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                        <span className="text-foreground font-bold">Help Center</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Help & Documentation</h1>
                    <p className="text-muted-foreground mt-1">Find answers and learn how to use Orchids Concert Hub</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {helpCategories.map((category, idx) => (
                        <Card key={idx} className="bg-card/50 border-border overflow-hidden">
                            <div className="p-5 border-b border-border bg-accent/20 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    {category.icon}
                                </div>
                                <h2 className="font-bold text-lg">{category.title}</h2>
                            </div>
                            <CardContent className="p-0 divide-y divide-border">
                                {category.items.map((item, itemIdx) => (
                                    <details key={itemIdx} className="group">
                                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-accent/10 transition-colors">
                                            <span className="font-medium text-sm">{item.question}</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                                            {item.answer}
                                        </div>
                                    </details>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Links */}
                    <Card className="bg-card/50 border-border">
                        <CardContent className="p-5">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-primary" />
                                Quick Links
                            </h3>
                            <div className="space-y-2">
                                {quickLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 transition-colors text-sm font-medium"
                                    >
                                        <span className="text-muted-foreground">{link.icon}</span>
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Support */}
                    <Card className="bg-card/50 border-border">
                        <CardContent className="p-5">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-primary" />
                                Need More Help?
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Can't find what you're looking for? Reach out to our support team.
                            </p>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start rounded-xl" asChild>
                                    <a href="mailto:support@orchids.com">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email Support
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-start rounded-xl" disabled>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Live Chat (Coming Soon)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Keyboard Shortcuts */}
                    <Card className="bg-card/50 border-border">
                        <CardContent className="p-5">
                            <h3 className="font-bold mb-4">Keyboard Shortcuts</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Global Search</span>
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 bg-accent rounded text-xs font-mono">⌘</kbd>
                                        <kbd className="px-2 py-1 bg-accent rounded text-xs font-mono">K</kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">New Event</span>
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 bg-accent rounded text-xs font-mono">⌘</kbd>
                                        <kbd className="px-2 py-1 bg-accent rounded text-xs font-mono">N</kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Go to Dashboard</span>
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 bg-accent rounded text-xs font-mono">G</kbd>
                                        <kbd className="px-2 py-1 bg-accent rounded text-xs font-mono">D</kbd>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
