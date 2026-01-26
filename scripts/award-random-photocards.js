const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const inventoryItemSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photocard',
    required: true,
  },
  acquiredAt: { type: Date, default: Date.now, index: true },
  source: {
    type: {
      type: String,
      enum: [
        'quiz',
        'quest_streaming',
        'quest_quiz',
        'craft',
        'event',
        'mastery_level',
        'daily_completion',
        'weekly_completion',
        'daily_milestone',
        'weekly_milestone',
        'borarush',
      ],
      required: true,
      default: 'quiz',
    },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizSession' },
    questCode: { type: String },
    totalStreak: { type: Number },
    milestoneNumber: { type: Number },
    masteryKind: { type: String },
    masteryKey: { type: String },
    masteryLevel: { type: Number },
  },
})

const Photocard = mongoose.model(
  'Photocard',
  new mongoose.Schema({
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
    createdAt: { type: Date, default: Date.now },
  }),
  'fandom_gallery_images'
)

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema)

async function awardRandomPhotocards() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment')
    }

    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('Connected successfully')

    const userId = '697658742f9f3c6aa4b612b4'

    console.log('Finding random photocards...')
    const totalCards = await Photocard.countDocuments()
    console.log(`Total photocards in database: ${totalCards}`)

    const randomCards = await Photocard.aggregate([{ $sample: { size: 4 } }])

    if (randomCards.length === 0) {
      console.log('No photocards found in database')
      return
    }

    console.log(
      `Awarding ${randomCards.length} random photocards to user ${userId}:`
    )

    const inventoryItems = randomCards.map(card => ({
      userId,
      cardId: card._id,
      source: {
        type: 'event',
      },
    }))

    const result = await InventoryItem.insertMany(inventoryItems)
    console.log(`Successfully awarded ${result.length} photocards`)

    console.log('\nAwarded photocards:')
    randomCards.forEach((card, index) => {
      console.log(
        `${index + 1}. ${card.imageKey || card.sourceKey} (${card.categoryDisplay})`
      )
    })
  } catch (error) {
    console.error('Error awarding photocards:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

awardRandomPhotocards()
