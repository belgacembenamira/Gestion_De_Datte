"use client"
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
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import { fetchClientIdByName } from "../../../api/clientApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TypeDeDatte {
    id: number;
    name: string;
    prix: number;
}

interface CommandeData {
    typeDeDatteId: number;
    typeDeDatteName: string;
    qty: number;
    prix: number;
    coffreId: string;
    quantiteCoffre: number;
    brut?: number;
    TypeDeDatteQuantity: TypeDeDatteQuantity[]; // Changed to singular
}

interface Coffre {
    id: string;
    TypeCoffre: string;
    PoidsCoffre: string;
}
interface TypeDeDatteQuantity {
    id: number;
    quantitybrut: string;
    quantitynet: string;
    numberDeCoffre: string; // Changed from number to string
    typeDeDatteName: string;
    prixUnitaireDeDatte: number; // Added this line
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
                Swal.fire({ title: 'Error', text: 'Unable to fetch data!', icon: 'error' });
            }
        };
        fetchData();
    }, []);

    const handleAddType = () => {
        setCommandeData([...commandeData, {
            typeDeDatteId: 0,
            typeDeDatteName: "",
            qty: 0,
            prix: 0,
            coffreId: "",
            quantiteCoffre: 0,
            brut: 0,
            TypeDeDatteQuantity: [], // Initialize with an empty array
        }]);
    };
    const handleDeleteType = (index: number) => {
        const updatedData = commandeData.filter((_, i) => i !== index);
        setCommandeData(updatedData);
        calculateTotalPrice(updatedData);
    };
    const calculateTotalPrice = (data: CommandeData[]) => {
        const total = data.reduce((acc, curr) => acc + (curr.brut || 0), 0); // Use brut for total price
        setTotalPrix(total);
    };

    // Update the handleTypeChange function to ensure brut is correctly calculated
    const handleTypeChange = (index: number, field: keyof CommandeData, value: any) => {
        const updatedData: CommandeData[] = [...commandeData];
        updatedData[index][field] = value;

        // Update the typeDeDatteName when the type is changed
        if (field === "typeDeDatteId") {
            const selectedType = typesDeDatte.find(type => type.id === value);
            updatedData[index].typeDeDatteName = selectedType ? selectedType.name : "";
            updatedData[index].prix = selectedType ? selectedType.prix * (updatedData[index].qty || 0) : 0;
        }

        // Calculate brut based on quantity and poids
        const selectedCoffre = coffres.find(coffre => coffre.id === updatedData[index].coffreId);
        if (selectedCoffre) {
            updatedData[index].brut = (updatedData[index].qty || 0) - (updatedData[index].quantiteCoffre * parseFloat(selectedCoffre.PoidsCoffre));
        }

        setCommandeData(updatedData);
        calculateTotalPrice(updatedData); // Recalculate total price whenever changes are made
    };
    const handleSubmit = async () => {
        const totalQty = commandeData.reduce((total, item) => {
            const qtyBrut = item.qty; // Keep raw calculated value
            return total + (qtyBrut > 0 ? qtyBrut : 0); // Ensure total only includes valid quantities
        }, 0);

        let newTotalPrix = commandeData.reduce((total, item) => {
            const selectedCoffre = coffres.find(coffre => coffre.id === item.coffreId);
            const selectedType = typesDeDatte.find(type => type.id === item.typeDeDatteId);
            const prixUnitaire = selectedType ? selectedType.prix : 0;
            const poidsCoffre = selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) : 0;
            const qtyBrut = item.qty - (poidsCoffre * item.quantiteCoffre); // Keep raw calculated value
            return total + (qtyBrut > 0 ? (qtyBrut * prixUnitaire) : 0); // Only add valid quantities
        }, 0);

        // Set the totalPrix state
        setTotalPrix(newTotalPrix);

        let clientId;

        console.log('Starting order submission...');
        console.log('Total Quantity:', totalQty);
        console.log('Total Price:', newTotalPrix);

        try {
            // Attempt to retrieve the client ID
            clientId = await fetchClientIdByName(clientName);
            console.log('Fetched client ID:', clientId);

            if (!clientId) {
                const response = await axios.post('http://localhost:5000/clients', { name: clientName });
                clientId = response.data.id;
                console.log('Created new client, ID:', clientId);
            }

            const typeDeDatteQuantities = commandeData
                .map(data => {
                    const selectedType = typesDeDatte.find(type => type.id === data.typeDeDatteId);
                    const selectedCoffre = coffres.find(coffre => coffre.id === data.coffreId);
                    const qtyBrut = data.qty; // Calculate raw quantity
                    return {
                        typeDeDatteName: selectedType?.name ?? 'Inconnu',
                        quantitybrut: qtyBrut, // Include brut quantity
                        // Keep two decimal places
                        quantitynet: (qtyBrut > 0 ? (qtyBrut - (selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) * data.quantiteCoffre : 0)) : 0), // Calculate net quantity
                        // Convert to string as per updated interface
                        numberDeCoffre: data.quantiteCoffre.toString(),
                        prixUnitaireDeDatte: selectedType?.prix ?? 0,
                        date: new Date().toISOString().split('T')[0], // Corrected as per backend result
                    };
                })
                .filter(item => item.quantitynet > 0); // Include only items with a valid net quantity

            console.log('Type de Datte Quantities:', typeDeDatteQuantities);

            const commandeDataToSend = {
                date: new Date().toISOString().split('T')[0],
                qty: totalQty,
                prix: newTotalPrix, // Use newTotalPrix here
                client: { id: clientId },
                coffres: commandeData.map(data => ({ id: data.coffreId, quantity: data.quantiteCoffre })),
                TypeDeDatteQuantity: typeDeDatteQuantities, // Adjusted to use singular
            };

            console.log('Final Commande Data to Send:', commandeDataToSend);

            await axios.post('http://localhost:5000/commandes', commandeDataToSend);
            console.log('Commande submitted successfully');
            Swal.fire({ title: 'Succès', text: 'Commande créée avec succès!', icon: 'success' });
        } catch (error) {
            console.error('Error during order submission:', error);
            Swal.fire({ title: 'Error', text: 'Erreur lors de la soumission de la commande!', icon: 'error' });
        }
    };








    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const client = clientName || "Client Inconnu"; // Client name fallback in French
        const currentDate = new Date().toLocaleDateString();

        // Header Section
        doc.setFillColor(200, 200, 255); // Light blue background
        doc.rect(0, 0, pageWidth, 40, "F"); // Full-width header background
        doc.setTextColor(0); // Set text color to black

        // Company Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("SODEA", 14, 15); // Left-aligned company name

        // Company Address
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Route de Mornag Km2 Khlédia 2054 Tunis", 14, 25); // Left-aligned address

        // Title "Facture de Service" centered
        const title = "Facture de Service";
        doc.setFontSize(22);
        const titleXPosition = (pageWidth - doc.getTextWidth(title)) / 2; // Center the title
        doc.text(title, titleXPosition, 35); // Positioned below the header

        // Invoice Details Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Facture N°: `, 14, 50); // Left-aligned invoice number
        doc.text(`Nom agriculteur: ${client}`, 14, 60);   // Left-aligned client name
        doc.text(`Date: ${currentDate}`, 14, 70);         // Left-aligned date

        // Prepare table data and calculate totals
        let totalCaisse = 0, totalBrut = 0, totalNet = 0, totalAmount = 0;

        const tableData = commandeData.map((data) => {
            const selectedType = typesDeDatte.find((type) => type.id === data.typeDeDatteId);
            const selectedCoffre = coffres.find((coffre) => coffre.id === data.coffreId);
            const unitPrice = selectedType?.prix || 0;
            const brut = parseFloat((Number(data.qty) || 0).toString()); // Brut quantity
            const quantiteCoffre = Number(data.quantiteCoffre) || 0;
            const net = parseFloat((brut - (quantiteCoffre * (selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) : 0))).toFixed(2)); // Net quantity
            const lineTotal = net * unitPrice; // Line total

            // Update totals
            totalCaisse += quantiteCoffre;
            totalBrut += brut;
            totalNet += net;
            totalAmount += lineTotal;

            return {
                caisseNumber: quantiteCoffre || "N/A", // Caisse number
                caisseType: selectedCoffre ? selectedCoffre.TypeCoffre : "Pas de Coffre", // Caisse type
                type: selectedType?.name || "Inconnu", // Date type
                brut, // Brut quantity
                net, // Net quantity
                pricePerUnit: unitPrice, // Unit price
                lineTotal: lineTotal, // Line total
            };
        });

        // Draw the table
        autoTable(doc, {
            head: [
                [
                    "N° Caisse",
                    "Type de Caisse",
                    "Type de datte",
                    "Quantité Brut (Kg)",
                    "Quantité Net (Kg)",
                    "Prix Unitaire",
                    "Total (TND)",
                ],
            ],
            body: tableData.map((item) => [
                item.caisseNumber,
                item.caisseType,
                item.type,
                item.brut,
                item.net,
                item.pricePerUnit,
                item.lineTotal,
            ]),
            theme: "grid", // Grid theme for visibility
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: 80 },
            didDrawPage: (data) => {
                const finalY = data.cursor.y || 0; // Position after table

                // Print totals below the table
                doc.setFont("helvetica", "bold");
                doc.text(`Total Caisse: ${totalCaisse}`, 14, finalY + 10);
                doc.text(`Total Brut: ${parseFloat(totalBrut.toFixed(2))} Kg`, 14, finalY + 20);
                doc.text(`Total Net: ${parseFloat(totalNet.toFixed(2))} Kg`, 14, finalY + 30);
                doc.text(`Montant Total: ${totalAmount.toFixed(2)} TND`, 14, finalY + 40);
            },
        });

        // Save the PDF with invoice number in filename
        doc.save(`Facture_${invoiceNumber}.pdf`);
    };









    return (
        <Container>
            <Typography variant="h4" gutterBottom>إنشاء طلب</Typography>
            <TextField
                label="اسم العميل"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                fullWidth
                margin="normal"
            />
            {commandeData.map((data, index) => (
                <Grid container spacing={2} key={index}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            label="نوع التمر"
                            value={data.typeDeDatteId} // Changed to use ID
                            onChange={(e) => handleTypeChange(index, "typeDeDatteId", e.target.value)}
                            fullWidth
                        >
                            {typesDeDatte.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="الكمية"
                            type="number"
                            value={data.qty}
                            onChange={(e) => handleTypeChange(index, "qty", e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            label="صندوق"
                            value={data.coffreId}
                            onChange={(e) => handleTypeChange(index, "coffreId", e.target.value)}
                            fullWidth
                        >
                            {coffres.map((coffre) => (
                                <MenuItem key={coffre.id} value={coffre.id}>
                                    {coffre.TypeCoffre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="عدد الصناديق"
                            type="number"
                            value={data.quantiteCoffre}
                            onChange={(e) => handleTypeChange(index, "quantiteCoffre", e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="الوزن الصافي"
                            value={data.brut || 0}
                            disabled
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <IconButton onClick={() => handleDeleteType(index)}>
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button variant="contained" onClick={handleAddType}>إضافة نوع</Button>
            <Button variant="contained" onClick={handleSubmit}>إرسال</Button>
            <Button variant="contained" onClick={handlePrintPDF}>pdf</Button>

        </Container>
    );
};

export default Page;
