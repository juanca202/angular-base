import { inject, signal, Signal } from '@angular/core';
import { MessageService } from '@factor_ec/ui';
import { environment } from '@/environments/environment';
import {
  catchError,
  finalize,
  firstValueFrom,
  from,
  isObservable,
  map,
  Observable,
  Subject,
  takeUntil,
  tap
} from 'rxjs';

/**
 * Factory function that can return either an Observable or a Promise.
 * Used to unify async handling across resources and mutations.
 */
export type AsyncFactory<TParams, TResult> = (
  ...params: TParams extends any[] ? TParams : TParams extends void ? [] : [TParams]
) => Observable<TResult> | Promise<TResult>;

/**
 * Extracts the inner value type from an Observable or a Promise.
 */
type UnwrapAsync<T> = T extends Observable<infer U> ? U : T extends Promise<infer U> ? U : T;

/**
 * Arguments accepted by `load()`
 */
type LoadArgs<TParams> = TParams extends void ? [] : TParams extends undefined ? [] : [TParams?];

/**
 * Normalizes a Promise or Observable into an Observable.
 */
function toObservable<T>(value: Observable<T> | Promise<T>): Observable<T> {
  return isObservable(value) ? value : from(value);
}

/**
 * State container for a GET resource.
 */
export interface SignalGet<TParams, TResult> {
  readonly value: Signal<TResult | null>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<any | null>;
  readonly load: (...params: LoadArgs<TParams>) => Promise<TResult | null>;
  readonly refresh: () => Promise<TResult | null>;
  readonly destroy: () => void;
}

/**
 * Mutation function with its associated reactive state.
 */
export interface SignalMutateFn<TArgs extends any[], TResult> {
  (...args: TArgs): Promise<TResult | null>;
  submitting: Signal<boolean>;
  value: Signal<TResult | null>;
  error: Signal<any | null>;
}

/**
 * Custom exception used for resource and mutation failures.
 */
export class ResourceException extends Error {
  public raw: any;

  constructor(message: string, raw: any) {
    super(message);
    this.raw = raw;
    Object.setPrototypeOf(this, ResourceException.prototype);
  }
}

/**
 * Builds the full backend API URL for a given path.
 */
export function getApiUrl(path: string): string {
  return `${environment.restEndpoint}/${path}`;
}

/**
 * Creates a set of mutation handlers (POST / PUT / DELETE).
 */
export function getMutations<T extends Record<string, AsyncFactory<any[], any>>>(
  factories: T
): {
  [K in keyof T]: SignalMutateFn<Parameters<T[K]>, UnwrapAsync<ReturnType<T[K]>>>;
} & {
  submitting: Signal<boolean>;
  error: Signal<any | null>;
} {
  const messageService = inject(MessageService);
  const mutations: any = {};
  const globalSubmitting = signal(false);
  const globalError = signal<any | null>(null);

  const submittingSignals: Signal<boolean>[] = [];

  for (const key in factories) {
    const submitting = signal(false);
    const value = signal<any | null>(null);
    const error = signal<any | null>(null);

    submittingSignals.push(submitting);

    const fn: SignalMutateFn<any[], any> = async (...args: any[]) => {
      submitting.set(true);
      error.set(null);
      value.set(null);
      globalSubmitting.set(true);

      const request$ = toObservable(factories[key](...args)).pipe(
        tap((result) => value.set(result ?? null)),
        catchError((err) => {
          const msg =
            err?.error?.messages?.[0] ?? err?.message ?? err ?? $localize`Unexpected error`;

          error.set(msg);
          globalError.set(msg);
          messageService.show(msg);
          throw new ResourceException(msg, err);
        }),
        finalize(() => {
          submitting.set(false);
          globalSubmitting.set(submittingSignals.some((s) => s()));
        })
      );

      return firstValueFrom(request$);
    };

    fn.submitting = submitting.asReadonly();
    fn.value = value.asReadonly();
    fn.error = error.asReadonly();

    mutations[key] = fn;
  }

  mutations.submitting = globalSubmitting.asReadonly();
  mutations.error = globalError.asReadonly();

  return mutations;
}

/**
 * Creates a reactive GET resource with lifecycle and state management.
 */
export function getResource<TParams, TResult>(
  factory: AsyncFactory<TParams, TResult>
): SignalGet<TParams, TResult> {
  const messageService = inject(MessageService);
  const loading = signal(false);
  const value = signal<TResult | null>(null);
  const error = signal<any | null>(null);
  const destroy$ = new Subject<void>();
  let lastParams: any[] | null = null;

  const load = async (...params: LoadArgs<TParams>): Promise<TResult | null> => {
    lastParams = params;
    loading.set(true);
    error.set(null);

    const request$ = toObservable(factory(...(params as any))).pipe(
      map((response) =>
        response && 'payload' in (response as any) ? (response as any).payload : response
      ),
      tap((result) => value.set((result ?? null) as TResult | null)),
      catchError((err) => {
        const msg = err?.error?.messages?.[0] ?? err?.message ?? err ?? $localize`Unexpected error`;

        error.set(msg);
        messageService.show(msg);
        throw new ResourceException(msg, err);
      }),
      finalize(() => loading.set(false)),
      takeUntil(destroy$)
    );

    return firstValueFrom(request$);
  };

  const refresh = async (): Promise<TResult | null> => {
    if (lastParams === null) {
      throw new Error($localize`Cannot refresh: no previous load call made`);
    }
    return load(...(lastParams as any));
  };

  return {
    value: value.asReadonly(),
    loading: loading.asReadonly(),
    error: error.asReadonly(),
    load,
    refresh,
    destroy: () => {
      destroy$.next();
      destroy$.complete();
    }
  };
}
