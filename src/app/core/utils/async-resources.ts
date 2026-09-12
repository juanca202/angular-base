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
import { notify } from '@/core/utils/notification';

/**
 * Factory function that returns an Observable or a Promise.
 * Receives a SINGLE optional parameter (primitive or object).
 */
export type AsyncFactory<TParams, TResult> = (
  params: TParams extends void ? undefined : TParams
) => Observable<TResult> | Promise<TResult>;

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
 * Resolves optional load/mutate params for a given factory param type.
 */
type FactoryParams<TParams> = TParams extends void ? undefined : TParams;

/**
 * Extracts the params type from an async factory.
 */
type ParamsOf<TFactory> = TFactory extends AsyncFactory<infer TParams, unknown> ? TParams : never;

/**
 * Extracts the result type from an async factory.
 */
type ResultOf<TFactory> = TFactory extends AsyncFactory<unknown, infer TResult> ? TResult : never;

/**
 * Mutation function with its associated reactive state.
 */
export interface Mutate<TParams = unknown, TResult = unknown> {
  (data: FactoryParams<TParams>, options?: Options): Promise<TResult>;
  submitting: Signal<boolean>;
  value: Signal<TResult | null>;
  error: Signal<unknown | null>;
}

type MutationsResult<T> = {
  [K in keyof T]: T[K] extends AsyncFactory<infer TParams, infer TResult>
    ? Mutate<TParams, TResult>
    : never;
} & {
  submitting: Signal<boolean>;
  error: Signal<unknown | null>;
};

function createMutationHandler<TParams, TResult>(
  factory: AsyncFactory<TParams, TResult>,
  submitting: ReturnType<typeof signal<boolean>>,
  value: ReturnType<typeof signal<TResult | null>>,
  error: ReturnType<typeof signal<unknown | null>>,
  globalError: ReturnType<typeof signal<unknown | null>>,
  onGlobalStart: () => void,
  onGlobalEnd: () => void
): Mutate<TParams, TResult> {
  const fn = async (data: FactoryParams<TParams>, options?: Options): Promise<TResult> => {
    const { notifyError = true } = options || {};
    submitting.set(true);
    error.set(null);
    value.set(null);
    onGlobalStart();

    const request$ = toObservable(factory(data)).pipe(
      tap((result) => value.set(result ?? null)),
      catchError((err) => {
        const msg = err?.error?.messages?.[0] ?? err?.message ?? err ?? $localize`Unexpected error`;

        error.set(msg);
        globalError.set(msg);

        if (notifyError) {
          notify(msg, { level: 'error' });
        }

        throw new ResourceException(msg, err);
      }),
      finalize(() => {
        submitting.set(false);
        onGlobalEnd();
      })
    );

    return firstValueFrom(request$);
  };

  fn.submitting = submitting.asReadonly();
  fn.value = value.asReadonly();
  fn.error = error.asReadonly();

  return fn;
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
  return `${environment.apiRestBaseUrl}/${path}`;
}

/**
 * Creates a set of mutation handlers (POST / PUT / DELETE).
 */
export function getMutations<T extends object>(factories: T): MutationsResult<T> {
  const mutations = {} as MutationsResult<T>;
  const globalSubmitting = signal(false);
  const globalError = signal<unknown | null>(null);

  const submittingSignals: Signal<boolean>[] = [];

  const syncGlobalSubmitting = (): void => {
    globalSubmitting.set(submittingSignals.some((s) => s()));
  };

  (Object.keys(factories) as Array<keyof T & string>).forEach((key) => {
    const factory = factories[key] as AsyncFactory<
      ParamsOf<T[typeof key]>,
      ResultOf<T[typeof key]>
    >;
    const submitting = signal(false);
    const value = signal<ResultOf<T[typeof key]> | null>(null);
    const error = signal<unknown | null>(null);

    submittingSignals.push(submitting);

    mutations[key] = createMutationHandler(
      factory,
      submitting,
      value,
      error,
      globalError,
      () => globalSubmitting.set(true),
      syncGlobalSubmitting
    ) as MutationsResult<T>[typeof key];
  });

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

  let lastParams: FactoryParams<TParams> | undefined;
  let lastOptions: Options | undefined;

  const load = async (params?: FactoryParams<TParams>, options?: Options): Promise<TResult> => {
    const { notifyError = true } = options || {};
    lastParams = params;
    lastOptions = options;

    loading.set(true);
    error.set(null);

    const request$ = toObservable(factory(params as FactoryParams<TParams>)).pipe(
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

  let lastParams: FactoryParams<TParams> | undefined;
  let lastOptions: CollectionOptions | undefined;

  const load = async (
    params?: FactoryParams<TParams>,
    options?: CollectionOptions
  ): Promise<TResult> => {
    const { notifyError = true, append = false } = options || {};
    lastParams = params;
    lastOptions = options;

    loading.set(true);
    error.set(null);

    if (!append) {
      accumulated.set(null);
      total.set(null);
    }

    const request$ = toObservable(factory(params as FactoryParams<TParams>)).pipe(
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
