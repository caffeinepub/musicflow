import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LyricLine {
    text: string;
    timeSeconds: number;
}
export interface UserProfile {
    name: string;
}
export interface Song {
    id: bigint;
    title: string;
    duration: bigint;
    audioUrl: string;
    artist: string;
    coverUrl: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFavorites(): Promise<Array<bigint>>;
    getLyrics(songId: bigint): Promise<Array<LyricLine>>;
    getPlayCount(songId: bigint): Promise<bigint>;
    getSongs(): Promise<Array<Song>>;
    getTopPlayed(): Promise<Array<Song>>;
    getTotalSecondsListened(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isFavorite(songId: bigint): Promise<boolean>;
    recordPlay(songId: bigint, secondsListened: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleFavorite(songId: bigint): Promise<void>;
}
