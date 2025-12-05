# Hackathon Management Portal - TCE CSBS

A comprehensive web application for managing student hackathon participations, verifying completions, and generating reports for the Department of Computer Science and Business Systems, Thiagarajar College of Engineering.

## 🎯 Features

### 1. Student Portal
*   **Registration & Login**: Secure signup restricted to `@student.tce.edu` email domain
*   **Welcome Email**: Automated email upon successful registration with TCE contact details
*   **Hackathon Submission**:
    *   Hackathon Title
    *   Organization Name
    *   Description
    *   Mode (Online/Offline)
    *   Date & Year
    *   **File Uploads**: Certificate (required)
*   **Confirmation Email**: Sent immediately after successful submission
*   **Participation Tracking**: Real-time progress showing hackathons completed
*   **Participation Alert**: Automatic email if participation is low when logging in
*   **Submission History**: View all past hackathon submissions with status

### 2. Proctor Portal
*   **Login**: Dedicated faculty access
*   **Assigned Students**: View students from their department
*   **Review Submissions**: 
    *   View all hackathon details
    *   Download/view uploaded certificates
    *   Filter hackathons by year
    *   View participants for each hackathon
*   **Accept/Decline**: 
    *   Accept hackathon participations
    *   Decline with reason
*   **Email Notifications**: Automatic approval/rejection emails sent to students
*   **Student History**: View all hackathons for each student

### 3. Admin Portal
*   **Login**: Centralized management
*   **Dashboard Statistics**:
    *   Total Students
    *   Total Hackathons
    *   Pending/Accepted Hackathons
    *   Students with Required Participations (Completed)
    *   Students with Low Participation (Pending)
*   **Visual Charts**: Pie chart for Online/Offline hackathon distribution
*   **Export Data**: Download all hackathon data as CSV
*   **View All**: Complete list of students and hackathons
*   **Send Alerts**: Email reminders to students with low participation

### 4. Public Home Page
*   **Year-wise Display**: Shows approved hackathons organized by year (1st, 2nd, 3rd, 4th)
*   **Hackathon Cards**: Each card displays:
    *   Student Name

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **CSS3** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Gmail account with App Password for email service

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/GOBINATHKANNAN/hackathon-enhanced.git
cd hackathon-enhanced
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Configure Environment Variables**
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hackathon_portal
JWT_SECRET=your_secret_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

4. **Database Setup**
```bash
# Seed default accounts
node seed.js
```

5. **Frontend Setup**
```bash
cd frontend
npm install
```

### Running the Application

#### Option 1: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

#### Option 2: Batch File (Windows)
```bash
run_project.bat
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 👤 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@portal.com | adminpassword |
| **Proctor** | proctor@portal.com | proctorpassword |
| **Student** | student@student.tce.edu | studentpassword |

## 📧 Email Configuration

### Gmail App Password Setup
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate new app password for "Mail" on "Other (Custom name)"
5. Use the 16-character password in `EMAIL_PASS`

### Email Templates Included
- Welcome emails for new registrations
- Hackathon submission confirmations  
- Approval/decline notifications
- Participation reminders

## 🏗️ Project Structure

```
hackathon-enhanced/
├── backend/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Authentication & file upload
│   ├── models/         # Database schemas
│   ├── routes/         # API routes
│   ├── services/       # Email & cron services
│   └── uploads/        # File storage
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context
│   │   └── services/   # API services
│   └── public/
├── README.md
├── QUICK_START.md
└── run_project.bat
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/login/student` - Student login
- `POST /api/auth/login/proctor` - Proctor login
- `POST /api/auth/login/admin` - Admin login

### Hackathons
- `POST /api/hackathons/submit` - Submit hackathon
- `GET /api/hackathons/my-hackathons` - Student's hackathons
- `GET /api/hackathons/assigned` - Proctor's assigned hackathons
- `PUT /api/hackathons/:id/status` - Update hackathon status
- `GET /api/hackathons/accepted` - Public approved hackathons

### User Management (Admin Only)
- `GET /api/users/students` - Get all students
- `GET /api/users/proctors` - Get all proctors
- `GET /api/users/admins` - Get all admins
- `PUT /api/users/students/:id` - Update student
- `DELETE /api/users/students/:id` - Delete student

## 🎯 Key Features in Detail

### User Management System
- **Complete CRUD Operations**: Create, read, update, delete all user types
- **Role-Based Access**: Admin, Proctor, Student roles with specific permissions
- **Persistent Storage**: All user data stored in MongoDB database
- **Security Features**: Password hashing, JWT authentication, input validation

### Hackathon Submission Workflow
1. **Student Registration**: Email verification with @student.tce.edu validation
2. **Hackathon Submission**: Upload certificates and participation details
3. **Proctor Review**: Evaluate submissions and verify authenticity
4. **Status Updates**: Email notifications for approval/decline
5. **Credit Tracking**: Automatic credit calculation for students

### Email Service Integration
- **Gmail SMTP**: Reliable email delivery through Gmail
- **Template System**: Professional email templates with TCE branding
- **Error Handling**: Graceful fallback if email service fails
- **Logging**: Comprehensive email delivery tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for password storage
- **Role-Based Authorization**: Middleware for role validation
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: Multer configuration for safe file handling

## 📊 Data Models

### Student Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  registerNo: String (unique),
  department: String,
  year: String ['1st', '2nd', '3rd', '4th'],
  verified: Boolean (default: false)
}
```

### Hackathon Model
```javascript
{
  studentId: ObjectId,
  proctorId: ObjectId,
  hackathonTitle: String,
  organization: String,
  mode: String ['Online', 'Offline'],
  date: Date,
  year: Number,
  description: String,
  certificateFilePath: String,
  status: String ['Pending', 'Accepted', 'Declined'],
  rejectionReason: String,
  participantCount: Number
}
```

## 🚀 Deployment

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hackathon_portal
JWT_SECRET=your_secure_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Production Setup
1. Set up MongoDB Atlas or MongoDB server
2. Configure environment variables
3. Build frontend: `npm run build`
4. Use process manager like PM2 for backend
5. Set up reverse proxy with Nginx (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and queries:
- **Thiagarajar College of Engineering**
- **Department of Computer Science and Business Systems**
- **Email**: gobinath@student.tce.edu
- **Phone**: +91 8754882673,8925775915

## 🎉 Acknowledgments

- **TCE CSBS Department** - For project guidance and support
- **Students** - For testing and feedback
- **Open Source Community** - For the amazing tools and libraries

---

**Built with ❤️ for TCE CSBS Students**
