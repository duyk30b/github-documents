export class PostContent {
  body: string
  metadata: {
    title: string
    publishedAt: number
    order: number
  }
  postInfo: {
    fileName: string
    parentPath: string
    filePath: string
    sha: string
  }

  static init(s?: PostContent) {
    const ins = new PostContent()
    ins.body = s?.body || ''
    ins.metadata = {
      title: s?.metadata?.title || '',
      publishedAt: s?.metadata?.publishedAt || 0,
      order: s?.metadata?.order || 0,
    }
    ins.postInfo = {
      fileName: s?.postInfo?.fileName || '',
      parentPath: s?.postInfo?.parentPath || '',
      filePath: s?.postInfo?.filePath || '',
      sha: s?.postInfo?.sha || '',
    }
    return ins
  }

  static blank() {
    const ins = PostContent.init()
    return ins
  }

  static basic(source: PostContent) {
    const cleaned = Object.fromEntries(Object.entries(source ?? {}).filter(([, v]) => v !== undefined))
    const target: PostContent = Object.assign(new PostContent(), cleaned)
    target.metadata = {
      title: source.metadata?.title || '',
      publishedAt: source.metadata?.publishedAt || 0,
      order: source.metadata?.order || 0,
    }
    target.postInfo = {
      fileName: source.postInfo?.fileName || '',
      parentPath: source.postInfo?.parentPath || '',
      filePath: source.postInfo?.filePath || '',
      sha: source.postInfo?.sha || '',
    }
    return target
  }

  static basicList(sources: PostContent[]): PostContent[] {
    return sources.map((i) => PostContent.basic(i))
  }

  static from(source: PostContent) {
    const target = PostContent.basic(source)
    return target
  }

  static fromList(sourceList: PostContent[]): PostContent[] {
    return sourceList.map((i) => PostContent.from(i))
  }
}
