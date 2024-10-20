// api/clientApi.ts

import axios from "axios";

export const fetchClientIdByName = async (
  clientName: string
): Promise<string | null> => {
  try {
    const response = await axios.get(
      `http://localhost:5000/clients/name/:name=${encodeURIComponent(
        clientName
      )}`
    );
    return response.data ? response.data.id : null; // Assuming response data has an 'id' property
  } catch (error) {
    console.error("Error fetching client by name:", error);
    return null;
  }
};
