const API_BASE_URL = 'http://localhost:8000'; // Adjust this to your Django server URL

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  tourDate: string;
  issueCount: number;
  criticalIssues: number;
  highIssues: number;
  moderateIssues: number;
  imageUrl: string;
  grade: string;
  estimatedPrice: number;
  listPrice: number;
  ourEstimate: number;
  estimatedRepairCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  concernLevel: number;
  imageUrl: string;
  detectedDate: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  createdAt: string;
}

export interface PropertyWithIssues extends Property {
  issues: Issue[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        data: data.success ? data.data : undefined,
        error: data.success ? undefined : data.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getProperties(): Promise<ApiResponse<Property[]>> {
    const response = await this.request<Property[]>('/api/properties/');
    return {
      success: response.success,
      data: response.data,
      error: response.error,
    };
  }

  async getPropertyDetails(propertyId: string): Promise<ApiResponse<PropertyWithIssues>> {
    const response = await this.request<PropertyWithIssues>(`/api/properties/${propertyId}/`);
    return {
      success: response.success,
      data: response.data,
      error: response.error,
    };
  }

  async analyzePropertyImage(propertyId: string, imageUrl: string): Promise<ApiResponse<{
    analysis: any;
    issues_created: any[];
  }>> {
    const response = await this.request<{
      analysis: any;
      issues_created: any[];
    }>('/api/analyze-image/', {
      method: 'POST',
      body: JSON.stringify({
        property_id: propertyId,
        image_url: imageUrl,
      }),
    });
    return {
      success: response.success,
      data: response.data,
      error: response.error,
    };
  }
}

export const apiService = new ApiService();
