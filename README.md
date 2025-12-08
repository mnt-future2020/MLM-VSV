# VSV Unite - MLM Platform

A complete Multi-Level Marketing (MLM) platform with Binary Tree structure and PV-based earning system.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **Backend**: FastAPI (Python) + MongoDB
- **Authentication**: JWT-based
- **Architecture**: Binary MLM with Point Value (PV) System

## 📁 Project Structure

```
/app
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── contexts/     # React contexts (Auth, etc.)
│   ├── lib/          # API clients and utilities
│   └── types/        # TypeScript type definitions
│
└── backend/          # FastAPI backend application
    ├── server.py     # Main FastAPI application
    ├── .env          # Environment variables
    └── requirements.txt
```

## 🔧 Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB
- Yarn package manager

### Backend Setup

1. Install dependencies:
```bash
cd /app/backend
pip install -r requirements.txt
```

2. Start MongoDB (if not running):
```bash
mongod --dbpath /data/db --fork --logpath /var/log/mongodb/mongod.log
```

3. Run backend server:
```bash
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend will run on: http://localhost:8001

### Frontend Setup

1. Install dependencies:
```bash
cd /app/frontend
yarn install
```

2. Run frontend:
```bash
yarn dev
```

Frontend will run on: http://localhost:3000

## 🔐 Default Credentials

### Admin Account
- **Email**: admin@vsvunite.com
- **Password**: Admin@123
- **Referral ID**: VSV00001
- **Role**: admin

### Test User (Created via API)
- **Email**: test@example.com
- **Username**: testuser1
- **Password**: Test@123
- **Referral ID**: VSVVVJVLJL

## 📊 Membership Plans

| Plan | Amount | PV | Referral Income | Daily Capping | Matching Income |
|------|--------|----|----|----|----|
| Basic | ₹111 | 1 PV | ₹25 | ₹250 | ₹25 |
| Standard | ₹599 | 2 PV | ₹50 | ₹500 | ₹50 |
| Advanced | ₹1199 | 4 PV | ₹100 | ₹1000 | ₹100 |
| Premium | ₹1799 | 6 PV | ₹150 | ₹1500 | ₹150 |

## 🌟 Features Implemented

### Authentication & User Management
✅ Registration with Referral System
✅ JWT-based Login (Email/Referral ID/Username)
✅ Password Reset & Change Password
✅ Session Management
✅ Admin & User roles

### MLM Binary Structure
✅ Binary Tree (Left & Right placement)
✅ PV (Point Value) System
✅ Automatic PV Matching calculation
✅ Team Tree APIs
✅ Team Statistics

### Membership Plans
✅ 4 Pre-configured Plans
✅ Plan listing API
✅ Plan activation/upgrade system

### Wallet & Earnings
✅ Wallet system with balance tracking
✅ Transaction history
✅ Multiple income types:
  - Direct/Referral Income
  - Matching Income (Binary PV)
  - Level Income
✅ Daily capping per plan

### Admin Panel
✅ Dashboard statistics API
✅ User management
✅ Settings management (General, SEO, Hero, Email)
✅ Team reports

### Frontend Pages
✅ Landing Page
✅ Login/Register Pages
✅ User Dashboard
✅ Admin Dashboard
✅ Team Tree & List
✅ Earnings & Transactions
✅ Profile Management
✅ Plans Page
✅ About & Contact Pages

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/sign-in/email` - Login with email
- `POST /api/auth/sign-in/username` - Login with username
- `POST /api/auth/lookup-referral` - Lookup user by referral ID
- `GET /api/auth/get-session` - Get current session
- `POST /api/auth/sign-out` - Logout

