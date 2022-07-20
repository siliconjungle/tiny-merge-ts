const DEBOUNCE_RATE = 1000

export const debounce = (func, timeout = DEBOUNCE_RATE) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}
