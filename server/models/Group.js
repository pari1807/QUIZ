import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    allStudents: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

groupSchema.index({ name: 1 });

groupSchema.methods.isMember = function (userId) {
  if (this.allStudents) return true;
  return (this.members || []).some((m) => m.toString() === userId.toString());
};

const Group = mongoose.model('Group', groupSchema);

export default Group;
