import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import YAML from 'yaml'

import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

import { visit } from 'unist-util-visit'
import { ESString } from '../utils/string.util'

export interface TocItem {
  depth: number
  text: string
  id: string
}

function getNodeText(node: any): string {
  if (!node) return ''
  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value || ''
  }

  return (node.children || []).map(getNodeText).join('')
}

function slugifyHeading(text: string) {
  return ESString.convertViToEn(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export class MarkdownRenderer {
  static addMetadata = (input: { body: string; metadata: Record<string, any> }) => {
    const { body, metadata } = input
    const metadataString = YAML.stringify(metadata).trim()
    return `---\n${metadataString}\n---\n\n${body}`
  }

  static extractMetadata(markdown: string) {
    const metaRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
    const match = markdown.match(metaRegex)
    if (!match) {
      return {
        metadata: {},
        body: markdown,
      }
    }
    const yamlText = match[1]
    const metadata = YAML.parse(yamlText) || {}
    const body = markdown.slice(match[0].length)

    return {
      metadata,
      body,
    }
  }

  static async toHtml(body: string) {
    const toc: TocItem[] = []
    const headingCountMap = new Map<string, number>()

    const tocAndHeadingIdPlugin = () => {
      return (tree: any) => {
        visit(tree, 'element', (node: any) => {
          if (!/^h[1-6]$/.test(node.tagName)) return

          const text = getNodeText(node).trim()
          const baseId = slugifyHeading(text)

          if (!text || !baseId) return

          const headingCount = headingCountMap.get(baseId) || 0
          headingCountMap.set(baseId, headingCount + 1)

          const id = headingCount === 0 ? baseId : `${baseId}-${headingCount}`

          node.properties ||= {}
          node.properties.id = id

          toc.push({
            depth: Number(node.tagName.slice(1)),
            text,
            id,
          })
        })
      }
    }

    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(tocAndHeadingIdPlugin)
      .use(rehypeAutolinkHeadings)
      .use(rehypeSanitize, {
        clobberPrefix: '',
      })
      .use(rehypeStringify)
      .process(body)

    return {
      toc,
      html: String(file),
    }
  }
}
