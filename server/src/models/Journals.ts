
import mongoose, { Document, Schema } from 'mongoose';

export interface IJournal extends Document {
  userId: string;
  title: string;
  description: string;
  images?: string[];
  timestamp: Date;
}

const journalSchema = new Schema<IJournal>({
  userId: String,
  title: String,
  description: String,
  images: [String],
  timestamp: Date,
});

const JournalModel = mongoose.model<IJournal>('Journal', journalSchema, 'journals');

export default JournalModel;
