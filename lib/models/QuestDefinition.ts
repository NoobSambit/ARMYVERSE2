import mongoose from 'mongoose'

export interface IQuestDefinition {
  _id: mongoose.Types.ObjectId
  code: string
  title: string
  period: 'daily' | 'weekly'
  goalType: string
  goalValue: number
  streamingMeta?: {
    trackTargets?: Array<{
      trackName: string
      artistName: string
      count: number
    }>
    albumTargets?: Array<{
      albumName: string
      trackCount: number
      tracks?: Array<{
        name: string
        artist: string
      }>
    }>
  }
  reward: {
    dust: number
    xp?: number
    ticket?: {
      enabled?: boolean
    }
    badgeId?: mongoose.Types.ObjectId
  }
  active: boolean
}

const questDefinitionSchema = new mongoose.Schema<IQuestDefinition>({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  period: { type: String, enum: ['daily', 'weekly'], required: true },
  goalType: { type: String, required: true },
  goalValue: { type: Number, required: true },
  streamingMeta: {
    trackTargets: [{
      trackName: { type: String },
      artistName: { type: String },
      count: { type: Number }
    }],
    albumTargets: [{
      albumName: { type: String },
      trackCount: { type: Number },
      tracks: [{
        name: { type: String },
        artist: { type: String }
      }]
    }]
  },
  reward: {
    dust: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    ticket: {
      enabled: { type: Boolean, default: false }
    },
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', default: undefined }
  },
  active: { type: Boolean, default: true }
})

questDefinitionSchema.index({ code: 1 }, { unique: true })

export const QuestDefinition = mongoose.models.QuestDefinition || mongoose.model<IQuestDefinition>('QuestDefinition', questDefinitionSchema)

