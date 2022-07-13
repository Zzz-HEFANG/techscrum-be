export {};
const mongoose = require('mongoose');
//TODO: need to find out why crash and did application stop
const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    projectLeadId: {
      type: String,
      trim: true,
    },
    assigneeId: {
      type: String,
      trim: true,
    },
    boardId: {
      type: String,
      required: true,
    },
    icon: { type: String, required: false },
    star: { type: Boolean, required: false },
    detail: { type: 'string', required: false },
    shortcut: [
      { name: { type: String }, shortcutLink: { type: String } },
    ],
  },
  { timestamps: true },
);

module.exports.getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('project', projectSchema);
};
