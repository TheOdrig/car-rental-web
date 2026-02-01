import { eventBus } from '@/shared/events';
import type { User, AdminNote } from './types';





export const USERS_EVENTS = {
    USER_BANNED: 'users:user:banned',
    USER_UNBANNED: 'users:user:unbanned',
    USER_NOTE_ADDED: 'users:user:note-added',
    USER_UPDATED: 'users:user:updated',
} as const;

export type UsersEventType = typeof USERS_EVENTS[keyof typeof USERS_EVENTS];





export interface UserBannedPayload {
    userId: number;
    reason: string;
    bannedBy?: string;
}

export interface UserUnbannedPayload {
    userId: number;
    note?: string;
    unbannedBy?: string;
}

export interface UserNoteAddedPayload {
    userId: number;
    note: AdminNote;
    addedBy?: string;
}

export interface UserUpdatedPayload {
    userId: number;
    user: User;
    updatedBy?: string;
    changes?: Partial<User>;
}





export function publishUserBanned(payload: UserBannedPayload): void {
    eventBus.publish(USERS_EVENTS.USER_BANNED, payload);
}

export function publishUserUnbanned(payload: UserUnbannedPayload): void {
    eventBus.publish(USERS_EVENTS.USER_UNBANNED, payload);
}

export function publishUserNoteAdded(payload: UserNoteAddedPayload): void {
    eventBus.publish(USERS_EVENTS.USER_NOTE_ADDED, payload);
}

export function publishUserUpdated(payload: UserUpdatedPayload): void {
    eventBus.publish(USERS_EVENTS.USER_UPDATED, payload);
}





export function subscribeToUserBanned(handler: (payload: UserBannedPayload) => void): () => void {
    return eventBus.subscribe(USERS_EVENTS.USER_BANNED, handler);
}

export function subscribeToUserUnbanned(handler: (payload: UserUnbannedPayload) => void): () => void {
    return eventBus.subscribe(USERS_EVENTS.USER_UNBANNED, handler);
}

export function subscribeToUserNoteAdded(handler: (payload: UserNoteAddedPayload) => void): () => void {
    return eventBus.subscribe(USERS_EVENTS.USER_NOTE_ADDED, handler);
}

export function subscribeToUserUpdated(handler: (payload: UserUpdatedPayload) => void): () => void {
    return eventBus.subscribe(USERS_EVENTS.USER_UPDATED, handler);
}