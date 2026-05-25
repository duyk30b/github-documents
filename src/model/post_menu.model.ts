import { ESString } from '../utils'

export type PostMenuRaw = {
  title: string
  fileName: string
  order: number
  publishedAt: string
}

export class PostMenu {
  title: string
  fileName: string
  order: number
  publishedAt: string
  filePath: string
  parentPath: string

  static fromRaw(raw: PostMenuRaw, parentPath: string) {
    const postMenu = PostMenu.init()
    postMenu.title = raw.title
    postMenu.fileName = raw.fileName
    postMenu.order = raw.order
    postMenu.publishedAt = raw.publishedAt
    postMenu.filePath = ESString.joinPath(parentPath, raw.fileName)
    postMenu.parentPath = parentPath
    return postMenu
  }

  static fromRawList(rawList: PostMenuRaw[], parentPath: string) {
    return rawList.map((raw) => PostMenu.fromRaw(raw, parentPath))
  }

  static init(s?: PostMenu) {
    const ins = new PostMenu()
    ins.title = s?.title || ''
    ins.fileName = s?.fileName || ''
    ins.order = s?.order || 1
    ins.publishedAt = s?.publishedAt || ''
    ins.filePath = s?.filePath || ''
    ins.parentPath = s?.parentPath || ''
    return ins
  }

  static blank() {
    const ins = PostMenu.init()
    return ins
  }

  static basic(source: PostMenu) {
    const cleaned = Object.fromEntries(Object.entries(source ?? {}).filter(([, v]) => v !== undefined))
    return Object.assign(new PostMenu(), cleaned)
  }

  static basicList(sources: PostMenu[]): PostMenu[] {
    return sources.map((i) => PostMenu.basic(i))
  }

  static from(source: PostMenu) {
    const target = PostMenu.basic(source)
    return target
  }

  static fromList(sourceList: PostMenu[]): PostMenu[] {
    return sourceList.map((i) => PostMenu.from(i))
  }
}
