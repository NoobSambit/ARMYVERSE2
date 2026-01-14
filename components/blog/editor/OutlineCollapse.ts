import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const outlineCollapsePluginKey = new PluginKey('outlineCollapse')

type HeadingInfo = {
  pos: number
  level: number
  collapsed: boolean
}

const buildDecorations = (doc: any) => {
  const headings: HeadingInfo[] = []

  doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'heading') {
      headings.push({
        pos,
        level: node.attrs.level,
        collapsed: Boolean(node.attrs.collapsed),
      })
    }
  })

  if (headings.length === 0) {
    return DecorationSet.empty
  }

  const decorations: Decoration[] = []

  headings.forEach((heading, index) => {
    if (!heading.collapsed) return

    const nextHeading = headings.slice(index + 1).find(h => h.level <= heading.level)
    const currentNode = doc.nodeAt(heading.pos)
    if (!currentNode) return
    const from = heading.pos + currentNode.nodeSize
    const to = nextHeading ? nextHeading.pos : doc.content.size + 1

    if (from >= to) return

    doc.nodesBetween(from, to, (node: any, pos: number) => {
      if (node.type.name === 'heading') {
        return false
      }

      if (node.isBlock) {
        decorations.push(
          Decoration.node(pos, pos + node.nodeSize, {
            style: 'display: none;',
            'data-outline-hidden': 'true',
          })
        )
        return false
      }

      return true
    })
  })

  return DecorationSet.create(doc, decorations)
}

export const OutlineCollapse = Extension.create({
  name: 'outlineCollapse',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: outlineCollapsePluginKey,
        state: {
          init: (_, { doc }) => buildDecorations(doc),
          apply: (tr, value, _, state) => {
            if (tr.docChanged || tr.getMeta('outline-collapse')) {
              return buildDecorations(state.doc)
            }
            return value
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
