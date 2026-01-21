'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProfileDialogProps {
    children: React.ReactNode;
}

export function ProfileDialog({ children }: ProfileDialogProps) {
    const { user, updateUser } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && user) {
            setName(user.name);
        }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const { user: updatedUser } = await api.updateProfile(name);
            updateUser(updatedUser);
            toast.success('Profile updated successfully');
            setOpen(false);
        } catch (error: unknown) {
            const err = error as Error;
            console.error(err);
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Make changes to your profile here. Click save when you are done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-muted-foreground">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3 bg-muted border-input text-foreground focus-visible:ring-primary"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right text-muted-foreground">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="col-span-3 bg-muted/50 border-input text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
