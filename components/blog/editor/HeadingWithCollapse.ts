import Heading from '@tiptap/extension-heading'
import { mergeAttributes } from '@tiptap/core'

export const HeadingWithCollapse = Heading.extend({
  addAttributes() {
    const parentAttrs = (this as unknown as { parent?: () => Record<string, unknown> }).parent?.()
    return {
      ...(parentAttrs || {}),
      collapsed: {
        default: false,
        parseHTML: (element: Element) => element.getAttribute('data-collapsed') === 'true',
        renderHTML: (attributes: { collapsed?: boolean }) => ({
          'data-collapsed': attributes.collapsed ? 'true' : 'false',
        }),
      },
    }
  },

  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) {
    const level = node.attrs.level
    return [
      `h${level}`,
      mergeAttributes(HTMLAttributes),
      0,
    ]
  },
})
