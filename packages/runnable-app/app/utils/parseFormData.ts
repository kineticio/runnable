import set from 'lodash.set';
import get from 'lodash.get';

/**
 * Convert `.` paths to nested objects and [] paths to arrays.
 */
export function parseFormData<T>(data: FormData): T {
  const result: any = {};
  for (const [key, value] of data.entries()) {
    const currentValue = get(result, key);
    if (currentValue != null) {
      if (Array.isArray(currentValue)) {
        set(result, key, [...currentValue, value]);
      } else {
        set(result, key, [currentValue, value]);
      }
    } else {
      set(result, key, value);
    }
  }
  return result;
}
