import { defineStore } from 'pinia'
import { CATEGORIES_MENU_NAME, FOLDER_ROOT, GithubApi, POSTS_MENU_NAME } from '../core/github.api'
import { CategoryMenu, type CategoryMenuRaw } from '../model/category_menu.model'
import { ESString } from '../utils/string.util'

export const useCategoryStore = defineStore('category_store', {
  state: (): { categoryMenuTree: CategoryMenu[] } => ({
    categoryMenuTree: [],
  }),
  actions: {
    async fetchCategoryMenuTreeRaw(config?: { cache?: RequestCache }) {
      const response = await GithubApi.getFile({
        path: ESString.joinPath(FOLDER_ROOT, CATEGORIES_MENU_NAME),
        cache: config?.cache,
      })
      const categoryMenuRawList: CategoryMenuRaw[] = JSON.parse(response.content)
      return { categoryMenuRawList, sha: response.sha }
    },

    async loadCategoryMenuTree(config?: { cache?: RequestCache }) {
      const { categoryMenuRawList, sha } = await this.fetchCategoryMenuTreeRaw({ cache: config?.cache })
      this.categoryMenuTree = categoryMenuRawList.map((raw) => {
        return CategoryMenu.fromRaw(raw, '', 1)
      })
    },

    getCategoryMenuByFolderPath(folderPath: string) {
      let categoryMenu: CategoryMenu | undefined = CategoryMenu.blank()
      let categoryMenuTreeCurrent: CategoryMenu[] = this.categoryMenuTree
      categoryMenu.title = 'Root'
      categoryMenu.categoryList = categoryMenuTreeCurrent

      const segmentList = folderPath.split('/').filter(Boolean)
      segmentList.forEach((segment, index) => {
        categoryMenu = categoryMenuTreeCurrent.find((cat) => {
          return cat.folderName === segment
        })
        if (!categoryMenu) {
          throw new Error(`CategoryMenu "${folderPath}" not found`)
        }
        categoryMenuTreeCurrent = categoryMenu.categoryList
      })

      return CategoryMenu.from(categoryMenu!)
    },

    getCategoryMenuListByFolderPath(folderPath: string) {
      const categoryMenuListResult: CategoryMenu[] = []
      let categoryMenuTreeCurrent: CategoryMenu[] = this.categoryMenuTree

      const segmentList = folderPath.split('/').filter(Boolean)
      segmentList.forEach((segment, index) => {
        const categoryCurrent = categoryMenuTreeCurrent.find((cat) => {
          return cat.folderName === segment
        })
        if (!categoryCurrent) {
          throw new Error(`CategoryMenu "${folderPath}" not found`)
        }
        categoryMenuListResult.push(CategoryMenu.from(categoryCurrent))
        categoryMenuTreeCurrent = categoryCurrent.categoryList
      })

      return categoryMenuListResult
    },

    async createCategoryMenu(categoryInput: CategoryMenu) {
      const { title, folderName, order, parentPath, folderPath, level } = categoryInput

      const catMenuFetchResponse = await this.fetchCategoryMenuTreeRaw({ cache: 'reload' })
      const segmentList = parentPath.split('/').filter(Boolean)
      let categoryRawList = catMenuFetchResponse.categoryMenuRawList
      segmentList.forEach((segment) => {
        const categoryRawParent = categoryRawList.find((cat) => cat.folderName === segment)
        if (!categoryRawParent) {
          throw new Error(`CategoryMenuParent "${parentPath}" not found`)
        }
        categoryRawList = categoryRawParent.categoryList
      })

      categoryRawList.push({ title, folderName, order, categoryList: [] })
      categoryRawList.sort((a, b) => a.order - b.order)

      const postMenuRes = await GithubApi.createFile({
        path: ESString.joinPath(FOLDER_ROOT, folderPath, POSTS_MENU_NAME),
        content: JSON.stringify([]),
        message: `Create "posts.json" for category "${title}"`,
      })
      const categoryMenuRes = await GithubApi.updateFile({
        path: ESString.joinPath(FOLDER_ROOT, CATEGORIES_MENU_NAME),
        content: JSON.stringify(catMenuFetchResponse.categoryMenuRawList, null, 2),
        message: `Update "categories.json" for create category "${title}"`,
        sha: catMenuFetchResponse.sha,
      })
    },

    async updateCategoryMenu(categoryFrom: CategoryMenu, categoryTo: CategoryMenu) {
      if (categoryFrom.folderPath !== categoryTo.folderPath) {
        throw new Error('Cannot update category with different folder path')
      }
      const { title, folderName, order, parentPath, folderPath } = categoryTo

      const catMenuFetchResponse = await this.fetchCategoryMenuTreeRaw({ cache: 'reload' })
      const segmentList = parentPath.split('/').filter(Boolean)
      let categoryRawListCurrent = catMenuFetchResponse.categoryMenuRawList
      segmentList.forEach((segment) => {
        const categoryRawParent = categoryRawListCurrent.find((cat) => cat.folderName === segment)
        if (!categoryRawParent) {
          throw new Error(`CategoryMenuParent "${parentPath}" not found`)
        }
        categoryRawListCurrent = categoryRawParent.categoryList
      })
      const findIndex = categoryRawListCurrent.findIndex((cat) => cat.folderName === folderName)
      if (findIndex === -1) {
        throw new Error(`CategoryMenu "${folderPath}" not found for update`)
      }
      categoryRawListCurrent[findIndex].title = title
      categoryRawListCurrent[findIndex].order = order
      categoryRawListCurrent[findIndex].folderName = folderName
      categoryRawListCurrent.sort((a, b) => a.order - b.order)

      const categoryMenuRes = await GithubApi.updateFile({
        path: ESString.joinPath(FOLDER_ROOT, CATEGORIES_MENU_NAME),
        content: JSON.stringify(catMenuFetchResponse.categoryMenuRawList, null, 2),
        message: `Update "categories.json" for update category "${title}"`,
        sha: catMenuFetchResponse.sha,
      })
    },

    async moveCategoryMenu(categoryOrigin: CategoryMenu, categoryUpdate: CategoryMenu) {
      if (categoryOrigin.folderPath === categoryUpdate.folderPath) {
        throw new Error('Cannot move category to the same folder path')
      }

      const catMenuFetchResponse = await this.fetchCategoryMenuTreeRaw({ cache: 'reload' })

      const segmentListOrigin = categoryOrigin.parentPath.split('/').filter(Boolean)
      let categoryRawListOrigin = catMenuFetchResponse.categoryMenuRawList
      segmentListOrigin.forEach((segment) => {
        const categoryRawParent = categoryRawListOrigin.find((cat) => cat.folderName === segment)
        if (!categoryRawParent) {
          throw new Error(`CategoryMenuParent "${categoryOrigin.parentPath}" not found`)
        }
        categoryRawListOrigin = categoryRawParent.categoryList
      })
      const findIndexRemove = categoryRawListOrigin.findIndex((cat) => cat.folderName === categoryOrigin.folderName)
      if (findIndexRemove === -1) {
        throw new Error(`CategoryMenu "${categoryOrigin.folderPath}" not found for delete`)
      }
      const [categoryRawRemove] = categoryRawListOrigin.splice(findIndexRemove, 1)

      const segmentListUpdate = categoryUpdate.parentPath.split('/').filter(Boolean)
      let categoryRawListUpdate = catMenuFetchResponse.categoryMenuRawList
      segmentListUpdate.forEach((segment) => {
        const categoryRawParent = categoryRawListUpdate.find((cat) => cat.folderName === segment)
        if (!categoryRawParent) {
          throw new Error(`CategoryMenuParent "${categoryUpdate.parentPath}" not found`)
        }
        categoryRawListUpdate = categoryRawParent.categoryList
      })
      categoryRawListUpdate.push({
        title: categoryUpdate.title,
        folderName: categoryUpdate.folderName,
        order: categoryUpdate.order,
        categoryList: categoryRawRemove.categoryList,
      })
      categoryRawListUpdate.sort((a, b) => a.order - b.order)

      const categoryMenuRes = await GithubApi.moveFolderTree({
        fromPath: ESString.joinPath(FOLDER_ROOT, categoryOrigin.folderPath),
        toPath: ESString.joinPath(FOLDER_ROOT, categoryUpdate.folderPath),
        message: `Move category from "${categoryOrigin.folderPath}" to "${categoryUpdate.folderPath}"`,
      })

      const categoryMenuUpdateRes = await GithubApi.updateFile({
        path: ESString.joinPath(FOLDER_ROOT, CATEGORIES_MENU_NAME),
        content: JSON.stringify(catMenuFetchResponse.categoryMenuRawList, null, 2),
        message: `Update "categories.json" for move category from "${categoryOrigin.folderPath}" to "${categoryUpdate.folderPath}"`,
        sha: catMenuFetchResponse.sha,
      })
    },

    async deleteCategoryMenu(categoryInput: CategoryMenu) {
      const { folderPath, title, parentPath, folderName } = categoryInput

      const catMenuFetchResponse = await this.fetchCategoryMenuTreeRaw({ cache: 'reload' })
      const segmentList = parentPath.split('/').filter(Boolean)
      let currentCategoryList = catMenuFetchResponse.categoryMenuRawList
      segmentList.forEach((segment) => {
        const categoryRawParent = currentCategoryList.find((cat) => cat.folderName === segment)
        if (!categoryRawParent) {
          throw new Error(`CategoryMenuParent "${parentPath}" not found`)
        }
        currentCategoryList = categoryRawParent.categoryList
      })
      const findIndex = currentCategoryList.findIndex((cat) => cat.folderName === folderName)
      if (findIndex === -1) {
        throw new Error(`CategoryMenu "${folderPath}" not found for delete`)
      }
      currentCategoryList.splice(findIndex, 1)

      const deleteFolderResponse = await GithubApi.deleteFolderTree({
        message: `Delete category "${title}"`,
        path: ESString.joinPath(FOLDER_ROOT, folderPath),
      })

      const categoryMenuRes = await GithubApi.updateFile({
        path: ESString.joinPath(FOLDER_ROOT, CATEGORIES_MENU_NAME),
        content: JSON.stringify(catMenuFetchResponse.categoryMenuRawList, null, 2),
        message: `Update "categories.json" for delete category "${title}"`,
        sha: catMenuFetchResponse.sha,
      })
    },
  },
})
