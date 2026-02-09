import { signal, Signal } from '@angular/core';
import { environment } from '@/environments/environment';
import {
  catchError,
  finalize,
  firstValueFrom,
  from,
  isObservable,
  Observable,
  Subject,
  takeUntil,
  tap
} from 'rxjs';
import { notify } from './notification';

/**
 * Factory function that returns an Observable or a Promise.
 * Receives a SINGLE optional parameter (primitive or object).
 */
export type AsyncFactory<TParams, TResult> = (
  params: TParams extends void ? undefined : TParams
) => Observable<TResult> | Promise<TResult>;

/**
 * Unwraps Observable<T> or Promise<T> to T
 */
type UnwrapAsync<T> = T extends Observable<infer U> ? U : T extends Promise<infer U> ? U : T;

/**
 * Options for load and mutate methods.
 */
interface Options {
  notifyError?: boolean;
}

/**
 * Options for collection load method.
 */
interface CollectionOptions extends Options {
  append?: boolean;
}

/**
 * Response shape when the API returns data + total count.
 */
export type CollectionResult<T extends unknown[]> = { data: T; total: number };

function isCollectionResult(value: unknown): value is CollectionResult<unknown[]> {
  return (
    value != null &&
    typeof value === 'object' &&
    'data' in value &&
    'total' in value &&
    Array.isArray((value as CollectionResult<unknown[]>).data) &&
    typeof (value as CollectionResult<unknown[]>).total === 'number'
  );
}

/**
 * Normalizes a Promise or Observable into an Observable.
 */
function toObservable<T>(value: Observable<T> | Promise<T>): Observable<T> {
  return isObservable(value) ? value : from(value);
}

/**
 * State container for a GET resource.
 */
export interface Resource<TParams, TResult> {
  readonly value: Signal<TResult | null>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<unknown | null>;
  readonly load: (
    params?: TParams extends void ? undefined : TParams,
    options?: Options
  ) => Promise<TResult>;
  readonly reload: () => Promise<TResult | null>;
  readonly destroy: () => void;
}

/**
 * State container for a GET collection resource.
 */
export interface ResourceCollection<TParams, TResult extends unknown[]>
  extends Resource<TParams, TResult> {
  readonly accumulated: Signal<TResult | null>;
  /** Total de registros cuando el API devuelve { data, total }. */
  readonly total: Signal<number | null>;
  readonly load: (
    params?: TParams extends void ? undefined : TParams,
    options?: CollectionOptions
  ) => Promise<TResult>;
}

/**
 * Mutation function with its associated reactive state.
 */
export interface Mutate<TResult> {
  (data: unknown, options?: Options): Promise<TResult | null>;
  submitting: Signal<boolean>;
  value: Signal<TResult | null>;
  error: Signal<unknown | null>;
}

/**
 * Custom exception used for resource and mutation failures.
 */
export class ResourceException extends Error {
  public raw: unknown;

