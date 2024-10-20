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
    PoidsCoffre: number; // Make sure this is a number for calculation
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
    qtyNet: number; // Add qtyNet directly to Entry
}

export default function Page() {
    const [coffres, setCoffres] = useState<Coffre[]>([]);
    const [typesDeDatte, setTypesDeDatte] = useState<TypeDeDatte[]>([]);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [poidsCoffre, setPoidsCoffre] = useState(0);
    const [transporteur, setTransporteur] = useState("");
    const [chauffeur, setChauffeur] = useState("");
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
        setEntries([...entries, { nbreCoffres: 0, qtyBrut: 0, typeCoffre: "", qtyNet: 0 }]);
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

        // Position the versionText at the left (X = 15)
        doc.text(versionText, 15, 40);

        // Position the dateText at the right (aligned with the right side of the page)
        const dateTextWidth = doc.getTextWidth(dateText);
        doc.text(dateText, pageWidth - dateTextWidth - 15, 40); // Adjusted X position for right alignment

        // Producer Info (left rectangle)
        const producerRectY = 55; // Position Y for the Producer Info rectangle
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
        doc.text(`MF: 49647/J/P/M`, 115, deliveryRectY + 45); // MF after the address with adjusted margin

        // Table Header and Body
        const headers = [["Nbre de Caisses", "Qty Brut (Kg)", "Qty Net (Kg)"]];

        // Calculating totals
        let totalBrut = 0;
        let totalNet = 0;

        const body = entries.map(entry => {
            totalBrut += entry.qtyBrut;
            totalNet += entry.qtyNet;
            return [
                entry.nbreCoffres,
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
                // doc.text(`Total Brut (Kg) : ${totalBrut.toFixed(2)}`, 15, currentY);
                // doc.text(`Total Net (Kg) : ${totalNet.toFixed(2)}`, 15, currentY + 10); // Add 10 for space after total brut

                // Transport Info
                const transportRectY = currentY + 20; // Add margin after totals
                doc.rect(15, transportRectY, 170, 50); // Adjusted for better spacing
                doc.text(`Transporteur :`, 20, transportRectY + 10); // Added margin within the rectangle
                doc.text(`Camion : ${transporteur}`, 20, transportRectY + 20);
                doc.text(`Chauffeur : ${chauffeur}`, 20, transportRectY + 30);

                // Footer
                const footerY = transportRectY + 60; // Add margin after transport info
                doc.text("Signature Ferme", 20, footerY);
                doc.text("Signature & Cache SODEA", 150, footerY);
            }
        });

        // Save the PDF
        doc.save("bon_de_livraison.pdf");
    };







    return (
        <Box
            p={4}
            sx={{
                backgroundColor: "#f0f0f0",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                maxWidth: 800,
                margin: "0 auto",
            }}
        >
            <Typography variant="h4" gutterBottom align="center">
                Bon de Livraison
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Transporteur"
                        variant="outlined"
                        fullWidth
                        value={transporteur}
                        onChange={(e) => setTransporteur(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Chauffeur"
                        variant="outlined"
                        fullWidth
                        value={chauffeur}
                        onChange={(e) => setChauffeur(e.target.value)}
                    />
                </Grid>
                {/* Dynamic Entry Fields */}
                {entries.map((entry, index) => (
                    <React.Fragment key={index}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nombre de Coffres"
                                variant="outlined"
                                type="number"
                                fullWidth
                                value={entry.nbreCoffres}
                                onChange={(e) => handleNbreCoffresChange(index, Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Qty Brut"
                                variant="outlined"
                                type="number"
                                fullWidth
                                value={entry.qtyBrut}
                                onChange={(e) => handleQtyBrutChange(index, Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Type de Coffre"
                                fullWidth
                                value={entry.typeCoffre}
                                onChange={(e) => handleCoffreChange(index, e.target.value)}
                            >
                                {coffres.map((coffre) => (
                                    <MenuItem key={coffre.id} value={coffre.id}>
                                        {coffre.TypeCoffre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Qty Net"
                                variant="outlined"
                                type="number"
                                fullWidth
                                value={entry.qtyNet} // Display the calculated qtyNet
                                disabled // Disable editing, as it's auto-calculated
                            />
                        </Grid>
                    </React.Fragment>
                ))}
            </Grid>

            <Button variant="contained" color="primary" onClick={handleAddEntry} sx={{ mt: 3 }}>
                Ajouter un Entrée
            </Button>

            <Button variant="contained" color="secondary" onClick={handlePrintPDF} sx={{ mt: 3, ml: 2 }}>
                Imprimer PDF
            </Button>
        </Box>
    );
}
