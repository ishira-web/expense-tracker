'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Expense } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ExpenseFormProps {
    expense?: Expense | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: expense?.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        amount: expense?.amount.toString() || '',
        description: expense?.description || '',
        category: expense?.category || 'Food',
        paymentMethod: expense?.paymentMethod || 'Cash',
    });
    const [proofFile, setProofFile] = useState<File | null>(null);

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (expense) {
                // Update existing expense
                await api.updateExpense(expense._id, {
                    ...formData,
                    amount: parseFloat(formData.amount),
                });
                toast.success('Expense updated successfully');
            } else {
                // Create new expense
                const formDataToSend = new FormData();
                formDataToSend.append('date', formData.date);
                formDataToSend.append('amount', formData.amount);
                formDataToSend.append('description', formData.description);
                formDataToSend.append('category', formData.category);
                formDataToSend.append('paymentMethod', formData.paymentMethod);
                if (proofFile) {
                    formDataToSend.append('proof', proofFile);
                }

                await api.createExpense(formDataToSend);
                toast.success('Expense added successfully');
            }
            onSuccess();
        } catch (error: unknown) {
            toast.error(expense ? 'Failed to update expense' : 'Failed to add expense', {
                description: (error as Error).message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="date" className="text-muted-foreground">
                    Date
                </Label>
                <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="bg-muted/50 border-input text-foreground"
                    required
                />
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
                    required
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="text-muted-foreground">
                    Description
                </Label>
                <Input
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="bg-muted/50 border-input text-foreground"
                    placeholder="e.g., Lunch at restaurant"
                    required
                />
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category" className="text-muted-foreground">
                    Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger className="bg-muted/50 border-input text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Accommodation">Accommodation</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-muted-foreground">
                    Payment Method
                </Label>
                <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleChange('paymentMethod', value)}
                >
                    <SelectTrigger className="bg-muted/50 border-input text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Proof Upload (only for new expenses) */}
            {!expense && (
                <div className="space-y-2">
                    <Label htmlFor="proof" className="text-muted-foreground">
                        Proof (Optional)
                    </Label>
                    <Input
                        id="proof"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="bg-muted/50 border-input text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                </div>
            )}

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
                            {expense ? 'Updating...' : 'Adding...'}
                        </>
                    ) : expense ? (
                        'Update Expense'
                    ) : (
                        'Add Expense'
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
