'use client';

import { useState } from 'react';
import { Plus, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PaymentCard } from '@/components/settings/payment-card';
import { AddCardForm } from '@/components/settings/add-card-form';
import { EmptyState } from '@/components/shared/empty-state';
import { showToast } from '@/lib/utils/toast';
import { ComingSoonBanner } from '@/components/ui/coming-soon-banner';
import type { PaymentMethod } from '@/types/payment';

const MOCK_CARDS: PaymentMethod[] = [
    {
        id: '1',
        cardType: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2027,
        cardholderName: 'John Doe',
        isDefault: true,
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        cardType: 'mastercard',
        last4: '8888',
        expiryMonth: 6,
        expiryYear: 2026,
        cardholderName: 'John Doe',
        isDefault: false,
        createdAt: '2024-03-20',
    },
];

export default function PaymentMethodsPage() {
    const [cards, setCards] = useState<PaymentMethod[]>(MOCK_CARDS);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [deleteCardId, setDeleteCardId] = useState<string | null>(null);

    const handleSetDefault = (id: string) => {
        setCards((prev) =>
            prev.map((card) => ({
                ...card,
                isDefault: card.id === id,
            }))
        );
        showToast.success('Default payment method updated');
    };

    const handleDelete = (id: string) => {
        setDeleteCardId(id);
    };

    const confirmDelete = () => {
        if (deleteCardId) {
            setCards((prev) => prev.filter((card) => card.id !== deleteCardId));
            showToast.success('Card removed successfully');
            setDeleteCardId(null);
        }
    };

    const handleAddCard = async (data: { cardNumber: string; cardholderName: string; setAsDefault?: boolean }) => {
        const newCard: PaymentMethod = {
            id: Date.now().toString(),
            cardType: 'visa',
            last4: data.cardNumber.slice(-4),
            expiryMonth: 12,
            expiryYear: 2028,
            cardholderName: data.cardholderName,
            isDefault: data.setAsDefault || cards.length === 0,
            createdAt: new Date().toISOString(),
        };

        if (newCard.isDefault) {
            setCards((prev) =>
                prev.map((card) => ({ ...card, isDefault: false }))
            );
        }

        setCards((prev) => [...prev, newCard]);
        setShowAddDialog(false);
        showToast.success('Card added successfully');
    };

    return (
        <div className="space-y-6">
            <ComingSoonBanner
                title="Payment Methods Coming Soon"
                description="Card management is currently in demo mode. Added cards are stored locally and real payment processing is not yet available."
            />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Methods
                        </CardTitle>
                        <CardDescription>
                            Manage your saved payment methods
                        </CardDescription>
                    </div>
                    <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Card
                    </Button>
                </CardHeader>
                <CardContent>
                    {cards.length === 0 ? (
                        <EmptyState
                            type="cart"
                            title="No payment methods"
                            description="Add a card to make payments faster and easier"
                            action={{
                                label: 'Add your first card',
                                onClick: () => setShowAddDialog(true),
                            }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {cards.map((card) => (
                                <PaymentCard
                                    key={card.id}
                                    method={card}
                                    onSetDefault={handleSetDefault}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center gap-3 py-4">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div className="text-sm">
                        <p className="font-medium">Secure Payments</p>
                        <p className="text-muted-foreground">
                            All transactions are encrypted and processed securely
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Enter your card details to add a new payment method
                        </DialogDescription>
                    </DialogHeader>
                    <AddCardForm
                        onSubmit={handleAddCard}
                        onCancel={() => setShowAddDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteCardId} onOpenChange={() => setDeleteCardId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this card? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
