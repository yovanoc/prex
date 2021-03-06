/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

/**
 * Encapsulates a Promise and exposes its resolve and reject callbacks.
 */
export class Deferred<T> {
    private _promise: Promise<T>;
    private _resolve!: (value?: PromiseLike<T> | T) => void;
    private _reject!: (reason: any) => void;
    private _callback?: (err: Error | null | undefined, value: T) => void;

    /**
     * Initializes a new instance of the Deferred class.
     */
    constructor() {
        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    /**
     * Gets the promise.
     */
    get promise(): Promise<T> {
        return this._promise;
    }

    /**
     * Gets the callback used to resolve the promise.
     */
    get resolve() { return this._resolve; }

    /**
     * Gets the callback used to reject the promise.
     */
    get reject() { return this._reject; }

    /**
     * Gets a NodeJS-style callback that can be used to resolve or reject the promise.
     */
    get callback() {
        if (!this._callback) {
            this._callback = this.createCallback(identity);
        }
        return this._callback as T extends void
            ? ((err: Error | null | undefined) => void)
            : ((err: Error | null | undefined, value: T) => void);
    }

    /**
     * Creates a NodeJS-style callback that can be used to resolve or reject the promise with multiple values.
     */
    createCallback<A extends any[]>(selector: (...args: A) => T) {
        return (err: Error | null | undefined, ...args: A) => {
            if (err !== null && err !== undefined) {
                this._reject(err);
            }
            else {
                this._resolve(selector(...args));
            }
        };
    }
}

function identity<A extends any[]>(...args: A): A[0];
function identity<T>(value: T) { return value; }