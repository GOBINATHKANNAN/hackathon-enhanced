import React, { useState, useEffect, useContext, useRef } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [hackathons, setHackathons] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        hackathonTitle: '',
        organization: '',
        description: '',
        mode: 'Online',
        date: '',
        year: new Date().getFullYear(),
        certificate: null
    });
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Ref for certificate input to reset it after submission
    const certificateRef = useRef(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchHackathons(),
                fetchCredits(),
                checkCreditAlert()
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchHackathons = async () => {
        try {
            const res = await API.get('/hackathons/my-hackathons');
            setHackathons(res.data);
        } catch (err) {
            console.error('Error fetching hackathons:', err);
            setError('Failed to load hackathons');
        }
    };

    const fetchCredits = async () => {
        try {
            const res = await API.get('/student/credits');
            setCredits(res.data.credits);
        } catch (err) {
            console.error('Error fetching credits:', err);
        }
    };

    const checkCreditAlert = async () => {
        try {
            await API.post('/student/check-credits');
        } catch (err) {
            console.error('Error checking credits:', err);
        }
    };

    const handleChange = (e) => {
        setError('');
        setSuccess('');
        if (['certificate'].includes(e.target.name)) {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });

        try {
            await API.post('/hackathons/submit', data);
            setSuccess('Hackathon submitted successfully! You will receive a confirmation email.');

            // Reset form
            setFormData({
                hackathonTitle: '',
                organization: '',
                description: '',
                mode: 'Online',
                date: '',
                year: new Date().getFullYear(),
                certificate: null
            });

            // Reset file input
            if (certificateRef.current) certificateRef.current.value = '';

            // Refresh data
            await fetchHackathons();
            setShowForm(false); // Close form on success
        } catch (err) {
            setError('Submission failed: ' + (err.response?.data?.message || err.message));
            console.error('Submission error:', err);
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="dashboard-container">
                <h2>Student Dashboard</h2>
                <p>Loading your data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Simplified Welcome Section */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>Welcome, {user?.name || 'Student'}</h1>
                <p style={{ color: '#666', margin: 0 }}>Manage your hackathons and track your participation.</p>

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <div className="info-pill">
                        <span className="label">Reg No:</span>
                        <span className="value">{user?.registerNo || 'N/A'}</span>
                    </div>
                    <div className="info-pill">
                        <span className="label">Year:</span>
                        <span className="value">{user?.year || 'N/A'}</span>
                    </div>
                    <div className="info-pill">
                        <span className="label">Hackathons:</span>
                        <span className="value" style={{ color: credits >= 3 ? '#4caf50' : '#e65100' }}>{credits} / 3</span>
                    </div>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div style={{ background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c3e6cb' }}>
                    ✅ {success}
                </div>
            )}
            {error && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
                    ❌ {error}
                </div>
            )}

            {/* Main Action Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: '#830000' }}>My Hackathons</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: showForm ? '#666' : '#830000',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {showForm ? '✖ Cancel' : '➕ Submit Hackathon Details'}
                </button>
            </div>

            {/* Submission Form (Collapsible) */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginBottom: '30px' }}
                    >
                        <div className="form-card" style={{ background: '#f9f9f9', border: '1px solid #ddd', boxShadow: 'none' }}>
                            <h3 style={{ marginTop: 0, color: '#333' }}>New Hackathon Submission</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Hackathon Title *</label>
                                    <input type="text" name="hackathonTitle" value={formData.hackathonTitle} onChange={handleChange} required placeholder="e.g., Smart India Hackathon, CodeFest" />
                                </div>
                                <div className="form-group">
                                    <label>Organization *</label>
                                    <input type="text" name="organization" value={formData.organization} onChange={handleChange} required placeholder="e.g., Google, Microsoft, College Name" />
                                </div>
                                <div className="form-group">
                                    <label>Description *</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="Describe your role..." />
                                </div>
                                <div className="form-group">
                                    <label>Mode *</label>
                                    <select name="mode" value={formData.mode} onChange={handleChange}>
                                        <option value="Online">🌐 Online</option>
                                        <option value="Offline">🏢 Offline</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>Date *</label>
                                        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Year *</label>
                                        <input type="number" name="year" value={formData.year} onChange={handleChange} required min="2020" max="2030" />
                                    </div>
                                </div>

                                <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Upload Certificate</h4>
                                <div className="form-group">
                                    <label>Certificate (PDF/Image) *</label>
                                    <input type="file" name="certificate" ref={certificateRef} onChange={handleChange} required accept=".pdf,.jpg,.jpeg,.png" />
                                </div>

                                <button type="submit" className="submit-btn" disabled={submitting} style={{
                                    background: submitting ? '#ccc' : '#d32f2f',
                                    width: '100%',
                                    marginTop: '20px'
                                }}>
                                    {submitting ? '⏳ Submitting...' : 'Submit Hackathon'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hackathons List */}
            <div className="submissions-list">
                {hackathons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f5f5f5', borderRadius: '8px', color: '#666' }}>
                        <p style={{ fontSize: '2rem', margin: 0 }}>📭</p>
                        <p>No hackathons submitted yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {hackathons.map(hack => (
                            <div key={hack._id} className="hackathon-card-item" style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #eee',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '15px'
                            }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{hack.hackathonTitle}</h3>
                                    <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>
                                        {hack.organization} • {new Date(hack.date).toLocaleDateString()} • {hack.year} • {hack.mode}
                                    </p>
                                    {hack.status === 'Declined' && (
                                        <p style={{ color: '#d32f2f', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                                            Reason: {hack.rejectionReason}
                                        </p>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`status-badge ${hack.status.toLowerCase()}`} style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        background: hack.status === 'Accepted' ? '#e8f5e9' : hack.status === 'Declined' ? '#ffebee' : '#fff3e0',
                                        color: hack.status === 'Accepted' ? '#2e7d32' : hack.status === 'Declined' ? '#c62828' : '#ef6c00',
                                        border: `1px solid ${hack.status === 'Accepted' ? '#a5d6a7' : hack.status === 'Declined' ? '#ef9a9a' : '#ffe0b2'}`
                                    }}>
                                        {hack.status === 'Pending' ? '⏳ Pending Verification' : hack.status === 'Accepted' ? '✅ Accepted' : '❌ Declined'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
