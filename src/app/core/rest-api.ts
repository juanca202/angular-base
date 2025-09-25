import { inject, signal, Signal } from '@angular/core';
import { MessageService } from '@factor_ec/ui';
import { environment } from 'environments/environment';
import {
  catchError,
  finalize,
  firstValueFrom,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';

/**
 * Extrae los parámetros de una función observable en forma de tupla.
 */
type ObservableFactory<TParams, TResult> = (
  ...params: TParams extends any[] ? TParams : TParams extends void ? [] : [TParams]
) => Observable<TResult>;

/** Extrae el tipo de valor de un Observable */
type UnwrapObservable<T> = T extends Observable<infer U> ? U : T;

/**
 * Estado de un recurso que se obtiene mediante `load` (GET).
 */
export interface SignalGet<TParams, TResult> {
  readonly value: Signal<TResult | null>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<any | null>;
  readonly load: (
    ...params: TParams extends any[] ? TParams : TParams extends void ? [] : [TParams]
  ) => Promise<TResult | null>;
  readonly destroy: () => void;
}

/**
 * Estado de una mutación (POST/PUT/DELETE).
 */
export interface SignalMutate<TParams, TResult> {
  readonly submitting: Signal<boolean>;
  readonly value: Signal<TResult | null>;
  readonly error: Signal<any | null>;
  readonly submit: (
    ...params: TParams extends any[] ? TParams : TParams extends void ? [] : [TParams]
  ) => Promise<TResult | null>;
}

/**
 * Función mutación con estado incluido.
 */
export interface SignalMutateFn<TArgs extends any[], TResult> {
  (...args: TArgs): Promise<TResult | null>;
  submitting: Signal<boolean>;
  value: Signal<TResult | null>;
  error: Signal<any | null>;
}

export class MutationException extends Error {
  public raw: any;
  constructor(message: string, raw: any) {
    super(message);
    this.raw = raw;
    Object.setPrototypeOf(this, MutationException.prototype);
  }
}

/** Construye la URL base del backend */
export function getApiUrl(path: string): string {
  return `${environment.restEndpoint}/${path}`;
}

/**
 * Crea un conjunto de mutaciones a partir de una colección de fábricas de observables.
 * Cada mutación tiene su propio estado y se expone un estado global de `submitting` y `error`.
 */
export function getMutations<T extends Record<string, (...args: any[]) => Observable<any>>>(
  factories: T,
): {
  [K in keyof T]: SignalMutateFn<Parameters<T[K]>, UnwrapObservable<ReturnType<T[K]>>>;
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

    const fn: any = async (...args: any[]): Promise<any | null> => {
      submitting.set(true);
      error.set(null);
      value.set(null);
      globalSubmitting.set(true);

      const request$ = factories[key](...args).pipe(
        tap((result) => value.set(result ?? null)),
        catchError((err) => {
          const msg = err?.error?.messages?.[0] ?? err?.message ?? err ?? 'Error inesperado';
          error.set(msg);
          globalError.set(msg);
          messageService.show(msg);
          // vuelve a lanzar para usar try/catch
          throw new MutationException(msg, err);
        }),
        finalize(() => {
          submitting.set(false);
          globalSubmitting.set(submittingSignals.some((s) => s()));
        }),
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
 * Crea un recurso reactivo (GET) que administra su estado y puede destruirse.
 */
export function getResource<TParams, TResult>(
  observableFactory: ObservableFactory<TParams, TResult>,
): SignalGet<TParams, TResult> {
  const messageService = inject(MessageService);
  const loading = signal(false);
  const value = signal<TResult | null>(null);
  const error = signal<any | null>(null);
  const destroy$ = new Subject<void>();

  const load = async (
    ...params: TParams extends any[] ? TParams : TParams extends void ? [] : [TParams]
  ): Promise<TResult | null> => {
    loading.set(true);
    error.set(null);
    value.set(null);

    const request$ = observableFactory(...(params as any)).pipe(
      map((response) =>
        response && 'payload' in (response as any) ? (response as any).payload : response,
      ),
      tap((result) => value.set((result ?? null) as TResult | null)),
      catchError((err) => {
        const msg = err?.error?.messages?.[0] ?? err?.message ?? err ?? 'Error inesperado';
        error.set(msg);
        messageService.show(msg);
        // vuelve a lanzar para usar try/catch
        throw new MutationException(msg, err);
      }),
      finalize(() => loading.set(false)),
      takeUntil(destroy$),
    );

    return firstValueFrom(request$);
  };

  return {
    value: value.asReadonly(),
    loading: loading.asReadonly(),
    error: error.asReadonly(),
    load,
    destroy: () => {
      destroy$.next();
      destroy$.complete();
    },
  };
}
