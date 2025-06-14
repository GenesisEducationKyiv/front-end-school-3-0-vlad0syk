import * as Belt from '@mobily/ts-belt';
import { QueryParams, QueryParamsSchema } from '../types';
import { OrderOption, orderOptions, sortOptions, SortOption, MAX_PAGE, MAX_LIMIT, MIN_LIMIT, DEFAULT_LIMIT, DEFAULT_PAGE } from './useValidatedSearchParams';

export function buildSearchParams(params: Partial<QueryParams>): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' || (typeof value === 'number' && !Number.isNaN(value))) {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams;
}

export function parseSearchParams(searchString: string): {
  params: QueryParams;
  isValid: boolean;
} {
  const urlParams = new URLSearchParams(searchString);
  
  const getCleanString = (key: string) => Belt.pipe(
    Belt.O.fromNullable(urlParams.get(key)),
    Belt.O.map((s) => s.trim()),
    Belt.O.filter((s) => s.length > 0)
  );

  const getValidatedInteger = (key: string, min: number, max: number, defaultValue: number): number => Belt.pipe(
    getCleanString(key),
    Belt.O.map((v) => parseInt(v, 10)),
    Belt.O.filter((n) => !Number.isNaN(n) && n >= min && n <= max),
    Belt.O.getWithDefault(defaultValue)
  );

  const rawParams: Partial<QueryParams> = {
    page: getValidatedInteger('page', 1, MAX_PAGE, DEFAULT_PAGE),
    limit: getValidatedInteger('limit', MIN_LIMIT, MAX_LIMIT, DEFAULT_LIMIT)
  };

  Belt.pipe(getCleanString('sort'), Belt.O.tap((sort) => {
    if (sortOptions.includes(sort as SortOption)) {
      rawParams.sort = sort as SortOption;
    }
  }));

  Belt.pipe(getCleanString('order'), Belt.O.tap((order) => {
    if (orderOptions.includes(order as OrderOption)) {
      rawParams.order = order as OrderOption;
    }
  }));

  Belt.pipe(getCleanString('search'), Belt.O.tap((search) => (rawParams.search = search)));
  Belt.pipe(getCleanString('genre'), Belt.O.tap((genre) => (rawParams.genre = genre)));
  Belt.pipe(getCleanString('artist'), Belt.O.tap((artist) => (rawParams.artist = artist)));

  const validationResult = QueryParamsSchema.safeParse(rawParams);
  
  return {
    params: validationResult.success ? validationResult.data : { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
    isValid: validationResult.success
  };
}

export function mergeSearchParams(
  currentParams: QueryParams,
  newParams: Partial<QueryParams>
): URLSearchParams {
  const merged = { ...currentParams, ...newParams };

  if (merged.page !== undefined) {
    merged.page = Math.min(Math.max(merged.page, 1), MAX_PAGE);
  }
  if (merged.limit !== undefined) {
    merged.limit = Math.min(Math.max(merged.limit, MIN_LIMIT), MAX_LIMIT);
  }
  
  return buildSearchParams(merged);
}