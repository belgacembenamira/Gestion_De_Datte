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
import DeleteIcon from '@mui/icons-material/Delete';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TypeDeDatte {
    id: number;
    name: string;
}

interface CommandeData {
    typeDeDatteId: number;
    typeDeDatteName: string;
    qty: number; // This is the brut quantity
    coffreId: string;
    quantiteCoffre: number; // Quantity in the box
    coffrePoids?: number; // Weight of the box
    nbreCaisse: number; // Number of boxes
}

interface Coffre {
    id: string;
    TypeCoffre: string;
    PoidsCoffre: string; // Weight of the box as string
}

const Page: React.FC = () => {
    const [clientName, setClientName] = useState<string>("");
    const [address] = useState<string>("rte de morneg km 02 khelidia"); // Fixed address for recipient
    const [typesDeDatte, setTypesDeDatte] = useState<TypeDeDatte[]>([]);
    const [coffres, setCoffres] = useState<Coffre[]>([]);
    const [commandeData, setCommandeData] = useState<CommandeData[]>([]);

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
                Swal.fire({ title: 'خطأ', text: 'فشل في جلب البيانات!', icon: 'error' });
            }
        };
        fetchData();
    }, []);

    const handleDeleteType = (index: number) => {
        const updatedData = commandeData.filter((_, i) => i !== index);
        setCommandeData(updatedData);
    };

    const handleTypeChange = (index: number, field: keyof CommandeData, value: any) => {
        const updatedData: CommandeData[] = [...commandeData];
        updatedData[index][field] = value;

        if (field === "typeDeDatteId") {
            const selectedType = typesDeDatte.find(type => type.id === value);
            updatedData[index].typeDeDatteName = selectedType ? selectedType.name : "";
        }

        if (field === "coffreId") {
            const selectedCoffre = coffres.find(coffre => coffre.id === value);
            updatedData[index].coffrePoids = selectedCoffre ? Number(selectedCoffre.PoidsCoffre) : 0;
        }

        setCommandeData(updatedData);
    };

    const handleAddType = () => {
        setCommandeData([...commandeData, {
            typeDeDatteId: 0,
            typeDeDatteName: "",
            qty: 0,
            coffreId: "",
            quantiteCoffre: 0,
            coffrePoids: 0,
            nbreCaisse: 0, // Initialize number of boxes
        }]);
    };

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const currentDate = new Date().toLocaleDateString();

        // Set up document header
        doc.setFontSize(18);
        doc.setTextColor(30);

        const companyTitle = "SODEA ";
        doc.setFillColor(200, 200, 255);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(companyTitle, 14, 15);
        doc.setFont("helvetica", "normal");

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        const title = "Facture";
        const titleXPosition = pageWidth - doc.getTextWidth(title) - 20;
        doc.text(title, titleXPosition, 35);

        // Invoice details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Facture N°: ${invoiceNumber}`, 14, 50);
        doc.text(`Fournisseur: ${clientName}`, 14, 55);
        doc.text(`Date: ${currentDate}`, 14, 60);

        // Additional information
        doc.text("Doté à SODEA", 14, 65);
        doc.text("Adresse de Récepteur: Route de morneg km 02 khelidia,Ben Arous", 14, 70);

        // Process table data
        const tableData = commandeData.map((data) => {
            const selectedType = typesDeDatte.find(type => type.id === data.typeDeDatteId);
            const selectedCoffre = coffres.find(coffre => coffre.id === data.coffreId);

            const brutQty = data.qty || 0; // Using qty as brut
            const coffreWeight = selectedCoffre ? Number(selectedCoffre.PoidsCoffre) : 0;
            const nbreCaisse = data.nbreCaisse || 0;

            const netQty = brutQty - (coffreWeight * nbreCaisse); // Calculate net quantity

            return {
                numberOfBoxes: nbreCaisse || 0,
                boxType: selectedCoffre?.TypeCoffre || "Pas de Coffre",
                type: selectedType?.name || "Inconnu",
                qtyBrut: brutQty,
                qtyNet: netQty,
            };
        });

        // Calculate total net quantity
        const totalQtyNet = tableData.reduce((sum, item) => sum + (Number(item.qtyNet) || 0), 0);

        // Generate the table for commande data
        autoTable(doc, {
            startY: 80, // Starting position for the table
            head: [['Nombre de Caisse', 'Type de Caisse', 'Type de Datte', 'Quantité brut (Kg)', 'Quantité net (Kg)']],
            body: tableData.map((row) => [
                row.numberOfBoxes,
                row.boxType,
                row.type,
                row.qtyBrut,
                row.qtyNet,
            ]),
            styles: {
                fontSize: 10,
                cellPadding: 3,
                overflow: 'linebreak',
                lineWidth: 0.1,
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                halign: 'center',
            },
            headStyles: {
                fillColor: [100, 100, 255],
                textColor: [255, 255, 255],
                fontSize: 12,
            },
            theme: 'striped',
        });

        // Adding total net quantity statement
        const finalY = (doc as any).lastAutoTable.finalY || 140;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Après la présentation de facture, la somme de la quantité nette totale est de : ${totalQtyNet.toFixed(2)} Kg`, 14, finalY + 20);

        // Footer with signatures
        const footerY = finalY + 30;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Signature & cache fournisseur", pageWidth - 60, footerY, { align: "right" }); // Right side
        doc.text("Signature & cache Récepteur", 14, footerY); // Left side

        // Save PDF
        doc.save(`Facture_Personnel_${invoiceNumber}.pdf`);
    };




    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                إنشاء الطلب
            </Typography>
            <TextField
                label="اسم العميل"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                fullWidth
                margin="normal"
            />
            <Grid container spacing={2}>
                {commandeData.map((item, index) => (
                    <Grid item xs={12} key={index}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={2}>
                                <TextField
                                    select
                                    label="نوع التمر"
                                    value={item.typeDeDatteId}
                                    onChange={(e) => handleTypeChange(index, "typeDeDatteId", Number(e.target.value))}
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
                                    label="الوزن الاجمالي"
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => handleTypeChange(index, "qty", Number(e.target.value))}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    select
                                    label="نوع الصندوق"
                                    value={item.coffreId}
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
                            <Grid item xs={2}>
                                <TextField
                                    label="عدد الصناديق"
                                    type="number"
                                    value={item.nbreCaisse}
                                    onChange={(e) => handleTypeChange(index, "nbreCaisse", Number(e.target.value))}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <IconButton onClick={() => handleDeleteType(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
            <Button variant="contained" color="primary" onClick={handleAddType}>
                إضافة نوع تمر
            </Button>
            <Button variant="contained" color="secondary" onClick={handlePrintPDF} style={{ marginTop: '20px' }}>
                طباعة الفاتورة
            </Button>
        </Container>
    );
};

export default Page;
