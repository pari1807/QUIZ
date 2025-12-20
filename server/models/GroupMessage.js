import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: [
      {
        url: String,
        publicId: String,
        fileName: String,
        fileType: String,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

groupMessageSchema.index({ group: 1, createdAt: -1 });

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage;
