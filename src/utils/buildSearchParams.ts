export function buildSearchParams<T extends Record<string, unknown>>(
  params: Partial<T>
): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' || (typeof value === 'number' && !Number.isNaN(value))) {
        searchParams.append(key, String(value));
      } else if (typeof value === 'boolean') {
        searchParams.append(key, String(value));
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null && item !== '') {
            searchParams.append(key, String(item));
          }
        });
      }
    }
  });
  
  return searchParams;
}

export interface SearchParamsOptions {
  skipEmptyStrings?: boolean;
  skipNull?: boolean;
  skipUndefined?: boolean;
  arrayHandling?: 'join' | 'multiple';
  arrayDelimiter?: string;
}

export function buildSearchParamsWithOptions<T extends Record<string, unknown>>(
  params: Partial<T>,
  options: SearchParamsOptions = {}
): URLSearchParams {
  const {
    skipEmptyStrings = true,
    skipNull = true,
    skipUndefined = true,
    arrayHandling = 'multiple',
    arrayDelimiter = ','
  } = options;

  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (skipUndefined && value === undefined) return;
    if (skipNull && value === null) return;
    if (skipEmptyStrings && value === '') return;

    if (Array.isArray(value)) {
      const validItems = value.filter(item => {
        if (skipUndefined && item === undefined) return false;
        if (skipNull && item === null) return false;
        if (skipEmptyStrings && item === '') return false;
        return true;
      });

      if (validItems.length > 0) {
        if (arrayHandling === 'join') {
          searchParams.append(key, validItems.join(arrayDelimiter));
        } else {
          validItems.forEach(item => {
            searchParams.append(key, String(item));
          });
        }
      }
    } else if (
      typeof value === 'string' || 
      typeof value === 'number' || 
      typeof value === 'boolean'
    ) {
      if (typeof value === 'number' && Number.isNaN(value)) return;
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams;
}