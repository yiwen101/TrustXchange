// utils.ts
type Task<T> = () => Promise<T>;

export class ThreadPool {
    private pool: number;
    private activeCount: number = 0;
    private queue: Array<{
        task: Task<any>;
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    }> = [];
    private finishPromise: Promise<void> | null = null;
    private finishResolve: (() => void) | null = null;

    constructor(poolLimit: number) {
        this.pool = poolLimit;
    }

    public run<T>(task: Task<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.next();
        });
    }

    public async finish_all(): Promise<void> {
        if (this.queue.length === 0 && this.activeCount === 0) {
            return Promise.resolve();
        }

        if (!this.finishPromise) {
            this.finishPromise = new Promise<void>((resolve) => {
                this.finishResolve = resolve;
            });
        }

        return this.finishPromise;
    }

    private next() {
        if (this.activeCount >= this.pool || this.queue.length === 0) {
            if (this.queue.length === 0 && this.activeCount === 0 && this.finishResolve) {
                this.finishResolve();
                this.finishPromise = null;
                this.finishResolve = null;
            }
            return;
        }

        const { task, resolve, reject } = this.queue.shift()!;
        this.activeCount++;

        task()
            .then(resolve)
            .catch(reject)
            .finally(() => {
                this.activeCount--;
                this.next();
            });
    }
}

import { useRef } from 'react';

export const useThreadPool = (poolLimit: number = 8) => {
    const threadPoolRef = useRef<ThreadPool | null>(null);

    if (!threadPoolRef.current) {
        threadPoolRef.current = new ThreadPool(poolLimit);
    }

    return threadPoolRef.current;
};