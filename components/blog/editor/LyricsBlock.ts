import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lyricsBlock: {
      insertLyricsBlock: () => ReturnType
    }
  }
}

export const LyricsBlock = Node.create({
  name: 'lyricsBlock',
  group: 'block',
  content: 'paragraph+',
  defining: true,

  addAttributes() {
    return {
      class: { default: 'lyrics-block' },
      'data-lyrics': { default: 'true' },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-lyrics]' },
      { tag: 'div.lyrics-block' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'lyrics-block',
        'data-lyrics': 'true',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      insertLyricsBlock:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Add lyrics here…' }],
              },
            ],
          }),
    }
  },
})
