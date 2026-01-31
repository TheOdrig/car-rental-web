export interface DomainEvent<T = unknown> {
    type: string;
    payload: T;
    timestamp: Date;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => void;
