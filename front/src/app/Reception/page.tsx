"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Grid,
} from "@mui/material";
import jsPDF from "jspdf";
import axios from "axios";
import autoTable from "jspdf-autotable";

interface Coffre {
    id: string;
    TypeCoffre: string;
    PoidsCoffre: number;
    Cin: string; // Added CIN field
}

interface TypeDeDatte {
    id: number;
    name: string;
    prix: number;
}

interface Entry {
    nbreCoffres: number;
    qtyBrut: number;
    typeCoffre: string;
    qtyNet: number;
    typeDeDatte: string;
}

export default function Page() {
    const [coffres, setCoffres] = useState<Coffre[]>([]);
    const [typesDeDatte, setTypesDeDatte] = useState<TypeDeDatte[]>([]);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [poidsCoffre, setPoidsCoffre] = useState(0);
    const [transporteur, setTransporteur] = useState("");
    const [chauffeur, setChauffeur] = useState("");
    const [chauffeurCIN, setChauffeurCIN] = useState(""); // New state for CIN
    const [version, setVersion] = useState("");

    // Fetch Coffres and Types de Datte data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coffresResponse, typesResponse] = await Promise.all([
                    axios.get("http://localhost:5000/coffres"),
                    axios.get("http://localhost:5000/types-de-dattes"),
                ]);
                setCoffres(coffresResponse.data);
                setTypesDeDatte(typesResponse.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    // Handle adding new entry
    const handleAddEntry = () => {
        setEntries([...entries, { nbreCoffres: 0, qtyBrut: 0, typeCoffre: "", qtyNet: 0, typeDeDatte: "" }]);
    };

    // Update poidsCoffre and calculate qtyNet when a new type of coffre is selected
    const handleCoffreChange = (index: number, coffreId: string) => {
        const selectedCoffre = coffres.find((coffre) => coffre.id === coffreId);
        if (selectedCoffre) {
            const updatedEntries = [...entries];
            updatedEntries[index].typeCoffre = coffreId;
            updatedEntries[index].qtyNet = updatedEntries[index].qtyBrut - (updatedEntries[index].nbreCoffres * Number(selectedCoffre.PoidsCoffre));
            setEntries(updatedEntries);
        }
    };

    // Update qtyBrut and calculate qtyNet
    const handleQtyBrutChange = (index: number, value: number) => {
        const updatedEntries = [...entries];
        updatedEntries[index].qtyBrut = value;
        if (updatedEntries[index].typeCoffre) {
            const selectedCoffre = coffres.find((coffre) => coffre.id === updatedEntries[index].typeCoffre);
            if (selectedCoffre) {
                updatedEntries[index].qtyNet = value - (updatedEntries[index].nbreCoffres * Number(selectedCoffre.PoidsCoffre));
            }
        }
        setEntries(updatedEntries);
    };

    // Update nbreCoffres and calculate qtyNet
    const handleNbreCoffresChange = (index: number, value: number) => {
        const updatedEntries = [...entries];
        updatedEntries[index].nbreCoffres = value;
        if (updatedEntries[index].typeCoffre) {
            const selectedCoffre = coffres.find((coffre) => coffre.id === updatedEntries[index].typeCoffre);
            if (selectedCoffre) {
                updatedEntries[index].qtyNet = updatedEntries[index].qtyBrut - (value * Number(selectedCoffre.PoidsCoffre));
            }
        }
        setEntries(updatedEntries);
    };

    // Handle Type de Datte change
    const handleTypeDeDatteChange = (index: number, typeDeDatte: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index].typeDeDatte = typeDeDatte;
        setEntries(updatedEntries);
    };

    // Handle PDF Generation
    const handlePrintPDF = () => {
        const doc = new jsPDF();

        // Title
        const title = "Bon de Livraison Achat sur Pieds";
        const pageWidth = doc.internal.pageSize.getWidth();
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;

        doc.setFontSize(18);
        doc.text(title, titleX, 20); // Position Y: 20

        // Version Number (left) and Date (right)
        doc.setFontSize(12);

        const versionText = `Numéro de Bon Livraison : ${version}`;
        const dateText = `Date : ${new Date().toLocaleDateString()}`;

        doc.text(versionText, 15, 40);
        const dateTextWidth = doc.getTextWidth(dateText);
        doc.text(dateText, pageWidth - dateTextWidth - 15, 40); // Right aligned date

        // Producer Info (left rectangle)
        const producerRectY = 55;
        doc.rect(15, producerRectY, 80, 50); // Rectangle for Producer Info
        doc.text(`Producteur : Taher Ajel`, 20, producerRectY + 10); // Adjusted Y margin
        doc.text(`CIN : 04853868`, 20, producerRectY + 20); // Added margin
        doc.text(`Adresse de chargement`, 20, producerRectY + 30); // Adjusted text positions
        doc.text(`4214 Jemna Kébili`, 20, producerRectY + 40); // Aligned with previous text

        // Delivery Info (right rectangle)
        const deliveryRectY = producerRectY; // Same Y position as producer info for alignment
        doc.rect(110, deliveryRectY, 80, 50); // Rectangle for Delivery Info
        doc.text(`Livré à : SODEA`, 115, deliveryRectY + 10); // Adjusted Y margin
        doc.text(`Adresse : Route de Morneg km 02 `, 115, deliveryRectY + 20); // Split onto two lines
        doc.text(`Khelidia Ben Arous`, 115, deliveryRectY + 30); // Continued address
        doc.text(`MF: 49647/J/P/M`, 115, deliveryRectY + 40); // MF after the address with adjusted margin
        // doc.text(`Chauffeur CIN: ${chauffeurCIN}`, 115, deliveryRectY + 50); // New chauffeur CIN

        // Table Header and Body
        const headers = [["Nbre de Caisses", "Type de Caisse", "Type de Datte", "Qty Brut (Kg)", "Qty Net (Kg)"]];

        // Calculating totals
        let totalBrut = 0;
        let totalNet = 0;
        let totalCaisse = 0;

        const body = entries.map(entry => {
            totalBrut += entry.qtyBrut;
            totalNet += entry.qtyNet;
            totalCaisse += entry.nbreCoffres;
            const selectedCoffre = coffres.find(coffre => coffre.id === entry.typeCoffre);
            const selectedTypeDeDatte = typesDeDatte.find(type => type.id === Number(entry.typeDeDatte));
            return [
                entry.nbreCoffres,
                selectedCoffre?.TypeCoffre || "",
                selectedTypeDeDatte?.name || "",
                entry.qtyBrut,
                entry.qtyNet,
            ];
        });

        // Add autoTable for better table formatting
        autoTable(doc, {
            startY: deliveryRectY + 60, // Add margin after delivery info
            head: headers,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [255, 0, 0] },
            styles: { fontSize: 12 },
            didDrawPage: (data) => {
                // Summary Info (Totals)
                doc.setFontSize(12);
                const currentY = data.cursor.y + 10; // Position just below the table

                // Display Total Brut and Total Net
                doc.text(`Total Caisses: ${totalCaisse}`, 15, currentY);
                doc.text(`Total Qty Brut (Kg): ${totalBrut}`, 15, currentY + 10);
                doc.text(`Total Qty Net (Kg): ${totalNet}`, 15, currentY + 18);
                // Transport Info
                const transportRectY = currentY + 20; // Add margin after totals
                doc.rect(15, transportRectY, 170, 50); // Adjusted for better spacing
                doc.text(`Transporteur : `, 20, transportRectY + 10); // Added margin within the rectangle
                doc.text(`Camion : ${transporteur}`, 20, transportRectY + 20);
                doc.text(`Chauffeur : ${chauffeur}`, 20, transportRectY + 30);
                doc.text(`Chauffeur CIN : ${chauffeurCIN}`, 20, transportRectY + 40); // Added chauffeur CIN

                // Footer
                const footerY = transportRectY + 70; // Add margin after transport info

            }
        });

        // Save PDF
        doc.save(`BonLivraison_${version}.pdf`);
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Bon de Livraison</Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Transporteur"
                        value={transporteur}
                        onChange={(e) => setTransporteur(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Chauffeur"
                        value={chauffeur}
                        onChange={(e) => setChauffeur(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Chauffeur CIN" // Added field for Chauffeur's CIN
                        value={chauffeurCIN}
                        onChange={(e) => setChauffeurCIN(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />
                </Grid>

                {/* Entries Form */}
                {entries.map((entry, index) => (
                    <Grid container spacing={2} key={index}>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Nbre de Caisses"
                                type="number"
                                value={entry.nbreCoffres}
                                onChange={(e) => handleNbreCoffresChange(index, Number(e.target.value))}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Type de Coffre"
                                select
                                value={entry.typeCoffre}
                                onChange={(e) => handleCoffreChange(index, e.target.value)}
                                fullWidth
                            >
                                {coffres.map((coffre) => (
                                    <MenuItem key={coffre.id} value={coffre.id}>
                                        {coffre.TypeCoffre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Type de Datte"
                                select
                                value={entry.typeDeDatte}
                                onChange={(e) => handleTypeDeDatteChange(index, e.target.value)}
                                fullWidth
                            >
                                {typesDeDatte.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Qty Brut (Kg)"
                                type="number"
                                value={entry.qtyBrut}
                                onChange={(e) => handleQtyBrutChange(index, Number(e.target.value))}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Qty Net (Kg)"
                                type="number"
                                value={entry.qtyNet}
                                disabled
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                ))}

                <Grid item xs={12}>
                    <Button variant="outlined" onClick={handleAddEntry}>Ajouter une entrée</Button>
                </Grid>

                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handlePrintPDF}>
                        Imprimer Bon de Livraison
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}
