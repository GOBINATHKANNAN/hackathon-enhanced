import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import UserManagement from '../components/UserManagement';
import './Dashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [hackathons, setHackathons] = useState([]);
    const [lowCreditStudents, setLowCreditStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alerting, setAlerting] = useState(false);
    
    // User management states
    const [activeTab, setActiveTab] = useState('overview');
    const [students, setStudents] = useState([]);
    const [proctors, setProctors] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, hackathonsRes, lowCreditsRes] = await Promise.all([
                    API.get('/admin/stats'),
                    API.get('/hackathons/accepted'),
                    API.get('/admin/low-credits')
                ]);
                setStats(statsRes.data);
                setHackathons(hackathonsRes.data);
                setLowCreditStudents(lowCreditsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch users when user management tab is active
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const [studentsRes, proctorsRes, adminsRes, userStatsRes] = await Promise.all([
                API.get('/users/students'),
                API.get('/users/proctors'),
                API.get('/users/admins'),
                API.get('/users/stats')
            ]);
            setStudents(studentsRes.data);
            setProctors(proctorsRes.data);
            setAdmins(adminsRes.data);
            setUserStats(userStatsRes.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleEditUser = (user, type) => {
        setEditingUser({ ...user, type });
        setEditForm({ ...user });
    };

    const handleUpdateUser = async () => {
        try {
            const { type, _id } = editingUser;
            await API.put(`/users/${type}s/${_id}`, editForm);
            setEditingUser(null);
            setEditForm({});
            fetchUsers();
            alert('User updated successfully!');
        } catch (error) {
            alert('Failed to update user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteUser = async (user, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        
        try {
            await API.delete(`/users/${type}s/${user._id}`);
            fetchUsers();
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        } catch (error) {
            alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSendAlerts = async () => {
        if (!window.confirm('Are you sure you want to send email alerts to all students with less than required hackathon participations?')) return;

        setAlerting(true);
        try {
            const res = await API.post('/admin/send-alerts');
            alert(`Alerts sent successfully!\nSent: ${res.data.sent}\nFailed: ${res.data.failed}`);
        } catch (error) {
            console.error('Error sending alerts:', error);
            alert('Failed to send alerts.');
        } finally {
            setAlerting(false);
        }
    };

    if (loading) return <div className="dashboard-container"><p>Loading admin data...</p></div>;
    if (!stats) return <div className="dashboard-container"><p>Error loading data.</p></div>;

    const pieData = [
        { name: 'Online', value: stats.modeStats.online },
        { name: 'Offline', value: stats.modeStats.offline }
    ];
    const COLORS = ['#0088FE', '#00C49F'];

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ color: '#830000', margin: 0 }}>Admin Dashboard</h2>
                <Link to="/" style={{ textDecoration: 'none', color: '#830000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🏠 Home
                </Link>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'overview' ? '#830000' : '#f5f5f5',
                        color: activeTab === 'overview' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    📊 Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'users' ? '#830000' : '#f5f5f5',
                        color: activeTab === 'users' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    👥 User Management
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Original Overview Content */}
                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="stat-card" style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Total Students</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.totalStudents}</p>
                        </div>
                        <div className="stat-card" style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#ef6c00' }}>Total Hackathons</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.totalHackathons}</p>
                        </div>
                        <div className="stat-card" style={{ background: '#fff8e1', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#fbc02d' }}>Pending</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.pendingHackathons}</p>
                        </div>
                        <div className="stat-card" style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Accepted</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.acceptedHackathons}</p>
                        </div>
                    </div>

                    {/* Rest of overview content... */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <button onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + "Student,RegisterNo,Hackathon,Mode,Status\n"
                                + hackathons.map(i => `${i.studentId?.name},${i.studentId?.registerNo},${i.hackathonTitle},${i.mode},${i.status}`).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "hackathons.csv");
                            document.body.appendChild(link);
                            link.click();
                        }} style={{ background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
                            📥 Export to CSV
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                        <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Hackathon Mode Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Student Hackathon Status</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Total Students', value: stats.totalStudents },
                                                { name: 'With Hackathons', value: stats.studentsWithHackathons },
                                                { name: 'Completed Requirements', value: stats.studentsCompletedCredits }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#82ca9d"
                                            dataKey="value"
                                            label
                                        >
                                            <Cell fill="#8884d8" />
                                            <Cell fill="#82ca9d" />
                                            <Cell fill="#ffc658" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="list-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: '#d32f2f' }}>Students with Low Participation (&lt; Required)</h3>
                            <button
                                onClick={handleSendAlerts}
                                disabled={alerting || lowCreditStudents.length === 0}
                                style={{
                                    background: alerting ? '#ccc' : '#d32f2f',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: alerting ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {alerting ? 'Sending...' : 'Send Email Alerts'}
                            </button>
                        </div>

                        {lowCreditStudents.length === 0 ? (
                            <p>All students have completed required hackathon participations.</p>
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                                        <tr style={{ background: '#ffebee', textAlign: 'left' }}>
                                            <th style={{ padding: '12px' }}>Name</th>
                                            <th style={{ padding: '12px' }}>Register No</th>
                                            <th style={{ padding: '12px' }}>Year</th>
                                            <th style={{ padding: '12px' }}>Hackathons Attended</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lowCreditStudents.map(student => (
                                            <tr key={student._id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '12px' }}>{student.name}</td>
                                                <td style={{ padding: '12px' }}>{student.registerNo}</td>
                                                <td style={{ padding: '12px' }}>{student.year}</td>
                                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#d32f2f' }}>{student.credits}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="list-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>All Hackathons</h3>
                        <div className="table-responsive" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Student</th>
                                        <th style={{ padding: '12px' }}>Hackathon</th>
                                        <th style={{ padding: '12px' }}>Mode</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hackathons.map(intern => (
                                        <tr key={intern._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div>{intern.studentId?.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{intern.studentId?.registerNo}</div>
                                            </td>
                                            <td style={{ padding: '12px' }}>{intern.hackathonTitle || intern.companyName}</td>
                                            <td style={{ padding: '12px' }}>{intern.mode}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span className={`status-${intern.status.toLowerCase()}`} style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    background: intern.status === 'Accepted' ? '#e8f5e9' : intern.status === 'Declined' ? '#ffebee' : '#fff3e0',
                                                    color: intern.status === 'Accepted' ? '#2e7d32' : intern.status === 'Declined' ? '#c62828' : '#ef6c00'
                                                }}>
                                                    {intern.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <UserManagement 
                    students={students}
                    proctors={proctors}
                    admins={admins}
                    userStats={userStats}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                    editingUser={editingUser}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    onUpdateUser={handleUpdateUser}
                    setEditingUser={setEditingUser}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
