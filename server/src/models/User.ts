// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the user schema interface
interface UserSchema extends Document {
  username: string;
  email: string;
  password: string;
}

// Define the user schema
const userSchema = new Schema<UserSchema>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash the password before saving the user
userSchema.pre<UserSchema>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

// Create the User model
const UserModel = mongoose.model<UserSchema>('User', userSchema, 'users');

export default UserModel;
