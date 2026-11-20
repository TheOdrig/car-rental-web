'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { isApiError } from '@/shared/api';
import { formatCurrencyWithDecimals, formatRentalReference } from '@/shared/lib';
import { getPayByLabel, isPaymentWindowOpen, isRentalPaymentSecured, RentalStatus, rentalKeys, useRental } from '@/entities/rental';
import {
    isPaymentSecured,
    paymentKeys,
    usePaymentIntent,
    useRentalPayment,
    type PaymentIntent,
} from '@/entities/payment';
import {
    CONFIG_MISSING_BLOCK,
    describePaymentError,
    describeNotConfirmed,
    describePaymentWindow,
    type PaymentBlock,
} from '../lib/payment-errors';
import { getStripe, resolvePublishableKey } from '../lib/stripe-client';
import { DemoNotice } from './demo-notice';
import { PaymentElementForm } from './payment-element-form';

interface PayRentalProps {
    rentalId: number;
    fallbackPublishableKey?: string;
    returnedPaymentIntent?: string;
    returnedClientSecret?: string;
    redirectStatus?: string;
}

type Phase = 'form' | 'processing';

const REDIRECT_FAILURE_REASON = 'Your payment was not completed. Please try again with another card.';

function Shell({ rentalId, demo = false, children }: { rentalId: number; demo?: boolean; children: ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-xl space-y-4">
            {demo && <DemoNotice />}
            <Card>
                <CardHeader>
                    <h1 className="leading-none font-semibold">Pay for rental {formatRentalReference(rentalId)}</h1>
                </CardHeader>
                <CardContent className="space-y-4">{children}</CardContent>
            </Card>
        </div>
    );
}

function BackLink({ rentalId }: { rentalId: number }) {
    return (
        <Button variant="outline" asChild>
            <Link href={`/rentals/${rentalId}`}>View rental</Link>
        </Button>
    );
}

function BlockedView({ rentalId, block }: { rentalId: number; block: PaymentBlock }) {
    const Icon = block.kind === 'settled' ? CheckCircle2 : ShieldAlert;
    return (
        <Shell rentalId={rentalId}>
            <div className="flex items-start gap-3" role="alert" data-testid={`payment-state-${block.kind}`}>
                <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                    <p className="font-semibold">{block.title}</p>
                    <p className="text-sm text-muted-foreground">{block.message}</p>
                </div>
            </div>
            {block.kind === 'signin' ? (
                <Button asChild>
                    <Link href={`/login?callbackUrl=${encodeURIComponent(`/rentals/${rentalId}/pay`)}`}>Sign in</Link>
                </Button>
            ) : block.kind === 'forbidden' || block.kind === 'not-found' ? (
                <Button variant="outline" asChild>
                    <Link href="/rentals">My rentals</Link>
                </Button>
            ) : (
                <BackLink rentalId={rentalId} />
            )}
        </Shell>
    );
}

function AuthorizedView({ rentalId }: { rentalId: number }) {
    return (
        <Shell rentalId={rentalId}>
            <div className="flex items-start gap-3" role="status" data-testid="payment-state-authorized">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-subtle-foreground" aria-hidden="true" />
                <div>
                    <p className="font-semibold">Payment held; charged at pickup</p>
                    <p className="text-sm text-muted-foreground">
                        Your card is authorized. The amount is captured when you pick up the car.
                    </p>
                </div>
            </div>
            <p className="rounded-md border p-3 text-sm text-muted-foreground" data-testid="off-session-notice">
                By paying you allow us to charge the saved card later for late-return penalties or damage found on
                return.
            </p>
            <BackLink rentalId={rentalId} />
        </Shell>
    );
}

function ProcessingView({ rentalId, timedOut, onCheckAgain }: { rentalId: number; timedOut: boolean; onCheckAgain: () => void }) {
    return (
        <Shell rentalId={rentalId}>
            {timedOut ? (
                <div role="status" className="space-y-3" data-testid="payment-state-timeout">
                    <p className="font-semibold">We are confirming your payment</p>
                    <p className="text-sm text-muted-foreground">
                        The confirmation is taking longer than expected. Refresh the status below. Do not pay again.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={onCheckAgain}>Refresh status</Button>
                        <BackLink rentalId={rentalId} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3" role="status" data-testid="payment-state-processing">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <p>Authorizing your payment...</p>
                </div>
            )}
        </Shell>
    );
}

