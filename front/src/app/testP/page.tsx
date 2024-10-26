"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Container,
    TextField,
    Button,
    Grid,
    MenuItem,
    Typography,
    IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TypeDeDatte {
    id: number;
    name: string;
    prix: number;
}

interface Coffre {
    id: string;
    TypeCoffre: string;
    PoidsCoffre: string;
}

interface CommandeData {
    typeDeDatteId: number;
    typeDeDatteName: string;
    prix: number;
    coffreId: string; // Add this line
    nameDeCoffre: string;
    quantiteCoffre: number;
    quantiteBrut: number; // New field for brut quantity
    brut: number;
    net: number;
}

const Page: React.FC = () => {
    const [clientName, setClientName] = useState<string>("");
    const [typesDeDatte, setTypesDeDatte] = useState<TypeDeDatte[]>([]);
    const [coffres, setCoffres] = useState<Coffre[]>([]);
    const [commandeData, setCommandeData] = useState<CommandeData[]>([]);
    const [totalPrix, setTotalPrix] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesResponse, coffresResponse] = await Promise.all([
                    axios.get("http://localhost:5000/types-de-dattes"),
                    axios.get("http://localhost:5000/coffres"),
                ]);
                setTypesDeDatte(typesResponse.data);
                setCoffres(coffresResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    title: "Error",
                    text: "Unable to fetch data!",
                    icon: "error",
                });
            }
        };
        fetchData();
    }, []);

    const calculateTotalPrice = (data: CommandeData[]) => {
        const total = data.reduce((acc, curr) => acc + (curr.brut || 0), 0);
        setTotalPrix(total);
    };

    const handleAddType = () => {
        setCommandeData([
            ...commandeData,
            {
                typeDeDatteId: 0,
                typeDeDatteName: "",
                prix: 0,
                quantiteCoffre: 0,
                quantiteBrut: 0, // Initialize with default value
                brut: 0,
                net: 0,
                nameDeCoffre: "",
                coffreId: ""
            },
        ]);
    };

    const handleTypeChange = (index: number, field: keyof CommandeData, value: any) => {
        const updatedData = [...commandeData];
        updatedData[index][field] = value;

        if (field === "typeDeDatteId") {
            const selectedType = typesDeDatte.find((type) => type.id === value);
            if (selectedType) {
                updatedData[index].typeDeDatteName = selectedType.name || "N/A";
                // Update price directly
                updatedData[index].prix = parseFloat((selectedType.prix + 0.2).toString()) || 0.2;
            } else {
                updatedData[index].typeDeDatteName = "Unknown";
                updatedData[index].prix = 0.2;
            }
        }

        // Recalculate brut and net values based on the input
        if (field === "quantiteBrut") {
            const quantiteBrut = value || 0;
            updatedData[index].brut = quantiteBrut;

            const selectedCoffre = coffres.find(coffre => coffre.TypeCoffre === updatedData[index].nameDeCoffre);
            if (selectedCoffre) {
                // Ensure quantiteCoffre is defined before using it
                const quantiteCoffre = updatedData[index].quantiteCoffre || 0;
                // Correct net calculation
                updatedData[index].net = quantiteBrut - (quantiteCoffre * parseFloat(selectedCoffre.PoidsCoffre));
            } else {
                updatedData[index].net = quantiteBrut; // Default to brut if no coffre is found
            }
        }

        if (field === "quantiteCoffre") {
            const quantiteCoffre = value || 0;
            const selectedCoffre = coffres.find(coffre => coffre.TypeCoffre === updatedData[index].nameDeCoffre);
            if (selectedCoffre) {
                updatedData[index].net = updatedData[index].brut - (quantiteCoffre * parseFloat(selectedCoffre.PoidsCoffre));
            } else {
                updatedData[index].net = updatedData[index].brut; // Default to brut if no coffre is found
            }
        }

        if (field === "nameDeCoffre") {
            const selectedCoffre = coffres.find(coffre => coffre.TypeCoffre === value);
            updatedData[index].nameDeCoffre = selectedCoffre ? selectedCoffre.TypeCoffre : "N/A";
        }

        setCommandeData(updatedData);
        calculateTotalPrice(updatedData);
    };


    // Modify the handleSave function to ensure that the prix is used when sending data
    const handleSave = async () => {
        try {
            // Validate and transform commandeData if needed
            const validatedCommandeData = commandeData.map(item => {
                // Ensure prix is a number
                const prix = typeof item.prix === 'number' ? item.prix : parseFloat(item.prix) || 0;

                return {
                    ...item,
                    prix: prix, // Send prix as is, without adding 0.2
                };
            });

            // Log the data being sent for debugging
            console.log("Data being sent:", {
                clientName,
                commandeData: validatedCommandeData,
            });

            const response = await axios.post("http://localhost:5000/commande-data", {
                clientName,
                commandeData: validatedCommandeData,
            });

            Swal.fire({
                title: "Success",
                text: "Commande saved successfully!",
                icon: "success",
            });
            // Optionally clear the form or reset state here
            setCommandeData([]); // Clear the form after saving
            setClientName(""); // Reset the client name
        } catch (error) {
            console.error("Error saving commande:", error);
            Swal.fire({
                title: "Error",
                text: "Unable to save commande!",
                icon: "error",
            });
        }
    };




    const handleDeleteType = (index: number) => {
        const updatedData = commandeData.filter((_, i) => i !== index);
        setCommandeData(updatedData);
        calculateTotalPrice(updatedData);
    };










    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Commande de Dattes Taher Ajel
            </Typography>
            {/* <TextField
                label="Nom du Client"
                variant="outlined"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                fullWidth
                margin="normal"
            /> */}

            {commandeData.map((data, index) => (
                <Grid container spacing={2} key={index} alignItems="center" marginTop={2}>

                    <Grid item xs={4}>
                        <TextField
                            select
                            label="Nom du Coffre"
                            value={data.nameDeCoffre}
                            onChange={(e) => handleTypeChange(index, "nameDeCoffre", e.target.value)}
                            fullWidth
                        >
                            {coffres.map((coffre) => (
                                <MenuItem key={coffre.id} value={coffre.TypeCoffre}>
                                    {coffre.TypeCoffre}
                                </MenuItem>
                            ))}
                        </TextField>

                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            select
                            label="Type de Datte"
                            value={data.typeDeDatteId}
                            onChange={(e) => handleTypeChange(index, "typeDeDatteId", parseInt(e.target.value))}
                            fullWidth
                        >
                            {typesDeDatte.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            label="Quantité Coffre"
                            type="number"
                            value={data.quantiteCoffre}
                            onChange={(e) => handleTypeChange(index, "quantiteCoffre", parseFloat(e.target.value))}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            label="Quantité Brut"
                            type="number"
                            value={data.quantiteBrut}
                            onChange={(e) => handleTypeChange(index, "quantiteBrut", parseFloat(e.target.value))}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <IconButton color="error" onClick={() => handleDeleteType(index)}>
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button variant="contained" onClick={handleAddType}>
                Ajouter Type de Datte
            </Button>

            <Button variant="contained" color="secondary" onClick={handleSave}>
                Sauvegarder
            </Button>
        </Container>
    );
};

export default Page;
