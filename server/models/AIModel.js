import mongoose from 'mongoose';
import slugify from 'slugify';

const aiModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'An AI model must have a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'An AI model name must have less or equal then 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

aiModelSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const AIModel = mongoose.model('AIModel', aiModelSchema);

export default AIModel;