function CancelledView({ rentalId, onPayAgain }: { rentalId: number; onPayAgain: () => void }) {
    return (
        <Shell rentalId={rentalId} demo>
            <div role="alert" data-testid="payment-state-cancelled">
                <p className="font-semibold">Payment cancelled</p>
                <p className="text-sm text-muted-foreground">The earlier payment attempt was cancelled. You can start a new one.</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={onPayAgain}>Pay again</Button>
                <BackLink rentalId={rentalId} />
            </div>
        </Shell>
    );
}

function FailedView({ rentalId, reason, onRetry }: { rentalId: number; reason: string; onRetry: () => void }) {
    return (
        <Shell rentalId={rentalId} demo>
            <div className="flex items-start gap-3" role="alert" data-testid="payment-state-failed">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                <div>
                    <p className="font-semibold">Payment failed</p>
                    <p className="text-sm text-muted-foreground">{reason}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button onClick={onRetry}>Try again</Button>
                <BackLink rentalId={rentalId} />
            </div>
        </Shell>
    );
}

function ReadyView({
    rentalId,
    intent,
    publishableKey,
    payBy,
    onConfirmed,
}: {
    rentalId: number;
    intent: PaymentIntent;
    publishableKey: string;
    payBy?: string;
    onConfirmed: () => void;
}) {
    const amountLabel = formatCurrencyWithDecimals(intent.amount, intent.currency);
    const returnUrl = `${window.location.origin}/rentals/${rentalId}/pay`;

    return (
        <Shell rentalId={rentalId} demo>
            <div data-testid="payment-state-ready" className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount to authorize</span>
                    <span className="text-lg font-semibold">{amountLabel}</span>
                </div>
                {payBy && (
                    <p className="text-sm text-muted-foreground" data-testid="pay-by">
                        {payBy}
                    </p>
                )}
                <Elements
                    key={intent.clientSecret}
                    stripe={getStripe(publishableKey)}
                    options={{ clientSecret: intent.clientSecret, appearance: { theme: 'stripe' } }}
                >
                    <PaymentElementForm
                        returnUrl={returnUrl}
                        amountLabel={amountLabel}
                        onConfirmed={onConfirmed}
                    />
                </Elements>
            </div>
        </Shell>
    );
}

