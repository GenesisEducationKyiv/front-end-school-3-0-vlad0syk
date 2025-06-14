import { useLocation } from 'react-router-dom';
import * as Belt from '@mobily/ts-belt';
import { QueryParams, QueryParamsSchema } from '../types';

export const MAX_PAGE = 100;
export const MAX_LIMIT = 100;
export const MIN_LIMIT = 1;
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

export type SortOption = 'title' | 'artist' | 'album' | 'createdAt';
export type OrderOption = 'asc' | 'desc';

export const sortOptions: readonly SortOption[] = ['title', 'artist', 'album', 'createdAt'] as const;
export const orderOptions: readonly OrderOption[] = ['asc', 'desc'] as const;


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

  const getValidatedInteger = (key: string, min: number, max: number, defaultValue: number): number => Belt.pipe(
    getCleanString(key),
    Belt.O.map((v) => parseInt(v, 10)),
    Belt.O.filter((n) => !Number.isNaN(n) && n >= min && n <= max),
    Belt.O.getWithDefault(defaultValue)
  );

  const rawParams: Partial<QueryParams> = {};

  rawParams.page = getValidatedInteger('page', 1, MAX_PAGE, DEFAULT_PAGE);
  rawParams.limit = getValidatedInteger('limit', MIN_LIMIT, MAX_LIMIT, DEFAULT_LIMIT);

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
  const params = isValid ? validationResult.data : { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT };

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