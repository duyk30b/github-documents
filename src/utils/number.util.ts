export class ESNumber {
  static format = (options: {
    number: number
    round?: number | null | undefined // nếu không cài đặt thì sẽ không làm tròn
    fixed?: number | null | undefined // nếu cài đặt fix thì phải cài đặt lớn hơn hoặc bằng round
    part?: number
    sec?: string
    dec?: string
  }) => {
    const number = options.number ?? 0
    const part = options.part ?? 3
    const sec = options.sec ?? ','
    const dec = options.dec ?? '.'

    let numberRound = number
    if (options.round === null || options.round === undefined) {
      numberRound = number
    } else {
      const round = options.round ?? 0
      const power = Math.pow(10, Math.abs(round)) // nhân chia với 10, 100, (nhân chia với số 0.1, 0.2 sẽ phát sinh lỗi)
      if (round >= 0) {
        numberRound = Math.round(number * power) / power
      } else if (round < 0) {
        numberRound = Math.round(number / power) * power
      }
    }

    let numberStr = ''
    if (options.fixed === null || options.fixed === undefined) {
      numberStr = numberRound.toString()
    } else if (options.fixed >= 0) {
      numberStr = numberRound.toFixed(options.fixed)
    } else {
      numberStr = numberRound.toString()
    }

    // Tách phần nguyên và phần thập phân
    const [intPart, decimalPart] = numberStr.split('.')
    const pattern = `\\B(?=(\\d{${part}})+(?!\\d))`
    const intWithSeparator = intPart.replace(new RegExp(pattern, 'g'), sec)
    
    return decimalPart ? `${intWithSeparator}${dec}${decimalPart}` : intWithSeparator
  }
}
