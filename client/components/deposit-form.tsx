'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DepositFormProps {
    users: Array<{ id: string; name: string }>;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DepositForm({ users, onSuccess, onCancel }: DepositFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        amount: '',
    });

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.userId || !formData.amount) {
            toast.error('Please fill in all fields');
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            toast.error('Amount must be greater than 0');
            return;
        }

        setIsLoading(true);

        try {
            await api.createDeposit({
                userId: formData.userId,
                amount: parseFloat(formData.amount),
            });

            toast.success('Deposit added successfully', {
                description: `LKR${formData.amount} has been added to the user's wallet`,
            });
            onSuccess();
        } catch (error: unknown) {
            toast.error('Failed to add deposit', {
                description: (error as Error).message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Selection */}
            <div className="space-y-2">
                <Label htmlFor="userId" className="text-muted-foreground">
                    Select User
                </Label>
                <Select value={formData.userId} onValueChange={(value) => handleChange('userId', value)}>
                    <SelectTrigger className="bg-muted/50 border-input text-foreground">
                        <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <Label htmlFor="amount" className="text-muted-foreground">
                    Amount (LKR)
                </Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className="bg-muted/50 border-input text-foreground"
                    placeholder="Enter amount to deposit"
                    required
                />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Deposit...
                        </>
                    ) : (
                        'Add Deposit'
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
