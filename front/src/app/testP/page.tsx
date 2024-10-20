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
    quantity: string;
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





    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const client = "Taher Ajel"; // Client name fallback in French
        const currentDate = new Date().toLocaleDateString();

        // Title and address
        doc.setFontSize(16);
        doc.setTextColor(40);

        const companyTitle = "SODEA";
        const address = "Route de Mornag Km2 Khlédia 2054 ,Ben Arous";

        // Header design with better alignment and padding
        doc.setFillColor(200, 200, 255); // Light blue background
        doc.rect(0, 0, pageWidth, 40, "F"); // Full-width header
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");

        // Title aligned to the right
        const title = "SODEA";
        const titleXPosition = pageWidth - doc.getTextWidth(title) - 20;
        doc.text(title, titleXPosition, 35);

        // Invoice details
        doc.text(`Facture N°: ${invoiceNumber}`, 14, 50);
        doc.text(`Nom Fournisseur: ${client}`, 14, 60);
        doc.text(`Date: ${currentDate}`, 14, 70);
        doc.text("Doté à SODEA", 14, 80);
        doc.text("Adresse de Récepteur: Route de Morneg Km 02 Khlidia, Ben Arous", 14, 90);

        // Prepare table data
        let totalCaisse = 0;
        let totalBrut = 0;
        let totalNet = 0;

        const tableData = commandeData.map((data) => {
            const selectedType = typesDeDatte.find((type) => type.id === data.typeDeDatteId);
            const selectedCoffre = coffres.find((coffre) => coffre.id === data.coffreId);

            const basePrice = selectedType ? parseFloat(selectedType.prix) : 0;
            const unitPrice = basePrice + 0.2;

            const brut = parseFloat(data.qty) || 0; // Convert to float
            const net = brut - (parseFloat(data.quantiteCoffre) * (selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) : 0));
            const lineTotal = net * unitPrice;

            // Accumulate totals
            totalCaisse += parseFloat(data.quantiteCoffre) || 0; // Convert to float
            totalBrut += brut;
            totalNet += net;

            return {
                caisseNumber: parseFloat(data.quantiteCoffre) || "N/A",
                caisseType: selectedCoffre ? selectedCoffre.TypeCoffre : "Pas de Coffre",
                type: selectedType?.name || "Inconnu",
                brut: brut,
                net: net,
                pricePerUnit: unitPrice.toFixed(2),
                lineTotal: lineTotal.toFixed(2),
            };
        });

        // Calculate total price sum based on net qty and unit price
        const totalSum = tableData.reduce((total, item) => total + parseFloat(item.lineTotal), 0);

        // Draw table
        autoTable(doc, {
            head: [
                [
                    "N° Caisse",
                    "Type de Caisse",
                    "Type de datte",
                    "Quantité Brut (Kg)",
                    "Quantité Net (Kg)",
                    "Prix Unitaire (TND)",
                    "Total (TND)",
                ],
            ],
            body: tableData.map((item) => [
                item.caisseNumber || "N/A",
                item.caisseType || "N/A",
                item.type || "Inconnu",
                item.brut || 0,
                item.net || 0,
                item.pricePerUnit || 0,
                item.lineTotal || 0,
            ]),
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: 100 },
        });

        // Ensure we correctly position the totals below the table
        const finalY = doc.autoTable.previous.finalY; // Use the last Y position of the table
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        // Convert brut and net quantities to tons (1 ton = 1000 kg)
        const totalBrutTons = (totalBrut / 1000).toFixed(2);
        const totalNetTons = (totalNet / 1000).toFixed(2);

        // Display caisse total, brut total in kg and tons, and net total in kg and tons below the table
        doc.text(`Total Caisse: ${totalCaisse}`, 14, finalY + 10);
        doc.text(`Total Quantité Brut: ${totalBrut} Kg (${totalBrutTons} Tonnes)`, 14, finalY + 20);
        doc.text(`Total Quantité Net: ${totalNet} Kg (${totalNetTons} Tonnes)`, 14, finalY + 30);

        // Display total price sum
        doc.text(`Total: ${totalSum.toFixed(2)} TND`, 14, finalY + 40);

        // Thank you message
        doc.setFont("helvetica", "italic");
        doc.text(`Après la présentation de facture, la somme de prix totale est de : ${totalSum.toFixed(2)} TND`, 14, finalY + 50);
        doc.text("Merci pour votre collaboration", 14, finalY + 60);

        // Footer with signatures
        const footerY = finalY + 80;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Signature & cache fournisseur", pageWidth - 60, footerY, { align: "right" });
        doc.text("Signature & cache Récepteur", 14, footerY);

        // Save PDF
        doc.save(`Facture_Personnel_${invoiceNumber}.pdf`);
    };









    return (
        <Container sx={{ m: 10 }}>

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
                            label="السعر الإجمالي"
                            value={totalPrix}
                            disabled
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
            <Button variant="contained" onClick={handlePrintPDF}>pdf</Button>

        </Container>
    );
};

export default Page;