export function PayRental({
    rentalId,
    fallbackPublishableKey,
    returnedPaymentIntent,
    returnedClientSecret,
    redirectStatus,
}: PayRentalProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const returned = Boolean(returnedPaymentIntent || returnedClientSecret);

    const [phase, setPhase] = useState<Phase>(returned && redirectStatus !== 'failed' ? 'processing' : 'form');
    const [attempt, setAttempt] = useState(0);
    const [pollRun, setPollRun] = useState(0);
    const [failure, setFailure] = useState<string | null>(
        returned && redirectStatus === 'failed' ? REDIRECT_FAILURE_REASON : null
    );

    const processing = phase === 'processing';
    const rentalQuery = useRental(rentalId);
    const paymentOpensOn = rentalQuery.data?.paymentOpensOn;
    const windowClosed = Boolean(paymentOpensOn) && !isPaymentWindowOpen(paymentOpensOn!);
    const alreadySecured = isRentalPaymentSecured(rentalQuery.data?.paymentStatus);
    const awaitingApproval = rentalQuery.data?.status === RentalStatus.REQUESTED;
    const intentEnabled =
        !processing && failure === null && !rentalQuery.isPending && !awaitingApproval && !windowClosed && !alreadySecured;
    const intentQuery = usePaymentIntent(rentalId, attempt, intentEnabled);
    const paymentQuery = useRentalPayment(rentalId, { poll: processing, enabled: processing, runKey: pollRun });

    useEffect(() => {
        if (!returnedClientSecret) {
            return;
        }

        const kept = new URLSearchParams();
        if (returnedPaymentIntent) kept.set('payment_intent', returnedPaymentIntent);
        if (redirectStatus) kept.set('redirect_status', redirectStatus);
        const query = kept.toString();
        router.replace(`/rentals/${rentalId}/pay${query ? `?${query}` : ''}`, { scroll: false });
    }, [returnedClientSecret, returnedPaymentIntent, redirectStatus, rentalId, router]);

    const intentStatus = isApiError(intentQuery.error) ? intentQuery.error.status : undefined;
    useEffect(() => {
        if (intentStatus === 409) {
            void queryClient.invalidateQueries({ queryKey: rentalKeys.detail(rentalId) });
            void queryClient.invalidateQueries({ queryKey: paymentKeys.byRental(rentalId) });
        }
    }, [intentStatus, queryClient, rentalId]);

    const startProcessing = () => {
        queryClient.removeQueries({ queryKey: paymentKeys.byRental(rentalId) });
        setFailure(null);
        setPhase('processing');
    };

    const retry = () => {
        queryClient.removeQueries({ queryKey: paymentKeys.byRental(rentalId) });
        if (returned) {
            router.replace(`/rentals/${rentalId}/pay`);
        }
        setFailure(null);
        setPhase('form');
        setAttempt((value) => value + 1);
    };

    const checkAgain = () => {
        queryClient.removeQueries({ queryKey: paymentKeys.byRental(rentalId) });
        setPollRun((value) => value + 1);
    };

    if (failure !== null) {
        return <FailedView rentalId={rentalId} reason={failure} onRetry={retry} />;
    }

    if (processing) {
        const payment = paymentQuery.data;
        if (isPaymentSecured(payment?.status)) {
            return <AuthorizedView rentalId={rentalId} />;
        }
        if (payment?.status === 'FAILED') {
            return (
                <FailedView
                    rentalId={rentalId}
                    reason={payment.failureReason ?? 'The payment was declined.'}
                    onRetry={retry}
                />
            );
        }
        if (paymentQuery.error) {
            return <BlockedView rentalId={rentalId} block={describePaymentError(paymentQuery.error)} />;
        }
        return <ProcessingView rentalId={rentalId} timedOut={paymentQuery.timedOut} onCheckAgain={checkAgain} />;
    }

    if (alreadySecured) {
        return <AuthorizedView rentalId={rentalId} />;
    }

    if (awaitingApproval) {
        return <BlockedView rentalId={rentalId} block={describeNotConfirmed(windowClosed ? paymentOpensOn : undefined)} />;
    }

    if (windowClosed) {
        return <BlockedView rentalId={rentalId} block={describePaymentWindow(paymentOpensOn)} />;
    }

    if (intentQuery.isPending) {
        return (
            <Shell rentalId={rentalId} demo>
                <div className="flex items-center gap-3" role="status" data-testid="payment-state-loading">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <p>Preparing your payment...</p>
                </div>
            </Shell>
        );
    }

    if (intentQuery.error || !intentQuery.data) {
        return <BlockedView rentalId={rentalId} block={describePaymentError(intentQuery.error)} />;
    }

    const intent = intentQuery.data;
    if (isPaymentSecured(intent.status)) {
        return <AuthorizedView rentalId={rentalId} />;
    }
    if (intent.status === 'CANCELLED') {
        return <CancelledView rentalId={rentalId} onPayAgain={retry} />;
    }

    const publishableKey = resolvePublishableKey(intent.publishableKey, fallbackPublishableKey);
    if (!publishableKey) {
        return <BlockedView rentalId={rentalId} block={CONFIG_MISSING_BLOCK} />;
    }

    return (
        <ReadyView
            rentalId={rentalId}
            intent={intent}
            publishableKey={publishableKey}
            payBy={getPayByLabel(rentalQuery.data?.paymentDueBy)}
            onConfirmed={startProcessing}
        />
    );
}
