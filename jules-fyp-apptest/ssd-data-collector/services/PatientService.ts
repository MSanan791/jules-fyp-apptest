import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.PATIENTS; 

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  primary_language: string;
  initial_ssd_type: string;
  additional_info?: string;
  createdAt?: string;
}

export interface SessionSummary {
  id: number;
  session_date: string;
  final_session_diagnosis: string;
  upload_status: string;
  status?: string;
  test_protocol_name?: string;
  createdAt: string;
  created_at?: string;
  recordings?: any[];
}

// Helper to ensure headers are always clean
const getHeaders = (token: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  } else {
    console.warn('No auth token provided');
  }
  return headers;
};

export const getPatients = async (token: string): Promise<Patient[]> => {
  try {
    const response = await fetch(`${API_URL}/patients`, {
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch patients');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Get Patients Error:", error);
    throw error;
  }
};

export const createPatient = async (patientData: Omit<Patient, 'id'>, token: string) => {
  try {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(patientData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      const errorMsg = result.message || result.error || 'Failed to create patient';
      console.error('Create patient error:', errorMsg, result);
      throw new Error(errorMsg);
    }

    return result;
  } catch (error) {
    console.error("Create patient error:", error);
    throw error;
  }
};

export const getPatientById = async (id: number, token: string): Promise<Patient> => {
  try {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch patient');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Get Patient Error:", error);
    throw error;
  }
};

export const getPatientSessions = async (id: number, token: string): Promise<SessionSummary[]> => {
  try {
    const response = await fetch(`${API_URL}/patients/${id}/sessions`, {
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      // Return empty array if sessions endpoint fails
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Get Patient Sessions Error:", error);
    return [];
  }
};

export const deletePatient = async (id: number, token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });

    // Success responses: 200, 204 (No Content), or even 202 (Accepted)
    if (response.ok || response.status === 204 || response.status === 202) {
      return;
    }
    
    // Handle specific error cases
    if (response.status === 404) {
      // Patient not found
      throw new Error('Patient not found. It may have already been deleted.');
    }
    
    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (response.status === 403) {
      throw new Error('You do not have permission to delete this patient.');
    }
    
    // Try to get error message from response
    let errorMsg = `Failed to delete patient (Status: ${response.status})`;
    try {
      const result = await response.json();
      errorMsg = result.message || result.error || errorMsg;
    } catch {
      // Response might not be JSON
    }
    throw new Error(errorMsg);
  } catch (error) {
    console.error("Delete patient error:", error);
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

export const updatePatient = async (id: number, patientData: Partial<Patient>, token: string): Promise<Patient> => {
  try {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(patientData)
    });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Failed to update patient');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Update patient error:", error);
    throw error;
  }
};
