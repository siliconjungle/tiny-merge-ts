export const DEBOUNCE_RATE = 1000

export type DebounceFn = (...args: any[]) => void

export const debounce = (func: DebounceFn, timeout = DEBOUNCE_RATE): DebounceFn => {
  let timer: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}
