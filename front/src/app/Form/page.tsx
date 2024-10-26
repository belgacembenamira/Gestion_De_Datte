"use client";
import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Container, Typography, Grid, Select, InputLabel, FormControl, Paper } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const Page = () => {
    const [formData, setFormData] = useState({
        nomRecepteur: '',
        coffreId: ''
    });

    const [typesDeDatte, setTypesDeDatte] = useState([]);
    const [coffres, setCoffres] = useState([]);
    const [dateEntries, setDateEntries] = useState([{ typeDeDatteId: '', typeDeCaisse: '', prixUnitaire: 0, nombreCaisse: 0, qtyBrut: 0 }]);

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
            }
        };

        fetchData();
    }, []);

    const handleChange = (e, index) => {
        const { name, value } = e.target;
        const newEntries = [...dateEntries];
        newEntries[index] = {
            ...newEntries[index],
            [name]: value
        };
        setDateEntries(newEntries);
    };

    const handleFormDataChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddDateEntry = () => {
        setDateEntries([...dateEntries, { typeDeDatteId: '', typeDeCaisse: '', prixUnitaire: 0, nombreCaisse: 0, qtyBrut: 0 }]);
    };

    const handleRemoveDateEntry = (index) => {
        const newEntries = dateEntries.filter((_, i) => i !== index);
        setDateEntries(newEntries);
    };

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const currentDate = new Date().toLocaleDateString();

        // Title Section (aligned to left)
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text("Taher Ajel", 20, 20); // Aligned to the left margin
        doc.text("Collection des dattes", 20, 32);

        // Invoice and Receiver Details
        doc.setFontSize(12);
        const leftMargin = 20;
        const lineSpacing = 10;
        const sectionStartY = 50;

        // Invoice Number (aligned to right)
        doc.setFontSize(18);
        doc.text(`Facture `, pageWidth - 20, sectionStartY, { align: "right" });
        // Details aligned to the left
        doc.text(`Nom Fournisseur: Taher Ajel`, leftMargin, sectionStartY + lineSpacing);
        doc.text(`Nom Récepteur: ${formData.nomRecepteur}`, leftMargin, sectionStartY + 2 * lineSpacing);
        doc.text(`Date: ${currentDate}`, leftMargin, sectionStartY + 3 * lineSpacing);

        // Prepare table data
        const tableData = dateEntries.map(entry => {
            const typeDeDatte = typesDeDatte.find(type => type.id === entry.typeDeDatteId);
            const coffre = coffres.find(coffre => coffre.id === entry.typeDeCaisse);
            const net = entry.qtyBrut - (entry.nombreCaisse * (coffre ? parseFloat(coffre.PoidsCoffre) : 0));
            const lineTotal = net * entry.prixUnitaire;

            return [
                entry.nombreCaisse,
                coffre ? coffre.TypeCoffre : 'Inconnu',
                typeDeDatte ? typeDeDatte.name : 'Inconnu',
                entry.qtyBrut,
                net,
                entry.prixUnitaire,
                lineTotal.toFixed(2),
            ];
        });

        // Draw main table
        autoTable(doc, {
            head: [['Nombre de Caisse', 'Type de Caisse', 'Type de Datte', 'Quantité Brut (Kg)', 'Quantité Net (Kg)', 'Prix Unitaire (TND)', 'Total (TND)']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 4, valign: 'middle', fillColor: [255, 255, 255] },
            headStyles: { fillColor: [50, 50, 150], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 85, left: leftMargin, right: leftMargin },
        });

        // Total summary
        const total = tableData.reduce((acc, row) => acc + parseFloat(row[6]), 0);
        const totalY = doc.autoTable.previous.finalY + 15;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(`Arrêtée la présente facture à la somme de : ${total.toFixed(3)} TND`, leftMargin, totalY);

        // Footer Section
        const footerY = doc.internal.pageSize.getHeight() - 30;
        doc.setFontSize(10);
        doc.text("Signateur & Cachet", leftMargin, footerY);
        doc.text("Merci de votre confiance!", leftMargin, footerY + 10);

        // Save the PDF
        doc.save(`Facture_Personnel_${invoiceNumber}.pdf`);
    };




    return (
        <Container component={Paper} elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
            <Typography variant="h4" align="center" gutterBottom>Créer Facture</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Nom Récepteur"
                        name="nomRecepteur"
                        value={formData.nomRecepteur}
                        onChange={handleFormDataChange}
                    />
                </Grid>
            </Grid>

            {dateEntries.map((entry, index) => (
                <Grid container spacing={2} key={index}>
                    <Grid item xs={3}>
                        <FormControl fullWidth>
                            <InputLabel>Type de Datte</InputLabel>
                            <Select
                                name="typeDeDatteId"
                                value={entry.typeDeDatteId}
                                onChange={(e) => handleChange(e, index)}
                            >
                                {typesDeDatte.map(type => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControl fullWidth>
                            <InputLabel>Type de Caisse</InputLabel>
                            <Select
                                name="typeDeCaisse"
                                value={entry.typeDeCaisse}
                                onChange={(e) => handleChange(e, index)}
                            >
                                {coffres.map(coffre => (
                                    <MenuItem key={coffre.id} value={coffre.id}>
                                        {coffre.TypeCoffre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            fullWidth
                            label="Prix Unitaire (TND)"
                            type="number"
                            name="prixUnitaire"
                            value={entry.prixUnitaire}
                            onChange={(e) => handleChange(e, index)}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            fullWidth
                            label="Nombre de Caisse"
                            type="number"
                            name="nombreCaisse"
                            value={entry.nombreCaisse}
                            onChange={(e) => handleChange(e, index)}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            fullWidth
                            label="Quantité Brut (Kg)"
                            type="number"
                            name="qtyBrut"
                            value={entry.qtyBrut}
                            onChange={(e) => handleChange(e, index)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button color="secondary" onClick={() => handleRemoveDateEntry(index)}>Supprimer</Button>
                    </Grid>
                </Grid>
            ))}
            <Grid container spacing={2} justifyContent="flex-end">
                <Grid item>
                    <Button color="primary" variant="contained" onClick={handleAddDateEntry}>Ajouter une entrée</Button>
                </Grid>
                <Grid item>
                    <Button color="primary" variant="contained" onClick={handlePrintPDF}>Imprimer PDF</Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Page;
