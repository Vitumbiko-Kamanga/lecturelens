const API_BASE_URL = "http://10.1.24.190:5000";

export const api = {
  async testBackend() {
    const response = await fetch(`${API_BASE_URL}/`);

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json();
  },

  async testDatabase() {
    const response = await fetch(`${API_BASE_URL}/db-test`);

    if (!response.ok) {
      throw new Error(`Database request failed: ${response.status}`);
    }

    return response.json();
  },
};