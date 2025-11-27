# AI4Lassa Backend Setup Guide

This guide will help you set up the complete backend infrastructure for the AI4Lassa project using Supabase and FastAPI integration.

## 🚀 Quick Start

### 1. Supabase Project Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Set up the Database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase-schema.sql`
   - This will create all tables, indexes, and RLS policies

4. **Configure Storage**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `ai4lassa-documents`
   - **Keep it PRIVATE** (do not set to public for security)
   - Configure RLS policies for the bucket:

   **Storage RLS Policies** (run in SQL Editor):
   ```sql
   -- Allow authenticated users to upload files
   CREATE POLICY "Users can upload files" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'ai4lassa-documents' 
     AND auth.role() = 'authenticated'
   );

   -- Allow users to view their own files
   CREATE POLICY "Users can view own files" ON storage.objects
   FOR SELECT USING (
     bucket_id = 'ai4lassa-documents' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Allow health professionals to view all files
   CREATE POLICY "Health professionals can view all files" ON storage.objects
   FOR SELECT USING (
     bucket_id = 'ai4lassa-documents' 
     AND EXISTS (
       SELECT 1 FROM public.profiles p 
       WHERE p.id = auth.uid() 
       AND p.role IN ('health_professional', 'public_health_official', 'admin')
     )
   );
   ```

### 2. FastAPI Integration Setup

1. **Configure FastAPI Environment**
   ```env
   NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
   FASTAPI_API_KEY=your_fastapi_api_key
   ```

2. **Expected FastAPI Endpoints**
   Your ML guy should implement these endpoints:
   ```
   GET  /health                    - Health check
   GET  /models                    - Available models
   POST /predict/outbreak          - Outbreak detection
   POST /predict/case-classification - Case classification
   POST /predict/risk-assessment   - Risk assessment
   POST /predict/batch             - Batch predictions
   GET  /models/{name}/metrics     - Model performance
   POST /models/{name}/retrain     - Model retraining
   GET  /predictions/history       - Prediction history
   ```

### 3. Authentication Setup

The system supports multiple user roles:
- **admin**: Full system access
- **health_professional**: Can view and create cases
- **public_health_official**: Can manage alerts and cases
- **researcher**: Can view data and run predictions
- **viewer**: Read-only access

### 4. Database Schema Overview

#### Core Tables:
- **profiles**: User profiles and roles
- **states/lgas**: Nigerian states and local government areas
- **health_facilities**: Healthcare facilities
- **lassa_cases**: Individual Lassa fever cases
- **outbreak_alerts**: AI-generated outbreak alerts
- **epidemiological_data**: Environmental and health data
- **ml_predictions**: ML model predictions and results

#### Key Features:
- **Row Level Security (RLS)**: Data access control
- **Real-time subscriptions**: Live alert updates
- **Audit logging**: Track all system changes
- **File storage**: Document and image uploads

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

### Authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Alerts
- `GET /api/alerts` - Get outbreak alerts
- `POST /api/alerts` - Create new alert

### ML Integration
- `POST /api/ml/predict` - Run ML predictions
- `GET /api/ml/predict` - Get model info/history

### File Storage
- `POST /api/storage/upload` - Upload files
- `GET /api/storage/upload` - List files

## 🔒 Security Features

1. **Authentication**: Supabase Auth with JWT tokens
2. **Authorization**: Role-based access control
3. **Data Protection**: Row Level Security policies
4. **Audit Trail**: Complete action logging
5. **File Validation**: Type and size restrictions

## 📊 Real-time Features

- **Live Alerts**: Real-time outbreak notifications
- **Browser Notifications**: Push notifications for critical alerts
- **Auto-updates**: Dashboard updates without refresh

## 🧪 Testing the Setup

1. **Test Authentication**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","fullName":"Test User","role":"health_professional"}'
   ```

2. **Test ML Integration**:
   ```bash
   curl -X POST http://localhost:3000/api/ml/predict \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prediction_type":"risk_assessment","location_data":{"lga_id":"test-lga","coordinates":[8.5,9.0]}}'
   ```

3. **Test Real-time Alerts**:
   - Open the app in multiple browser tabs
   - Create an alert in one tab
   - Watch it appear in real-time in other tabs

## 🚨 Troubleshooting

### Common Issues:

1. **Supabase Connection Error**
   - Check your environment variables
   - Verify your Supabase project is active
   - Ensure RLS policies are properly configured

2. **FastAPI Integration Issues**
   - Verify the FastAPI server is running
   - Check the API endpoint URLs
   - Ensure proper CORS configuration

3. **Authentication Problems**
   - Check JWT token validity
   - Verify user roles in the database
   - Ensure RLS policies allow access

4. **Real-time Not Working**
   - Check Supabase real-time is enabled
   - Verify WebSocket connections
   - Check browser notification permissions

## 📈 Performance Optimization

1. **Database Indexes**: Already configured for optimal performance
2. **Caching**: Implement Redis for frequently accessed data
3. **CDN**: Use Supabase CDN for file storage
4. **Monitoring**: Set up Supabase monitoring and alerts

## 🔄 Deployment

### Vercel Deployment:
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Supabase Production:
1. Upgrade to Supabase Pro for production features
2. Configure custom domains
3. Set up monitoring and backups

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check FastAPI integration logs
4. Contact the development team

---

**Next Steps:**
1. Set up your Supabase project
2. Configure environment variables
3. Run the database schema
4. Test the authentication flow
5. Integrate with your ML guy's FastAPI
6. Deploy to production

The backend is now ready to support the AI4Lassa frontend with real-time alerts, ML integration, and secure data management! 🎉
