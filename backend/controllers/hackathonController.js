const Hackathon = require('../models/Hackathon');
const Student = require('../models/Student');
const Proctor = require('../models/Proctor');
const { sendEmail, emailTemplates } = require('../services/emailService');

// Submit Hackathon
exports.submitHackathon = async (req, res) => {
    try {
        const { hackathonTitle, organization, mode, date, year, description } = req.body;
        const certificateFilePath = req.files['certificate'] ? req.files['certificate'][0].path : null;

        if (!certificateFilePath) {
            return res.status(400).json({ message: 'Certificate file is required' });
        }

        // Check if hackathon already exists for the year
        const existingHackathon = await Hackathon.findOne({ 
            hackathonTitle: hackathonTitle.trim(), 
            year: parseInt(year) 
        });

        let hackathon;
        if (existingHackathon) {
            // Increment participant count
            existingHackathon.participantCount += 1;
            await existingHackathon.save();
            hackathon = existingHackathon;
        } else {
            // Create new hackathon
            hackathon = await Hackathon.create({
                studentId: req.user.id,
                hackathonTitle: hackathonTitle.trim(),
                organization: organization.trim(),
                mode,
                date: new Date(date),
                year: parseInt(year),
                description: description.trim(),
                certificateFilePath
            });
        }

        // Find student to get department and assign proctor
        const student = await Student.findById(req.user.id);
        // Find a proctor in the same department
        const proctor = await Proctor.findOne({ department: student.department });

        if (proctor) {
            hackathon.proctorId = proctor._id;
            await hackathon.save();
            // Add to proctor's assigned students if not already there
            if (!proctor.assignedStudents.includes(student._id)) {
                proctor.assignedStudents.push(student._id);
                await proctor.save();
            }
        } else {
            console.warn(`No proctor found for department: ${student.department}`);
        }

        // Send Email Notification to Student
        console.log('Sending hackathon submission confirmation email to:', student.email);
        const emailResult = await sendEmail(emailTemplates.hackathonSubmitted(student.name, student.email, hackathonTitle));

        if (!emailResult.success) {
            console.error('Hackathon submission confirmation email failed');
        }

        res.status(201).json({ message: 'Hackathon submitted successfully', hackathon });
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            res.status(400).json({ message: 'This hackathon already exists for the specified year' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

// Get Student Hackathons
exports.getMyHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Proctor Assigned Hackathons
exports.getAssignedHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find({ proctorId: req.user.id })
            .populate('studentId', 'name registerNo year department')
            .sort({ createdAt: -1 });
        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Approve/Reject Hackathon
exports.updateHackathonStatus = async (req, res) => {
    try {
        console.log('Updating hackathon status for ID:', req.params.id);
        console.log('Request body:', req.body);
        console.log('User ID:', req.user.id);

        const { status, rejectionReason } = req.body;
        const hackathon = await Hackathon.findById(req.params.id);

        if (!hackathon) {
            console.log('Hackathon not found');
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        console.log('Found hackathon:', hackathon);
        console.log('Hackathon proctorId:', hackathon.proctorId);
        console.log('User ID (string):', req.user.id.toString());

        if (hackathon.proctorId.toString() !== req.user.id.toString()) {
            console.log('Authorization failed - proctor mismatch');
            return res.status(403).json({ message: 'Not authorized to update this hackathon' });
        }

        const previousStatus = hackathon.status;
        hackathon.status = status;
        if (status === 'Declined') {
            hackathon.rejectionReason = rejectionReason;
        } else {
            hackathon.rejectionReason = undefined;
        }

        await hackathon.save();
        console.log('Hackathon saved successfully');

        // Update student credits if status changed to Accepted
        if (previousStatus !== 'Accepted' && status === 'Accepted') {
            const student = await Student.findById(hackathon.studentId);
            if (student) {
                student.credits += 1;
                await student.save();
                console.log('Student credits updated');
            }
        }
        // Remove credit if status changed from Accepted to something else
        else if (previousStatus === 'Accepted' && status !== 'Accepted') {
            const student = await Student.findById(hackathon.studentId);
            if (student && student.credits > 0) {
                student.credits -= 1;
                await student.save();
                console.log('Student credits decreased');
            }
        }

        // Send Email Notification (try-catch to prevent email errors from breaking the update)
        try {
            const student = await Student.findById(hackathon.studentId);
            console.log('Sending hackathon status update email to:', student.email);
            const emailResult = await sendEmail(
                emailTemplates.hackathonStatusUpdate(student.name, student.email, hackathon.hackathonTitle, status, rejectionReason)
            );

            if (!emailResult.success) {
                console.error('Hackathon status update email failed');
            } else {
                console.log('Email sent successfully');
            }
        } catch (emailError) {
            console.error('Email error (but hackathon was updated):', emailError);
        }

        res.json({ message: `Hackathon ${status}`, hackathon });
    } catch (error) {
        console.error('Error updating hackathon status:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get All Accepted Hackathons (Public)
exports.getAcceptedHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find({ status: 'Accepted' })
            .populate('studentId', 'name registerNo department year')
            .sort({ createdAt: -1 });
        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Hackathons by Year (for Staff filtering)
exports.getHackathonsByYear = async (req, res) => {
    try {
        const { year } = req.query;
        const filter = year ? { year: parseInt(year) } : {};
        
        const hackathons = await Hackathon.find(filter)
            .populate('studentId', 'name registerNo year department')
            .sort({ createdAt: -1 });
        
        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Hackathon Participants
exports.getHackathonParticipants = async (req, res) => {
    try {
        const { hackathonTitle, year } = req.query;
        
        if (!hackathonTitle || !year) {
            return res.status(400).json({ message: 'Hackathon title and year are required' });
        }

        const participants = await Hackathon.find({ 
            hackathonTitle: hackathonTitle.trim(), 
            year: parseInt(year) 
        })
        .populate('studentId', 'name registerNo year department email')
        .sort({ createdAt: -1 });

        res.json(participants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Student's All Hackathons (for Staff view)
exports.getStudentHackathons = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const hackathons = await Hackathon.find({ studentId })
            .populate('studentId', 'name registerNo year department')
            .sort({ createdAt: -1 });

        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Hackathon Statistics
exports.getHackathonStats = async (req, res) => {
    try {
        const stats = await Hackathon.aggregate([
            {
                $group: {
                    _id: '$year',
                    totalHackathons: { $sum: 1 },
                    uniqueHackathons: { $addToSet: '$hackathonTitle' },
                    totalParticipants: { $sum: '$participantCount' }
                }
            },
            {
                $addFields: {
                    uniqueHackathonCount: { $size: '$uniqueHackathons' }
                }
            },
            {
                $project: {
                    uniqueHackathons: 0
                }
            },
            { $sort: { _id: -1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