### User (Requires JWT Token)
- `GET /api/user/profile` - Get user profile with wallet & team info
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/dashboard` - Get dashboard statistics
- `GET /api/user/team/tree` - Get binary team tree
- `GET /api/user/team/list` - Get team members list
- `GET /api/user/referral/{referral_id}` - Get referral info (public)

### Plans
- `GET /api/plans` - Get all active plans (public)
- `POST /api/plans/activate` - Activate plan (requires auth)

### Wallet & Transactions (Requires JWT Token)
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history

### Withdrawal (Requires JWT Token)
- `POST /api/withdrawal/request` - Create withdrawal request
- `GET /api/withdrawal/history` - Get withdrawal history

### Admin (Requires Admin JWT Token)
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/users` - Get all users with search
- `PUT /api/admin/users/{user_id}/status` - Activate/deactivate user
- `GET /api/admin/withdrawals` - Get all withdrawal requests
- `PUT /api/admin/withdrawals/{id}/approve` - Approve withdrawal
- `PUT /api/admin/withdrawals/{id}/reject` - Reject withdrawal
- `GET /api/admin/plans` - Get all plans
- `POST /api/admin/plans` - Create new plan
- `PUT /api/admin/plans/{plan_id}` - Update plan

### Settings
- `GET /api/settings/public` - Get public settings
- `GET /api/settings` - Get all settings (admin)
- `PUT /api/settings/general` - Update general settings
- `PUT /api/settings/seo` - Update SEO settings
- `PUT /api/settings/hero` - Update hero settings
- `GET /api/settings/email-configuration` - Get email config
- `POST /api/settings/email-configuration` - Update email config

### Health
- `GET /` - API root
- `GET /api/health` - Health check

## 🗄️ Database Collections

- **users** - User accounts and profiles
- **plans** - Membership plans
- **wallets** - User wallet balances
- **transactions** - Transaction history
- **teams** - Binary tree structure
- **withdrawals** - Withdrawal requests
- **settings** - Platform settings
- **email_configs** - Email configuration

## 🔄 Services Status

Check running services:
```bash
# Backend
curl http://localhost:8001/api/health

# Frontend
curl http://localhost:3000

# All services (supervisor)
sudo supervisorctl status
```

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017/
MONGO_DB_NAME=mlm_vsv_unite
JWT_SECRET_KEY=vsv_unite_super_secret_key_change_in_production_2024
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=10080
ADMIN_EMAIL=admin@vsvunite.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=VSV Admin
ADMIN_USERNAME=vsvadmin
ADMIN_REFERRAL_ID=VSV00001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## 🧪 Testing APIs

### Register New User
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password@123",
    "mobile": "9876543210",
    "referralId": "VSV00001",
    "placement": "LEFT"
  }'
```

### Login
```bash
curl -X POST http://localhost:8001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vsvunite.com",
    "password": "Admin@123"
  }'
```

### Get Plans
```bash
curl http://localhost:8001/api/plans
```

## 🛠️ Development

### Start Services (Supervisor)
```bash
sudo supervisorctl start backend
sudo supervisorctl start frontend
```

### Restart Services
```bash
sudo supervisorctl restart all
```

### View Logs
```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/backend.out.log

# Frontend logs
tail -f /var/log/supervisor/frontend.err.log
tail -f /var/log/supervisor/frontend.out.log
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Health**: http://localhost:8001/api/health
- **API Docs**: http://localhost:8001/docs (FastAPI auto-docs)

## 📦 Project Features

### User Features
- ✅ Registration with sponsor referral
- ✅ Binary placement (Left/Right)
- ✅ Unique referral ID generation
- ✅ Dashboard with statistics
- ✅ Team tree visualization
- ✅ Earnings tracking
- ✅ Transaction history
- ✅ Profile management
- ✅ Plan upgrade
- ✅ Withdrawal requests

### Admin Features
- ✅ Admin dashboard
- ✅ User management
- ✅ Plan management
- ✅ Settings configuration
- ✅ Email configuration
- ✅ Team reports
- ✅ Payout management
- ✅ Top-up approvals

## 🔮 Future Enhancements

- [ ] Real-time PV matching income calculation
- [ ] Automated withdrawal processing
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Payment gateway integration
- [ ] KYC verification
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Tax reporting

## 📄 License

Proprietary - VSV Unite

## 👨‍💻 Developer

Built by E1 AI Agent for VSV Unite Platform

---

**Note**: This is a development setup. For production deployment, ensure to:
1. Change JWT secret key
2. Use environment-based configuration
3. Enable HTTPS
4. Set up proper MongoDB replica set
5. Configure CORS for production domain
6. Enable rate limiting
7. Add comprehensive error logging
8. Set up monitoring and alerts
