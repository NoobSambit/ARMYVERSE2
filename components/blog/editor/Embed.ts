import { Node, mergeAttributes } from '@tiptap/core'

export interface EmbedAttrs {
  src: string
  title?: string
  provider?: 'youtube' | 'spotify' | 'twitter' | 'generic'
  width?: string
  height?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (attrs: EmbedAttrs) => ReturnType
    }
  }
}

export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: '' },
      provider: { default: 'generic' },
      width: { default: '100%' },
      height: { default: '360' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-embed]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const provider = HTMLAttributes.provider || 'generic'
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-embed': provider,
        class: `embed-block embed-${provider}`,
      }),
      [
        'iframe',
        {
          src: HTMLAttributes.src,
          title: HTMLAttributes.title || `${provider} embed`,
          width: HTMLAttributes.width,
          height: HTMLAttributes.height,
          frameborder: 0,
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
          loading: 'lazy',
        },
      ],
    ]
  },

  addCommands() {
    return {
      setEmbed:
        (attrs: EmbedAttrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs,
          }),
    }
  },
})
