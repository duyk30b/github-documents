import { ESString } from '../utils'

export type CategoryMenuRaw = {
  title: string
  folderName: string
  order: number
  categoryList: CategoryMenuRaw[]
}

export class CategoryMenu {
  title: string
  folderName: string
  order: number
  folderPath: string
  parentPath: string
  level: number
  categoryList: CategoryMenu[]

  static fromRaw(raw: CategoryMenuRaw, parentPath: string, level: number) {
    const category = CategoryMenu.init()
    category.title = raw.title
    category.folderName = raw.folderName
    category.order = raw.order
    category.parentPath = parentPath
    category.folderPath = ESString.joinPath(parentPath, raw.folderName)
    category.level = level
    category.categoryList = (raw.categoryList ?? []).map((childRaw) => {
      return CategoryMenu.fromRaw(childRaw, category.folderPath, level + 1)
    })
    return category
  }

  static init(p?: CategoryMenu) {
    const ins = new CategoryMenu()
    ins.title = p?.title ?? ''
    ins.folderName = p?.folderName ?? ''
    ins.folderPath = p?.folderPath ?? ''
    ins.parentPath = p?.parentPath ?? ''
    ins.level = p?.level ?? 0
    ins.order = p?.order ?? 1
    ins.categoryList = p?.categoryList ?? []
    return ins
  }

  static blank() {
    const ins = CategoryMenu.init()
    return ins
  }

  static basic(source: CategoryMenu) {
    const cleaned = Object.fromEntries(Object.entries(source ?? {}).filter(([, v]) => v !== undefined))
    return Object.assign(new CategoryMenu(), cleaned)
  }

  static basicList(sources: CategoryMenu[]): CategoryMenu[] {
    return sources.map((i) => CategoryMenu.basic(i))
  }

  static from(source: CategoryMenu) {
    const target = CategoryMenu.basic(source)
    return target
  }

  static fromList(sourceList: CategoryMenu[]): CategoryMenu[] {
    return sourceList.map((i) => CategoryMenu.from(i))
  }
}
