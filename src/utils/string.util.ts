const _CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + '!@#$%^&*()_-[]{};\':",./<>?'

export class ESString {
  static randomString = (length = 10, characters = _CHARSET): string => {
    let result = ''
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  static randomId(): string {
    return Date.now().toString(36) + ESString.randomString()
  }

  static encodePath(path: string): string {
    return path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')
  }

  static normalizePath(path: string): string {
    return '/' + path.replace(/^\/+|\/+$/g, '')
  }

  static joinPath(...parts: string[]) {
    return (
      '/' +
      parts
        .filter(Boolean)
        .map((p) => ESString.encodePath(p).replace(/^\/+|\/+$/g, ''))
        .join('/')
    )
  }

  static slugify(input: string): string {
    return input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  static convertViToEn = (root: string): string => {
    return (root || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
  }

  static customFilter = (str = '', filter = '', skip = 2): boolean => {
    str = str || ''
    filter = filter || ''
    const key = ESString.convertViToEn(filter.trim()).replace(/[^a-zA-Z0-9 ]/g, '')
    const stringConvert = ESString.convertViToEn(str.trim()).replace(/[^a-zA-Z0-9 ]/g, '')
    let pattern = ''
    key.split('').forEach((item) => {
      pattern = `${pattern}.{0,${skip}}${item}`
    })
    const regex = new RegExp(pattern, 'i')

    return regex.test(stringConvert)
  }
}
