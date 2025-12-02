const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    hackathonTitle: { type: String, required: true },
    organization: { type: String, required: true },
    mode: { type: String, required: true, enum: ['Online', 'Offline'] },
    date: { type: Date, required: true },
    year: { type: Number, required: true },
    description: { type: String, required: true },
    certificateFilePath: { type: String, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Accepted', 'Declined'] },
    proctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proctor' },
    rejectionReason: { type: String },
    participantCount: { type: Number, default: 1 }
}, { timestamps: true });

// Index for efficient queries
hackathonSchema.index({ hackathonTitle: 1, year: 1 }, { unique: true });
hackathonSchema.index({ studentId: 1 });
hackathonSchema.index({ year: 1 });
hackathonSchema.index({ status: 1 });

module.exports = mongoose.model('Hackathon', hackathonSchema);
