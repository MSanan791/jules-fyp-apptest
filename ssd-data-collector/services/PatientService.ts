// Replace with your PC's IP
const API_URL = 'http://192.168.18.32:3000/api'; 

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  primary_language: string;
  initial_ssd_type: string;
  createdAt?: string;
}

export interface SessionSummary {
  id: number;
  session_date: string;
  final_session_diagnosis: string;
  upload_status: string;
  createdAt: string;
  recordings?: any[];
}

// Helper to ensure headers are always clean
const getHeaders = (token: string) => ({
  'Authorization': `Bearer ${token.trim()}`, // 🛡️ FIX: Added .trim() here
  'Content-Type': 'application/json'
});

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
    if (!response.ok) throw new Error(result.error || 'Failed to create patient');
    return result;
  } catch (error) {
    console.error("Create Patient Error:", error);
    throw error;
  }
};

export const getPatientById = async (id: number, token: string): Promise<Patient> => {
  const response = await fetch(`${API_URL}/patients/${id}`, {
    headers: getHeaders(token)
  });
  return await response.json();
};

export const getPatientSessions = async (id: number, token: string): Promise<SessionSummary[]> => {
  const response = await fetch(`${API_URL}/patients/${id}/sessions`, {
    headers: getHeaders(token)
  });
  return await response.json();
};