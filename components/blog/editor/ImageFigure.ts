import { Node, mergeAttributes } from '@tiptap/core'

export interface ImageFigureAttrs {
  src: string
  alt?: string
  caption?: string
  width?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageFigure: {
      setImageFigure: (attrs: ImageFigureAttrs) => ReturnType
    }
  }
}

export const ImageFigure = Node.create({
  name: 'imageFigure',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      caption: { default: '' },
      width: { default: '100%' },
    }
  },

  parseHTML() {
    return [
      { tag: 'figure[data-image-figure]' },
      { tag: 'img' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const imgAttrs = {
      src: HTMLAttributes.src,
      alt: HTMLAttributes.alt || '',
      width: HTMLAttributes.width || '100%',
    }
    const figAttrs = mergeAttributes(HTMLAttributes, {
      class: 'image-figure',
      'data-image-figure': 'true',
    })

    if (HTMLAttributes.caption) {
      return ['figure', figAttrs, ['img', imgAttrs], ['figcaption', {}, HTMLAttributes.caption]]
    }

    return ['figure', figAttrs, ['img', imgAttrs]]
  },

  addCommands() {
    return {
      setImageFigure:
        (attrs: ImageFigureAttrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})
