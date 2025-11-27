-- AI4Lassa Database Schema
-- This file contains the complete database schema for the AI4Lassa project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'health_professional', 'researcher', 'public_health_official', 'viewer');

-- Alert severity levels
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Alert status
CREATE TYPE alert_status AS ENUM ('active', 'investigating', 'resolved', 'false_positive');

-- Case status
CREATE TYPE case_status AS ENUM ('suspected', 'probable', 'confirmed', 'discarded');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'viewer',
    institution TEXT,
    department TEXT,
    phone_number TEXT,
    specialization TEXT,
    license_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- States and LGAs (Local Government Areas) in Nigeria
CREATE TABLE public.states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    region TEXT NOT NULL,
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.lgas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    state_id UUID REFERENCES public.states(id) ON DELETE CASCADE,
    population INTEGER,
    coordinates GEOMETRY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health facilities
CREATE TABLE public.health_facilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- hospital, clinic, health_center, etc.
    lga_id UUID REFERENCES public.lgas(id) ON DELETE CASCADE,
    address TEXT,
    coordinates GEOMETRY(POINT, 4326),
    contact_phone TEXT,
    contact_email TEXT,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lassa fever cases
CREATE TABLE public.lassa_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_number TEXT UNIQUE NOT NULL,
    patient_name TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    status case_status NOT NULL,
    health_facility_id UUID REFERENCES public.health_facilities(id),
    lga_id UUID REFERENCES public.lgas(id) ON DELETE CASCADE,
    symptoms TEXT[],
    onset_date DATE,
    diagnosis_date DATE,
    lab_confirmation_date DATE,
    outcome TEXT, -- recovered, died, ongoing
    outcome_date DATE,
    travel_history TEXT,
    contact_history TEXT,
    risk_factors TEXT[],
    lab_results JSONB,
    treatment_notes TEXT,
    reported_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outbreak alerts
CREATE TABLE public.outbreak_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    severity alert_severity NOT NULL,
    status alert_status DEFAULT 'active',
    lga_id UUID REFERENCES public.lgas(id) ON DELETE CASCADE,
    health_facility_id UUID REFERENCES public.health_facilities(id),
    case_count INTEGER DEFAULT 0,
    suspected_cases INTEGER DEFAULT 0,
    confirmed_cases INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    ml_model_version TEXT,
    data_sources TEXT[],
    coordinates GEOMETRY(POINT, 4326),
    radius_km DECIMAL(8,2),
    first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert notifications
CREATE TABLE public.alert_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alert_id UUID REFERENCES public.outbreak_alerts(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- email, sms, push, dashboard
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_status TEXT DEFAULT 'pending' -- pending, sent, delivered, failed
);

-- Environmental and epidemiological data
CREATE TABLE public.epidemiological_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lga_id UUID REFERENCES public.lgas(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    data_type TEXT NOT NULL, -- weather, population_movement, vector_density, etc.
    data_source TEXT NOT NULL,
    raw_data JSONB,
    processed_data JSONB,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML model predictions and results
CREATE TABLE public.ml_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    prediction_type TEXT NOT NULL, -- outbreak_risk, case_classification, etc.
    input_data JSONB NOT NULL,
    prediction_result JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    lga_id UUID REFERENCES public.lgas(id),
    alert_id UUID REFERENCES public.outbreak_alerts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs and audit trail
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads and documents
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    related_table TEXT, -- cases, alerts, etc.
    related_id UUID,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_institution ON public.profiles(institution);
CREATE INDEX idx_lgas_state_id ON public.lgas(state_id);
CREATE INDEX idx_health_facilities_lga_id ON public.health_facilities(lga_id);
CREATE INDEX idx_lassa_cases_lga_id ON public.lassa_cases(lga_id);
CREATE INDEX idx_lassa_cases_status ON public.lassa_cases(status);
CREATE INDEX idx_lassa_cases_created_at ON public.lassa_cases(created_at);
CREATE INDEX idx_outbreak_alerts_lga_id ON public.outbreak_alerts(lga_id);
CREATE INDEX idx_outbreak_alerts_severity ON public.outbreak_alerts(severity);
CREATE INDEX idx_outbreak_alerts_status ON public.outbreak_alerts(status);
CREATE INDEX idx_outbreak_alerts_created_at ON public.outbreak_alerts(created_at);
CREATE INDEX idx_epidemiological_data_lga_date ON public.epidemiological_data(lga_id, date);
CREATE INDEX idx_ml_predictions_created_at ON public.ml_predictions(created_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lassa_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbreak_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epidemiological_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Health professionals can view other profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('health_professional', 'public_health_official', 'admin')
        )
    );

-- RLS Policies for lassa_cases
CREATE POLICY "Health professionals can view all cases" ON public.lassa_cases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('health_professional', 'public_health_official', 'admin', 'researcher')
        )
    );

CREATE POLICY "Health professionals can insert cases" ON public.lassa_cases
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('health_professional', 'public_health_official', 'admin')
        )
    );

-- RLS Policies for outbreak_alerts
CREATE POLICY "All authenticated users can view alerts" ON public.outbreak_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Health officials can manage alerts" ON public.outbreak_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('public_health_official', 'admin')
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_facilities_updated_at BEFORE UPDATE ON public.health_facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lassa_cases_updated_at BEFORE UPDATE ON public.lassa_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial data for Nigerian states
INSERT INTO public.states (name, code, region) VALUES
('Abia', 'AB', 'South East'),
('Adamawa', 'AD', 'North East'),
('Akwa Ibom', 'AK', 'South South'),
('Anambra', 'AN', 'South East'),
('Bauchi', 'BA', 'North East'),
('Bayelsa', 'BY', 'South South'),
('Benue', 'BE', 'North Central'),
('Borno', 'BO', 'North East'),
('Cross River', 'CR', 'South South'),
('Delta', 'DE', 'South South'),
('Ebonyi', 'EB', 'South East'),
('Edo', 'ED', 'South South'),
('Ekiti', 'EK', 'South West'),
('Enugu', 'EN', 'South East'),
('FCT', 'FC', 'North Central'),
('Gombe', 'GO', 'North East'),
('Imo', 'IM', 'South East'),
('Jigawa', 'JI', 'North West'),
('Kaduna', 'KD', 'North West'),
('Kano', 'KN', 'North West'),
('Katsina', 'KT', 'North West'),
('Kebbi', 'KE', 'North West'),
('Kogi', 'KO', 'North Central'),
('Kwara', 'KW', 'North Central'),
('Lagos', 'LA', 'South West'),
('Nasarawa', 'NA', 'North Central'),
('Niger', 'NI', 'North Central'),
('Ogun', 'OG', 'South West'),
('Ondo', 'ON', 'South West'),
('Osun', 'OS', 'South West'),
('Oyo', 'OY', 'South West'),
('Plateau', 'PL', 'North Central'),
('Rivers', 'RI', 'South South'),
('Sokoto', 'SO', 'North West'),
('Taraba', 'TA', 'North East'),
('Yobe', 'YO', 'North East'),
('Zamfara', 'ZA', 'North West');
