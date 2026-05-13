import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name is too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email is too long'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      maxlength: [128, 'Password is too long'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
      maxlength: [8, 'Avatar is too long'],
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin',
      },
      default: 'user',
    },
    savedPrompts: {
      type: [String],
      default: [],
    },
    likedPrompts: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_COST);
  next();
});

/**
 * Compare a plain-text password with the stored hash.
 * Requires `.select('+password')` when loading the document.
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Public-safe representation (never includes password or internal fields).
 */
userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    savedPrompts: this.savedPrompts,
    likedPrompts: this.likedPrompts,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

function stripSensitive(_, ret) {
  delete ret.password;
  delete ret.__v;
  return ret;
}

userSchema.set('toJSON', { transform: stripSensitive });
userSchema.set('toObject', { transform: stripSensitive });

const User = mongoose.model('User', userSchema);

export default User;
