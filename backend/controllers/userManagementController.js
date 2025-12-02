const Student = require('../models/Student');
const Proctor = require('../models/Proctor');
const Admin = require('../models/Admin');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all proctors
exports.getAllProctors = async (req, res) => {
    try {
        const proctors = await Proctor.find().select('-password').sort({ createdAt: -1 });
        res.json(proctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Don't allow password updates through this endpoint
        delete updates.password;
        
        const student = await Student.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update proctor
exports.updateProctor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Don't allow password updates through this endpoint
        delete updates.password;
        
        const proctor = await Proctor.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!proctor) {
            return res.status(404).json({ message: 'Proctor not found' });
        }
        
        res.json(proctor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update admin
exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Don't allow password updates through this endpoint
        delete updates.password;
        
        const admin = await Admin.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Also delete related hackathons
        const Hackathon = require('../models/Hackathon');
        await Hackathon.deleteMany({ studentId: id });
        
        const student = await Student.findByIdAndDelete(id);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json({ message: 'Student and related hackathons deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete proctor
exports.deleteProctor = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if proctor has assigned hackathons
        const Hackathon = require('../models/Hackathon');
        const assignedHackathons = await Hackathon.find({ proctorId: id });
        
        if (assignedHackathons.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete proctor with assigned hackathons. Please reassign hackathons first.' 
            });
        }
        
        const proctor = await Proctor.findByIdAndDelete(id);
        
        if (!proctor) {
            return res.status(404).json({ message: 'Proctor not found' });
        }
        
        res.json({ message: 'Proctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete admin (prevent self-deletion)
exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent admin from deleting themselves
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }
        
        const admin = await Admin.findByIdAndDelete(id);
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const proctorCount = await Proctor.countDocuments();
        const adminCount = await Admin.countDocuments();
        
        res.json({
            students: studentCount,
            proctors: proctorCount,
            admins: adminCount,
            total: studentCount + proctorCount + adminCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
