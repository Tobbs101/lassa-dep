// FastAPI ML Integration Layer
// This module handles communication with the ML engineer's FastAPI backend

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
const API_KEY = process.env.FASTAPI_API_KEY;

// Updated interfaces to match the ML engineer's API
interface OutbreakSummaryResponse {
  metadata: {
    generated_at: string;
    data_file: string;
    total_records: number;
  };
  kpi: {
    confirmed_cases: number;
    recoveries: number;
    deaths: number;
    fatality_rate_percent: number;
    recovery_rate_percent: number;
    states_affected: number;
    lgas_affected: number;
  };
  demographics: {
    age_groups: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    gender: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  lga_breakdown: Array<{
    lga: string;
    state: string;
    cases: number;
    deaths: number;
    recovery_rate_percent: number;
    last_update: string | null;
  }>;
}

class FastAPIClient {
  private baseURL: string;
  private apiKey: string | undefined;

  constructor() {
    this.baseURL = FASTAPI_URL;
    this.apiKey = API_KEY;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`FastAPI request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('FastAPI request error:', error);
      throw error;
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<{ message: string; endpoints: string[] }> {
    return this.makeRequest('/');
  }

  // Get outbreak summary data (main endpoint from ML engineer)
  async getOutbreakSummary(): Promise<OutbreakSummaryResponse> {
    return this.makeRequest('/summary');
  }

  // Get outbreak summary with specific parameters
  async getOutbreakSummaryWithParams(params?: { spm?: string }): Promise<OutbreakSummaryResponse> {
    const queryParams = new URLSearchParams();
    if (params?.spm) {
      queryParams.append('spm', params.spm);
    }
    
    const endpoint = `/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Upload dataset to ML API for processing
  async uploadDataset(file: File, uploadType: string): Promise<{
    success: boolean;
    message?: string;
    recordsProcessed?: number;
    error?: string;
  }> {
    const url = `${this.baseURL}/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', uploadType);

    const headers: HeadersInit = {};
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Upload successful',
        recordsProcessed: result.records_processed || result.recordCount,
      };
    } catch (error) {
      console.error('FastAPI upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

// Export singleton instance
export const fastapiClient = new FastAPIClient();

// Utility functions for outbreak data processing
export const mlUtils = {
  // Format outbreak summary data for dashboard display
  formatOutbreakSummary: (data: OutbreakSummaryResponse) => {
    return {
      ...data,
      formatted_metadata: {
        ...data.metadata,
        generated_at: new Date(data.metadata.generated_at).toLocaleString(),
      },
      risk_assessment: {
        overall_risk: data.kpi.fatality_rate_percent > 10 ? 'high' : 
                     data.kpi.fatality_rate_percent > 5 ? 'medium' : 'low',
        priority_areas: data.lga_breakdown
          .filter(lga => lga.cases > 10 || lga.deaths > 0)
          .sort((a, b) => b.cases - a.cases)
          .slice(0, 5),
      },
    };
  },

  // Calculate trend indicators
  calculateTrends: (currentData: OutbreakSummaryResponse, previousData?: OutbreakSummaryResponse) => {
    if (!previousData) return null;
    
    return {
      cases_trend: currentData.kpi.confirmed_cases - previousData.kpi.confirmed_cases,
      deaths_trend: currentData.kpi.deaths - previousData.kpi.deaths,
      recovery_trend: currentData.kpi.recoveries - previousData.kpi.recoveries,
      fatality_trend: currentData.kpi.fatality_rate_percent - previousData.kpi.fatality_rate_percent,
    };
  },

  // Format LGA data for map visualization
  formatLGAForMap: (lgaData: OutbreakSummaryResponse['lga_breakdown']) => {
    return lgaData.map(lga => ({
      ...lga,
      risk_level: lga.cases > 50 ? 'high' : lga.cases > 20 ? 'medium' : 'low',
      coordinates: null, // Would need to be added from a mapping service
    }));
  },

  // Generate alert recommendations based on data
  generateAlertRecommendations: (data: OutbreakSummaryResponse): string[] => {
    const recommendations: string[] = [];
    
    if (data.kpi.fatality_rate_percent > 15) {
      recommendations.push('🚨 High fatality rate detected - immediate intervention required');
    }
    
    if (data.kpi.lgas_affected > 20) {
      recommendations.push('⚠️ Wide geographic spread - consider regional response');
    }
    
    const highRiskLGAs = data.lga_breakdown.filter(lga => lga.cases > 30);
    if (highRiskLGAs.length > 0) {
      recommendations.push(`📍 Focus on ${highRiskLGAs.length} high-risk LGAs`);
    }
    
    if (data.kpi.recovery_rate_percent < 50) {
      recommendations.push('🏥 Low recovery rate - review treatment protocols');
    }
    
    return recommendations;
  },
};
