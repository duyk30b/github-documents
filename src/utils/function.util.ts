export class ESFunction {
  static sleep = async (time: number) => {
    return await new Promise((resolve) =>
      setTimeout(() => {
        resolve(time)
      }, time),
    )
  }

  static runTimeout = <T>(promise: Promise<T>, timeout: number): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${timeout}ms`)), timeout),
    )
    return Promise.race([promise, timeoutPromise])
  }

  static debounceAsync = <T>(func: (...args: any[]) => Promise<T>, delay: number) => {
    let state = 0

    return async (...args: any[]): Promise<T | null> => {
      state++
      const current = state
      await ESFunction.sleep(delay)
      if (current !== state) return null // Hiểu đơn giản là sau khi ngủ dậy thì thấy thằng khác cướp mất state rồi
      return await func(...args)
    }
  }
}
