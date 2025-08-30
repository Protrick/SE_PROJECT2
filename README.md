# SE_PROJECT2 - Team Formation Platform

A full-stack MERN application for team formation and collaboration. Users can create teams, apply to join teams, and manage team applications with an intuitive interface.

## 🚀 Features

- **User Authentication**: Register, login, password reset with JWT and email notifications
- **Team Creation**: Create teams with domain-specific requirements
- **Team Discovery**: Browse and filter available teams by domain
- **Application System**: Apply to teams with LinkedIn, GitHub, and resume links
- **Team Management**: Accept/reject applications, view team members
- **Email Notifications**: Automated emails for application status updates
- **Responsive Design**: Mobile-friendly interface with TailwindCSS

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email notifications
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React** 19+ with modern hooks
- **Vite** for fast development
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Framer Motion** for animations
- **React Toastify** for notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB
- Gmail account for email notifications

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Protrick/SE_PROJECT2.git
cd SE_PROJECT2
```

### 2. Environment Setup

The environment files are already configured for local development:

**Server (.env):**
- Port: 5000
- Frontend URL: http://localhost:5173
- MongoDB: Cloud Atlas (configured)
- Email: Gmail SMTP (configured)

**Client (.env):**
- Backend URL: http://localhost:5000

### 3. Start Development Servers

Use the provided startup script:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

This will:
- Install dependencies for both server and client
- Start the Express server on http://localhost:5000
- Start the React client on http://localhost:5173

### 4. Manual Setup (Alternative)

If you prefer to start servers manually:

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## 🧪 Testing the Application

### User Registration & Login
1. Go to http://localhost:5173
2. Click "Register" to create a new account
3. Check email for verification if configured
4. Login with your credentials

### Creating a Team
1. After login, click "Create Team"
2. Fill in team details (name, domain, description)
3. Submit to create your team

### Applying to Teams
1. Go to "Join Team" or "Browse Teams"
2. Filter by domain if needed
3. Click on a team to view details
4. Submit application with LinkedIn, GitHub, and resume links

### Managing Applications (Team Creators)
1. Go to "My Teams" 
2. Click "View Applications" on your team
3. Review applicant profiles
4. Accept or reject applications

### Testing Application Flow
1. **Create two user accounts**
2. **User A**: Create a team
3. **User B**: Apply to User A's team
4. **User A**: Check applications in "My Teams" → "View Applications"
5. **User A**: Accept or reject the application
6. **Both users**: Check email notifications

## 🔧 Key Fixes Implemented

### 1. Application Display Issue
**Problem**: Team creators couldn't see applications
**Solution**: Fixed filtering logic in `LiveOpeningCreatorView.jsx` - removed incorrect status-based filtering

### 2. CORS Configuration
**Problem**: Frontend-backend communication blocked
**Solution**: Enhanced CORS settings to allow localhost origins during development

### 3. Error Handling
**Problem**: Poor error feedback in application submission
**Solution**: Improved error handling and user feedback in forms

### 4. Email Notifications
**Problem**: Email notifications not working
**Solution**: Configured Gmail SMTP with app-specific password

## 📁 Project Structure

```
SE_PROJECT2/
├── server/
│   ├── controllers/     # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication middleware
│   ├── config/          # Configuration files
│   └── server.js        # Express server entry point
├── client/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Route components
│   │   ├── context/     # React context providers
│   │   └── assets/      # Static assets
│   └── public/          # Public assets
└── start-dev.sh         # Development startup script
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

### Teams
- `GET /api/team/available` - Browse available teams
- `GET /api/team/created` - Get user's created teams
- `GET /api/team/applied` - Get teams user applied to
- `POST /api/team` - Create new team
- `GET /api/team/:id` - Get team details
- `POST /api/team/:id/apply` - Apply to team

### Team Management
- `POST /api/team/:teamId/applicants/:userId/accept` - Accept application
- `POST /api/team/:teamId/applicants/:userId/reject` - Reject application
- `POST /api/team/:teamId/applicants/:userId/withdraw` - Withdraw application

## 🔍 Debugging

### Server Logs
The server includes comprehensive logging for:
- Application submissions
- Team retrieval with applicant counts
- Email notifications
- Authentication events

### Common Issues

1. **Applications not showing**: Check browser console and server logs
2. **CORS errors**: Ensure both servers are running on correct ports
3. **Email not sending**: Verify Gmail app password in .env
4. **Database connection**: Check MongoDB Atlas connection string

## 🚀 Deployment

### Environment Variables for Production
Update the environment files for production:

**Server:**
- `PORT`: Production port
- `FRONTEND_URL`: Production frontend URL
- `MONGODB_URI`: Production MongoDB connection
- `JWT_SECRET`: Strong secret key

**Client:**
- `VITE_BACKEND_URL`: Production backend URL

### Build Commands
```bash
# Client build
cd client && npm run build

# Server start
cd server && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check the debugging logs
- Verify environment configuration

---

**Happy Team Building! 🚀**
