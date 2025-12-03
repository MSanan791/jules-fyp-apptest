// Replace with your PC's IP
const API_URL = 'http://192.168.18.32:3000/api'; 

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  initial_ssd_type?: string;
  last_session_date?: string; // We'll compute this later
}

export const getPatients = async (token: string): Promise<Patient[]> => {
  try {
    const response = await fetch(`${API_URL}/patients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch patients');
    return await response.json();
  } catch (error) {
    console.error("Get Patients Error:", error);
    throw error;
  }
};

export const createPatient = async (patientData: any, token: string) => {
  try {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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