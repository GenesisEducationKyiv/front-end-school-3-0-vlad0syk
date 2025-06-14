import { useLocation } from 'react-router-dom';
import * as Belt from '@mobily/ts-belt';
import { QueryParams, QueryParamsSchema } from '../types';

type SortOption = 'title' | 'artist' | 'album' | 'createdAt';
type OrderOption = 'asc' | 'desc';

const sortOptions: readonly SortOption[] = ['title', 'artist', 'album', 'createdAt'] as const;
const orderOptions: readonly OrderOption[] = ['asc', 'desc'] as const;

const isSortOption = (value: string): value is SortOption => 
  sortOptions.includes(value as SortOption);

const isOrderOption = (value: string): value is OrderOption =>
  orderOptions.includes(value as OrderOption);

export function useValidatedSearchParams(): {
  params: QueryParams;
  paramsUrl: URLSearchParams;
  isValid: boolean;
} {
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);

  const getCleanString = (key: string) => Belt.pipe(
    Belt.O.fromNullable(urlParams.get(key)),
    Belt.O.map((s) => s.trim()),
    Belt.O.filter((s) => s.length > 0)
  );

  const getValidSort = (key: string): Belt.O.Option<SortOption> => Belt.pipe(
    getCleanString(key),
    Belt.O.filter(isSortOption),
  ) as Belt.O.Option<SortOption>;

  const getValidOrder = (key: string): Belt.O.Option<OrderOption> => Belt.pipe(
    getCleanString(key),
    Belt.O.filter(isOrderOption)
  ) as Belt.O.Option<OrderOption>;

  const getPositiveInteger = (key: string): Belt.O.Option<number> => Belt.pipe(
    getCleanString(key),
    Belt.O.map((v) => parseInt(v, 10)),
    Belt.O.filter((n) => !Number.isNaN(n) && n > 0)
  );

  const rawParams: Partial<QueryParams> = {};

  rawParams.page = Belt.O.getWithDefault(getPositiveInteger('page'), 1);

  rawParams.limit = Belt.O.getWithDefault(getPositiveInteger('limit'), 10);

  Belt.pipe(
    getValidSort('sort'),
    Belt.O.tap((sort) => (rawParams.sort = sort))
  );

  Belt.pipe(
    getValidOrder('order'),
    Belt.O.tap((order) => (rawParams.order = order))
  );

  Belt.pipe(
    getCleanString('search'),
    Belt.O.tap((search) => (rawParams.search = search))
  );

  Belt.pipe(
    getCleanString('genre'),
    Belt.O.tap((genre) => (rawParams.genre = genre))
  );

  Belt.pipe(
    getCleanString('artist'),
    Belt.O.tap((artist) => (rawParams.artist = artist))
  );

  const validationResult = QueryParamsSchema.safeParse(rawParams);
  const isValid = validationResult.success;
  const params = isValid ? validationResult.data : { page: 1, limit: 10 };

  const cleanUrl = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanUrl.append(key, String(value));
    }
  });

  return {
    params,
    paramsUrl: cleanUrl,
    isValid
  };
}

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

  const getPositiveInteger = (key: string) => Belt.pipe(
    getCleanString(key),
    Belt.O.map((v) => parseInt(v, 10)),
    Belt.O.filter((n) => !Number.isNaN(n) && n > 0)
  );

  const rawParams: Partial<QueryParams> = {
    page: Belt.O.getWithDefault(getPositiveInteger('page'), 1),
    limit: Belt.O.getWithDefault(getPositiveInteger('limit'), 10)
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
    params: validationResult.success ? validationResult.data : { page: 1, limit: 10 },
    isValid: validationResult.success
  };
}

export function mergeSearchParams(
  currentParams: QueryParams,
  newParams: Partial<QueryParams>
): URLSearchParams {
  const merged = { ...currentParams, ...newParams };
  return buildSearchParams(merged);
}