  constructor(message: string, raw: unknown) {
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
export function getMutations<T extends Record<string, AsyncFactory<any, any>>>(
  factories: T
): {
  [K in keyof T]: Mutate<UnwrapAsync<ReturnType<T[K]>>>;
} & {
  submitting: Signal<boolean>;
  error: Signal<unknown | null>;
} {
  const mutations: any = {};
  const globalSubmitting = signal(false);
  const globalError = signal<unknown | null>(null);

  const submittingSignals: Signal<boolean>[] = [];

  for (const key in factories) {
    const submitting = signal(false);
    const value = signal<unknown | null>(null);
    const error = signal<unknown | null>(null);

    submittingSignals.push(submitting);

    const fn: Mutate<any> = async (data: unknown, options?: Options) => {
      const { notifyError = true } = options || {};
      submitting.set(true);
      error.set(null);
      value.set(null);
      globalSubmitting.set(true);

      const request$ = toObservable(factories[key](data as any)).pipe(
        tap((result) => value.set(result ?? null)),
        catchError((err) => {
          const msg =
            err?.error?.messages?.[0] ?? err?.message ?? err ?? $localize`Unexpected error`;

          error.set(msg);
          globalError.set(msg);

          if (notifyError) {
            notify(msg, { level: 'error' });
          }

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
): Resource<TParams, TResult> {
  const loading = signal(false);
  const value = signal<TResult | null>(null);
  const error = signal<unknown | null>(null);
  const destroy$ = new Subject<void>();

  let lastParams: TParams extends void ? undefined : TParams;
  let lastOptions: Options | undefined;

  const load = async (
    params?: TParams extends void ? undefined : TParams,
    options?: Options
  ): Promise<TResult> => {
    const { notifyError = true } = options || {};
    lastParams = params as any;
    lastOptions = options;

    loading.set(true);
    error.set(null);

    const request$ = toObservable(factory(params as any)).pipe(
      tap((result) => value.set(result ?? null)),
      catchError((err) => {
        const msg = err?.error?.messages?.[0] ?? err?.message ?? err ?? $localize`Unexpected error`;

        error.set(msg);

        if (notifyError) {
          notify(msg, { level: 'error' });
        }

        throw new ResourceException(msg, err);
      }),
      finalize(() => loading.set(false)),
      takeUntil(destroy$)
    );

    return await firstValueFrom(request$);
  };

  const reload = () => load(lastParams, lastOptions);

  return {
    value: value.asReadonly(),
    loading: loading.asReadonly(),
    error: error.asReadonly(),
    load,
    reload,
    destroy: () => {
      destroy$.next();
      destroy$.complete();
    }
  };
}

/**
 * Creates a reactive resource (GET) with support for accumulable collections.
 */
export function getResourceCollection<TParams, TResult extends unknown[]>(
  factory: AsyncFactory<TParams, TResult | CollectionResult<TResult>>
): ResourceCollection<TParams, TResult> {
  const loading = signal(false);
  const value = signal<TResult | null>(null);
  const accumulated = signal<TResult | null>(null);
  const total = signal<number | null>(null);
  const error = signal<unknown | null>(null);
  const destroy$ = new Subject<void>();

  let lastParams: TParams extends void ? undefined : TParams;
  let lastOptions: CollectionOptions | undefined;

  const load = async (
    params?: TParams extends void ? undefined : TParams,
    options?: CollectionOptions
  ): Promise<TResult> => {
    const { notifyError = true, append = false } = options || {};
    lastParams = params as any;
    lastOptions = options;

    loading.set(true);
    error.set(null);
    value.set(null);

    if (!append) {
      accumulated.set(null);
      total.set(null);
    }

    const request$ = toObservable(factory(params as any)).pipe(
      tap((result) => {
        const data: TResult | null = isCollectionResult(result)
          ? (result.data as TResult)
          : ((result as TResult) ?? null);

        value.set(data);

        if (isCollectionResult(result)) {
          total.set(result.total);
        } else {
          total.set(null);
        }

        if (append && accumulated() && data) {
          accumulated.set([...(accumulated() as unknown[]), ...(data as unknown[])] as TResult);
        } else {
          accumulated.set(data);
        }
      }),
      catchError((err) => {
        const msg = err?.error?.messages?.[0] ?? err?.message ?? err ?? $localize`Unexpected error`;

        error.set(msg);

        if (notifyError) {
          notify(msg, { level: 'error' });
        }

        throw new ResourceException(msg, err);
      }),
      finalize(() => loading.set(false)),
      takeUntil(destroy$)
    );

    const raw = await firstValueFrom(request$);
    return (isCollectionResult(raw) ? raw.data : raw) as TResult;
  };

  const reload = () => load(lastParams, { ...lastOptions, append: false });

  return {
    value: value.asReadonly(),
    accumulated: accumulated.asReadonly(),
    total: total.asReadonly(),
    loading: loading.asReadonly(),
    error: error.asReadonly(),
    load,
    reload,
    destroy: () => {
      destroy$.next();
      destroy$.complete();
    }
  };
}
