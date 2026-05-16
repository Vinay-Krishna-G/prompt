import mongoose from 'mongoose';
import slugify from 'slugify';

const promptSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A prompt must have a title'],
      trim: true,
      maxlength: [120, 'A prompt title must have less or equal then 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    promptText: {
      type: String,
      required: [true, 'A prompt must have prompt text'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'A prompt must belong to a category'],
      trim: true,
    },
    tags: {
      type: [String],
      index: true,
    },
    previewImage: {
      type: String,
    },
    previewVideo: {
      type: String,
    },
    type: {
      type: String,
      enum: {
        values: ['image', 'video'],
        message: 'Type must be either: image or video',
      },
      required: [true, 'A prompt must have a type'],
    },
    aiModel: {
      type: String,
      required: [true, 'A prompt must specify an AI model'],
      trim: true,
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A prompt must belong to a creator'],
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    copies: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    dominantColor: {
      type: String,
      default: '#0a0f1c',
    },
    config: {
      aspectRatio: { type: String, trim: true },
      chaos: { type: String, trim: true },
      quality: { type: String, trim: true },
      style: { type: String, trim: true },
    },
    customizationNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search performance
promptSchema.index({ title: 'text', tags: 'text' });
promptSchema.index({ category: 1 });
promptSchema.index({ createdAt: -1 });
promptSchema.index({ isTrending: 1 });

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
promptSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 8);
  }
  next();
});

const Prompt = mongoose.model('Prompt', promptSchema);

export default Prompt;
