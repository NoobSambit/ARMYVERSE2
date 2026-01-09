import mongoose from 'mongoose'

export interface IPhotocard {
  _id: mongoose.Types.ObjectId
  sourceKey: string
  pageUrl: string
  pageTitle?: string
  pageSlug?: string
  pageDisplay?: string
  pathSegments?: string[]
  categoryPath: string
  categoryDisplay: string
  subcategoryPath?: string | null
  subcategoryLabels?: string[]
  tabPath?: string[]
  tabLabels?: string[]
  headingPath?: string[]
  headingLabels?: string[]
  anchor?: string | null
  sourceUrl?: string
  imageUrl: string
  thumbUrl?: string
  filePageUrl?: string
  imageKey?: string
  imageName?: string
  caption?: string
  scrapedAt?: Date
  createdAt?: Date
}

const photocardSchema = new mongoose.Schema<IPhotocard>({
  sourceKey: { type: String, required: true, unique: true },
  pageUrl: { type: String, required: true },
  pageTitle: { type: String, default: undefined },
  pageSlug: { type: String, default: undefined },
  pageDisplay: { type: String, default: undefined },
  pathSegments: [{ type: String }],
  categoryPath: { type: String, required: true, index: true },
  categoryDisplay: { type: String, required: true },
  subcategoryPath: { type: String, default: null, index: true },
  subcategoryLabels: [{ type: String }],
  tabPath: [{ type: String }],
  tabLabels: [{ type: String }],
  headingPath: [{ type: String }],
  headingLabels: [{ type: String }],
  anchor: { type: String, default: null },
  sourceUrl: { type: String, default: undefined },
  imageUrl: { type: String, required: true },
  thumbUrl: { type: String, default: undefined },
  filePageUrl: { type: String, default: undefined },
  imageKey: { type: String, default: undefined },
  imageName: { type: String, default: undefined },
  caption: { type: String, default: undefined },
  scrapedAt: { type: Date, default: undefined },
  createdAt: { type: Date, default: Date.now }
})

photocardSchema.index({ categoryPath: 1, subcategoryPath: 1 })

export const Photocard = mongoose.models.Photocard || mongoose.model<IPhotocard>('Photocard', photocardSchema, 'fandom_gallery_images')

