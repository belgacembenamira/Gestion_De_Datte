import axios from "axios";

export const fetchPersonnelIdByName = async (name: string) => {
  try {
    const response = await axios.get(`http://localhost:5000/personnels/}`);

    console.log("Réponse de l'API:", response.data);

    // Check if the response is an array and contains personnel
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].id; // Return the ID of the first personnel found
    } else {
      throw new Error("Aucun personnel trouvé");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'ID du personnel:",
      error
    );
    throw new Error("Impossible de récupérer l'ID du personnel");
  }
};
