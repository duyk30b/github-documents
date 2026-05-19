import { LocalStorageKeys } from '../config'
import { decodeBase64Utf8, encodeBase64Utf8 } from '../utils/base64'
import { ESString } from '../utils/string.util'

export const FOLDER_ROOT = 'content'
export const CATEGORIES_MENU_NAME = '_categories.json'
export const POSTS_MENU_NAME = '_posts.json'

interface GitHubEntry {
  name: string
  path: string
  type: 'file' | 'dir'
  sha: string
  download_url: string | null
}

interface GitHubFileResponse {
  path: string
  name: string
  sha: string
  content: string
  encoding: 'base64'
}

interface GitHubWriteResponse {
  commit: {
    author: object
    committer: object
    message: string
  }
  content: {
    name: string
    path: string
    sha: string
    size: number
    url: string
    type: 'file' | 'dir'
  }
}

interface GitTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
}

function toArray<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input]
}

export class GithubApiCore {
  private owner: string
  private repo: string
  private branch: string
  private token: string = ''

  constructor(data: { owner: string; repo: string; branch: string }) {
    this.owner = data.owner
    this.repo = data.repo
    this.branch = data.branch
  }

  getToken() {
    return this.token
  }

  setToken(token: string) {
    this.token = token
  }

  private async request(path: string, init?: RequestInit) {
    const token = this.getToken()
    const headers = new Headers(init?.headers)
    headers.set('Accept', 'application/vnd.github+json')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers,
    })
    if (response.status === 204) {
      return null
    }
    const responseText = await response.text()
    if (!responseText) {
      throw new Error(`GitHub API error ${response.status}: Empty response`)
    }
    const responseJson = JSON.parse(responseText)
    if (!response.ok) {
      throw new Error(responseJson?.message || '')
    }
    return responseJson
  }

  private isNotFoundError(error: unknown) {
    return error instanceof Error && error.message.includes('GitHub API error 404:')
  }

  async getCurrentUser() {
    const data = await this.request('/user')
    return data as { login: string }
  }

  async getFile(input: { path: string; params?: Record<string, string>; cache?: RequestCache }) {
    const { path, params, cache } = input
    const query = params ? `&${new URLSearchParams(params).toString()}` : ''
    const result: GitHubFileResponse = await this.request(
      `${ESString.joinPath('repos', this.owner, this.repo, 'contents', path)}?ref=${this.branch}${query}`,
      { cache },
    )

    const normalized = result.content.replace(/\n/g, '')
    return {
      content: decodeBase64Utf8(normalized),
      sha: result.sha,
    }
  }

  async fileExists(path: string) {
    try {
      await this.getFile({ path })
      return true
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null
      }
      throw error
    }
  }

  async listDirectory(path: string) {
    const result = await this.request(
      `${ESString.joinPath('repos', this.owner, this.repo, 'contents', path)}?ref=${this.branch}`,
    )

    const data: GitHubEntry[] = toArray(result)
    return data
  }

  async createFile(input: { path: string; content: string; message: string }) {
    const { path, content, message } = input
    const data: GitHubWriteResponse = await this.request(
      ESString.joinPath('repos', this.owner, this.repo, 'contents', path),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          content: encodeBase64Utf8(content),
          branch: this.branch,
        }),
      },
    )

    return data
  }

  async updateFile(input: { path: string; content: string; message: string; sha: string }) {
    const { path, content, message, sha } = input
    const data: GitHubWriteResponse = await this.request(
      ESString.joinPath('repos', this.owner, this.repo, 'contents', path),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          content: encodeBase64Utf8(content),
          branch: this.branch,
          sha,
        }),
      },
    )
    return data
  }

  async moveFile(input: { fromPath: string; toPath: string; message: string }) {
    const { fromPath, toPath, message } = input
    const normalizedFrom = fromPath.replace(/^\/+|\/+$/g, '')
    const normalizedTo = toPath.replace(/^\/+|\/+$/g, '')

    if (normalizedFrom === normalizedTo) {
      return {
        oldPath: normalizedFrom,
        newPath: normalizedTo,
      }
    }

    let sourceFile: { content: string; sha: string }
    try {
      sourceFile = await this.getFile({ path: normalizedFrom })
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new Error(`File not found: ${normalizedFrom}`)
      }
      throw error
    }

    try {
      await this.getFile({ path: normalizedTo })
      throw new Error(`Destination already exists: ${normalizedTo}`)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Destination already exists:')) {
        throw error
      }
      if (!this.isNotFoundError(error)) {
        throw error
      }
    }

    await this.createFile({
      path: normalizedTo,
      content: sourceFile.content,
      message: `${message}: create ${normalizedTo}`,
    })

    await this.deleteFile({
      path: normalizedFrom,
      sha: sourceFile.sha,
      message: `${message}: delete ${normalizedFrom}`,
    })

    return {
      oldPath: normalizedFrom,
      newPath: normalizedTo,
    }
  }

  async deleteFile(input: { path: string; sha: string; message: string }) {
    const { path, sha, message } = input
    const data = await this.request(ESString.joinPath('repos', this.owner, this.repo, 'contents', path), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sha,
        branch: this.branch,
      }),
    })
    return data
  }

  async deleteFolder(input: { path: string; message: string }) {
    const { path, message } = input
    const folderPathList = [path]
    const files: Array<{ path: string; sha: string }> = []

    while (folderPathList.length > 0) {
      const current = folderPathList.shift()
      if (!current) {
        break
      }

      const entries = await this.listDirectory(current)
      entries.forEach((entry) => {
        if (entry.type === 'dir') {
          folderPathList.push(entry.path)
        }
        if (entry.type === 'file') {
          files.push({ path: entry.path, sha: entry.sha })
        }
      })
    }

    for (const file of files.reverse()) {
      await this.deleteFile({
        path: file.path,
        sha: file.sha,
        message: `${message}: ${file.path}`,
      })
    }
  }

  // =========== GIT TREE API ===========
  private async getBranchHeadSha() {
    const data = await this.request(`/repos/${this.owner}/${this.repo}/git/ref/heads/${this.branch}?time=${Date.now()}`)
    return data.object.sha as string
  }

  private async getRecursiveTree(commitSha: string) {
    const commit = await this.request(`/repos/${this.owner}/${this.repo}/git/commits/${commitSha}?time=${Date.now()}`)
    const treeSha: string = commit.tree.sha
    const tree = await this.request(
      `/repos/${this.owner}/${this.repo}/git/trees/${treeSha}?recursive=1&time=${Date.now()}`,
    )

    return {
      treeSha,
      items: tree.tree as GitTreeItem[],
    }
  }

  private async createGitTree(
    baseTree: string,
    tree: Array<{
      path: string
      mode: string
      type: 'blob' | 'tree'
      sha: string | null
    }>,
  ) {
    const data = await this.request(`/repos/${this.owner}/${this.repo}/git/trees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_tree: baseTree,
        tree,
      }),
    })

    return data.sha as string
  }

  private async createGitCommit(message: string, treeSha: string, parentCommitSha: string) {
    const data = await this.request(`/repos/${this.owner}/${this.repo}/git/commits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentCommitSha],
      }),
    })

    return data.sha as string
  }

  private async updateBranchHead(commitSha: string) {
    await this.request(`/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: commitSha }),
    })
  }

  // ========== PROFESSIONAL TREE OPERATIONS ==========
  async moveFileTree(input: { fromPath: string; toPath: string; message: string }) {
    const { fromPath, toPath, message } = input
    const normalizedFrom = fromPath.replace(/^\/+|\/+$/g, '')
    const normalizedTo = toPath.replace(/^\/+|\/+$/g, '')

    if (normalizedFrom === normalizedTo) {
      return {
        oldPath: normalizedFrom,
        newPath: normalizedTo,
      }
    }

    const headSha = await this.getBranchHeadSha()
    const { treeSha, items } = await this.getRecursiveTree(headSha)

    const file = items.find((item) => item.path === normalizedFrom)

    if (!file) {
      throw new Error(`File not found: ${normalizedFrom}`)
    }
    if (file.type !== 'blob') {
      throw new Error(`Path is not a file: ${normalizedFrom}`)
    }

    const destination = items.find((item) => item.path === normalizedTo)
    if (destination) {
      throw new Error(`Destination already exists: ${normalizedTo}`)
    }

    const treeChanges: Array<{
      path: string
      mode: string
      type: 'blob' | 'tree'
      sha: string | null
    }> = [
      // DELETE OLD FILE
      {
        path: file.path,
        mode: file.mode,
        type: file.type,
        sha: null,
      },
      // CREATE NEW FILE
      {
        path: normalizedTo,
        mode: file.mode,
        type: file.type,
        sha: file.sha,
      },
    ]

    const newTreeSha = await this.createGitTree(treeSha, treeChanges)
    const newCommitSha = await this.createGitCommit(message, newTreeSha, headSha)

    await this.updateBranchHead(newCommitSha)

    return {
      oldPath: normalizedFrom,
      newPath: normalizedTo,
      sha: file.sha,
    }
  }

  async moveFolderTree(input: { fromPath: string; toPath: string; message: string }) {
    const { fromPath, toPath, message } = input

    const normalizedFrom = fromPath.replace(/^\/+|\/+$/g, '')
    const normalizedTo = toPath.replace(/^\/+|\/+$/g, '')

    if (!normalizedFrom || !normalizedTo) {
      throw new Error('Root folder move is not supported')
    }

    if (normalizedTo.startsWith(`${normalizedFrom}/`)) {
      throw new Error(`Cannot move folder into itself: ${normalizedFrom} -> ${normalizedTo}`)
    }

    if (normalizedFrom === normalizedTo) {
      return {
        oldPath: normalizedFrom,
        newPath: normalizedTo,
        movedCount: 0,
      }
    }

    const headSha = await this.getBranchHeadSha()
    const { treeSha, items } = await this.getRecursiveTree(headSha)

    const targetItems = items.filter((item) => item.path.startsWith(`${normalizedFrom}/`))

    if (targetItems.length === 0) {
      throw new Error(`Folder not found: ${normalizedFrom}`)
    }

    const treeChanges: Array<{
      path: string
      mode: string
      type: 'blob' | 'tree'
      sha: string | null
    }> = []

    for (const item of targetItems) {
      treeChanges.push({
        path: item.path,
        mode: item.mode,
        type: item.type,
        sha: null, // DELETE OLD PATH
      })
      const relativePath = item.path.slice(normalizedFrom.length + 1)
      const newPath = `${normalizedTo}/${relativePath}`
      treeChanges.push({
        path: newPath,
        mode: item.mode,
        type: item.type,
        sha: item.sha, // CREATE NEW PATH
      })
    }

    const newTreeSha = await this.createGitTree(treeSha, treeChanges)
    const newCommitSha = await this.createGitCommit(message, newTreeSha, headSha)

    await this.updateBranchHead(newCommitSha)

    return {
      oldPath: normalizedFrom,
      newPath: normalizedTo,
      movedCount: targetItems.length,
    }
  }

  async deleteFolderTree(input: { path: string; message: string }) {
    const { path, message } = input
    const normalizedPath = path.replace(/^\/+|\/+$/g, '')
    if (!normalizedPath) {
      throw new Error('Refusing to delete repository root, normalizedPath is empty')
    }

    const headSha = await this.getBranchHeadSha()
    const { treeSha, items } = await this.getRecursiveTree(headSha)

    const deletions = items
      .filter((item) => {
        return item.path.startsWith(`${normalizedPath}/`)
      })
      .map((item) => ({
        path: item.path,
        mode: item.mode,
        type: item.type,
        sha: null,
      }))

    if (deletions.length === 0) {
      return { deletedCount: 0 }
    }

    const newTreeSha = await this.createGitTree(treeSha, deletions)
    const newCommitSha = await this.createGitCommit(message, newTreeSha, headSha)

    await this.updateBranchHead(newCommitSha)

    return {
      deletedCount: deletions.length,
    }
  }
}

export const GithubApi = new GithubApiCore({
  owner: 'duyk30b',
  repo: 'github-documents',
  branch: 'master',
})
