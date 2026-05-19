import { defineStore } from 'pinia'
import { FOLDER_ROOT, GithubApi, POSTS_MENU_NAME } from '../core/github.api'
import { MarkdownRenderer } from '../core/markdown.core'
import { PostContent } from '../model/post_content.model'
import { PostMenu, type PostMenuRaw } from '../model/post_menu.model'
import { ESString } from '../utils/string.util'

export const usePostStore = defineStore('post_store', {
  state: (): {
    folderDataMap: Record<
      string,
      | {
          postMenuList?: PostMenu[]
          postContentMap?: Record<string, PostContent> // key is fileName
        }
      | undefined
    >
  } => ({
    folderDataMap: {},
  }),
  actions: {
    async fetchPostMenuByFolderPath(folderPath: string, config?: { cache?: RequestCache }) {
      const fetchResponse = await GithubApi.getFile({
        path: ESString.joinPath(FOLDER_ROOT, folderPath, POSTS_MENU_NAME),
        cache: config?.cache,
      })
      const postMenuRawList: PostMenuRaw[] = JSON.parse(fetchResponse.content)
      return { postMenuRawList, postMenuSha: fetchResponse.sha }
    },

    async getPostMenuListByFolderPath(folderPath: string, config?: { refetch?: boolean; cache?: RequestCache }) {
      this.folderDataMap[folderPath] ||= {}
      this.folderDataMap[folderPath]!.postContentMap ||= {}

      if (config?.refetch || !this.folderDataMap[folderPath]?.postMenuList) {
        const { postMenuRawList, postMenuSha } = await this.fetchPostMenuByFolderPath(folderPath, {
          cache: config?.cache,
        })
        this.folderDataMap[folderPath] = {
          postMenuList: PostMenu.fromRawList(postMenuRawList, folderPath),
          postContentMap: {},
        }
      }
      return PostMenu.fromList(this.folderDataMap[folderPath].postMenuList || [])
    },

    async getPostContentByFilePath(filePath: string, config?: { refetch?: boolean; cache?: RequestCache }) {
      const segmentList = filePath.split('/')
      const fileName = segmentList.pop() || ''
      const parentPath = segmentList.join('/')

      this.folderDataMap[parentPath] ||= {}
      this.folderDataMap[parentPath]!.postContentMap ||= {}

      if (config?.refetch || !this.folderDataMap[parentPath]?.postContentMap?.[fileName]) {
        const postContentFetchRes = await GithubApi.getFile({
          path: ESString.joinPath(FOLDER_ROOT, filePath),
          cache: config?.cache,
        })

        const { metadata, body } = MarkdownRenderer.extractMetadata(postContentFetchRes.content)

        const postContent = PostContent.init({
          body,
          metadata: {
            title: metadata.title || '',
            publishedAt: Number(metadata.publishedAt) || 0,
            order: Number(metadata.order) || 0,
          },
          postInfo: {
            fileName,
            parentPath,
            filePath,
            sha: postContentFetchRes.sha,
          },
        })

        this.folderDataMap[parentPath]!.postContentMap![fileName] = postContent
      }
      return this.folderDataMap[parentPath]!.postContentMap![fileName]
    },

    async createPostContent(postContent: PostContent) {
      const { parentPath, fileName, filePath } = postContent.postInfo
      const { postMenuRawList, postMenuSha } = await this.fetchPostMenuByFolderPath(parentPath, { cache: 'reload' })

      if (postMenuRawList!.some((raw) => raw.fileName === fileName)) {
        throw new Error(`File path "${filePath}" already exists`)
      }

      postMenuRawList.push({
        title: postContent.metadata.title,
        fileName,
        order: postContent.metadata.order,
        publishedAt: postContent.metadata.publishedAt,
      })
      postMenuRawList.sort((a, b) => a.order - b.order)

      const content = MarkdownRenderer.addMetadata({
        body: postContent.body,
        metadata: {
          title: postContent.metadata.title,
          publishedAt: postContent.metadata.publishedAt,
          order: postContent.metadata.order,
        },
      })

      const postContentFileRes = await GithubApi.createFile({
        path: ESString.joinPath(FOLDER_ROOT, parentPath, fileName),
        content,
        message: `Create post ${postContent.metadata.title} for category ${parentPath}`,
      })

      const postMenuFileUpdateRes = await GithubApi.updateFile({
        path: ESString.joinPath(FOLDER_ROOT, parentPath, POSTS_MENU_NAME),
        content: JSON.stringify(postMenuRawList, null, 2),
        message: `Update post_menu for create post ${postContent.metadata.title} in category ${parentPath}`,
        sha: postMenuSha,
      })

      this.folderDataMap[parentPath] = {} // clear cache to refetch latest data when needed
    },

    async updatePostContent(postContentOrigin: PostContent, postContentUpdate: PostContent) {
      if (postContentOrigin.postInfo.filePath !== postContentUpdate.postInfo.filePath) {
        throw new Error('File path cannot be changed for update, please use delete and create instead')
      }

      const { parentPath, fileName, filePath } = postContentUpdate.postInfo

      const { postMenuRawList, postMenuSha } = await this.fetchPostMenuByFolderPath(parentPath, { cache: 'reload' })
      const findIndex = postMenuRawList.findIndex((p) => p.fileName === fileName)
      if (findIndex === -1) {
        throw new Error(`Post "${fileName}" not found for update`)
      }
      postMenuRawList[findIndex].title = postContentUpdate.metadata.title
      postMenuRawList[findIndex].order = postContentUpdate.metadata.order
      postMenuRawList[findIndex].publishedAt = postContentUpdate.metadata.publishedAt
      postMenuRawList.sort((a, b) => a.order - b.order)

      const content = MarkdownRenderer.addMetadata({
        body: postContentUpdate.body,
        metadata: {
          title: postContentUpdate.metadata.title,
          publishedAt: postContentUpdate.metadata.publishedAt,
          order: postContentUpdate.metadata.order,
        },
      })

      const postContentFileRes = await GithubApi.updateFile({
        path: ESString.joinPath(FOLDER_ROOT, filePath),
        content,
        message: `Update post ${postContentUpdate.metadata.title} for category ${parentPath}`,
        sha: postContentUpdate.postInfo.sha,
      })

      const postMenuFileUpdateRes = await GithubApi.updateFile({
        path: ESString.joinPath(FOLDER_ROOT, parentPath, POSTS_MENU_NAME),
        content: JSON.stringify(postMenuRawList, null, 2),
        message: `Update post_menu for update post ${postContentUpdate.postInfo.filePath}`,
        sha: postMenuSha,
      })

      this.folderDataMap[parentPath] = {} // clear cache to refetch latest data when needed
    },

    async deletePostContent(postContent: PostContent) {
      const { parentPath, fileName, filePath } = postContent.postInfo
      const { postMenuRawList, postMenuSha } = await this.fetchPostMenuByFolderPath(parentPath, { cache: 'reload' })
      const findIndex = postMenuRawList.findIndex((p) => p.fileName === fileName)
      if (findIndex === -1) {
        throw new Error(`Post "${filePath}" not found for delete`)
      }
      postMenuRawList.splice(findIndex, 1)

      await GithubApi.deleteFile({
        path: ESString.joinPath(FOLDER_ROOT, filePath),
        message: `Delete post ${postContent.postInfo.filePath}`,
        sha: postContent.postInfo.sha,
      })

      const postMenuFileUpdateRes = await GithubApi.updateFile({
        path: ESString.joinPath(FOLDER_ROOT, parentPath, POSTS_MENU_NAME),
        content: JSON.stringify(postMenuRawList, null, 2),
        message: `Update post_menu for delete post ${postContent.postInfo.filePath}`,
        sha: postMenuSha,
      })

      this.folderDataMap[parentPath] = {} // clear cache to refetch latest data when needed
    },
  },
})
