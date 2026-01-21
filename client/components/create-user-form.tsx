'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface CreateUserFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
    const { user: currentUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
    });

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.createUser(formData);
            toast.success('User created successfully');
            onSuccess();
        } catch (error: unknown) {
            toast.error('Failed to create user', {
                description: (error as Error).message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Determine available roles based on current user's role
    const canAssignAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">
                    Name
                </Label>
                <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-muted/50 border-input text-foreground"
                    placeholder="User's full name"
                    required
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">
                    Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="bg-muted/50 border-input text-foreground"
                    placeholder="user@example.com"
                    required
                />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground">
                    Password
                </Label>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="bg-muted/50 border-input text-foreground"
                    placeholder="Set a password"
                    required
                />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
                <Label htmlFor="role" className="text-muted-foreground">
                    Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                    <SelectTrigger className="bg-muted/50 border-input text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        <SelectItem value="user">User</SelectItem>
                        {canAssignAdmin && (
                            <>
                                <SelectItem value="hr">HR</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create User'
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
