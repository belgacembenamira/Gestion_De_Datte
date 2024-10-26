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
    nbreCaisse: number; // Quantity in the box
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
            nbreCaisse: 0,
            coffrePoids: 0,
            nbreCaisse: 0, // Initialize number of boxes
        }]);
    };

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const client = clientName;
        const currentDate = new Date().toLocaleDateString();

        // Titre et adresse
        doc.setFontSize(16);
        doc.setTextColor(40);

        const companyTitle = "SODEA";
        const address = "Route de Mornag Km2 Khlédia 2054 ,Ben Arous";

        // En-tête de page
        doc.setFillColor(200, 200, 255);
        doc.rect(0, 0, pageWidth, 40, "F");
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(companyTitle, 20, 25);

        // Détails de la facture
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Facture N°:`, 14, 50);
        doc.text(`Nom Fournisseur: ${client}`, 14, 60);
        doc.text(`Date: ${currentDate}`, 14, 70);
        doc.text("Doté à SODEA", 14, 80);
        doc.text(address, 14, 90);

        // Table des données principales
        let totalCaisse = 0;
        let totalBrut = 0;
        let totalNet = 0;

        const tableData = commandeData.map((data) => {
            const selectedType = typesDeDatte.find((type) => type.id === data.typeDeDatteId);
            const selectedCoffre = coffres.find((coffre) => coffre.id === data.coffreId);

            const brut = parseFloat(data.qty) || 0;
            const net = brut - (parseFloat(data.nbreCaisse) * (selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) : 0));

            totalCaisse += parseFloat(data.nbreCaisse) || 0;
            totalBrut += brut;
            totalNet += net;

            return {
                caisseNumber: parseFloat(data.nbreCaisse) || "N/A",
                caisseType: selectedCoffre ? selectedCoffre.TypeCoffre : "Pas de Coffre",
                type: selectedType?.name || "Inconnu",
                brut: brut,
                net: net,
            };
        });

        // Affichage de la table principale
        autoTable(doc, {
            head: [["N° Caisse", "Type de Caisse", "Type de datte", "Quantité Brut (Kg)", "Quantité Net (Kg)"]],
            body: tableData.map((item) => [
                item.caisseNumber || "N/A",
                item.caisseType || "N/A",
                item.type || "Inconnu",
                item.brut.toFixed(2),
                item.net.toFixed(2),
            ]),
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: 100 },
        });

        // Préparation des totaux pour le résumé
        const summaryData = {};
        commandeData.forEach((data) => {
            const selectedType = typesDeDatte.find((type) => type.id === data.typeDeDatteId);
            if (selectedType) {
                const typeName = selectedType.name;
                if (!summaryData[typeName]) {
                    summaryData[typeName] = { totalCaisse: 0, totalBrut: 0, totalNet: 0 };
                }
                summaryData[typeName].totalCaisse += parseFloat(data.nbreCaisse) || 0;
                summaryData[typeName].totalBrut += parseFloat(data.qty) || 0;
                summaryData[typeName].totalNet += summaryData[typeName].totalBrut - (parseFloat(data.nbreCaisse) * (coffres.find(c => c.id === data.coffreId)?.PoidsCoffre || 0));
            }
        });

        const summaryTableData = Object.keys(summaryData).map(type => {
            return [
                summaryData[type].totalCaisse,
                type,
                summaryData[type].totalBrut.toFixed(2),
                summaryData[type].totalNet.toFixed(2),
            ];
        });

        // Affichage de la table de résumé
        const summaryTableHeader = ["Total Caisse", "Type de Datte", "Total Quantité Brut (Kg)", "Total Quantité Net (Kg)"];
        const summaryTableY = doc.autoTable.previous.finalY + 10;

        autoTable(doc, {
            head: [summaryTableHeader],
            body: summaryTableData,
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: summaryTableY },
        });

        // Positionner les totaux
        const finalY = doc.autoTable.previous.finalY;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        const totalBrutTons = (totalBrut / 1000).toFixed(2);
        const totalNetTons = (totalNet / 1000).toFixed(2);

        doc.text(`Total Caisse: ${totalCaisse}`, 14, finalY + 10);
        doc.text(`Total Quantité Brut: ${totalBrut} Kg (${totalBrutTons} Tonnes)`, 14, finalY + 20);
        doc.text(`Total Quantité Net: ${totalNet} Kg (${totalNetTons} Tonnes)`, 14, finalY + 30);

        doc.setFont("helvetica", "italic");
        doc.text(`Après la présentation de facture, la somme de qty totale est de :  ${totalNet} Kg`, 14, finalY + 50);
        doc.text("Merci pour votre collaboration", 14, finalY + 60);

        const footerY = finalY + 80;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Signature & cache fournisseur", pageWidth - 60, footerY, { align: "right" });
        doc.text("Signature & cache Récepteur", 14, footerY);

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
