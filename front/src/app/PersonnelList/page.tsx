"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    TextField,
    Button
} from '@mui/material';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const Page = () => {
    interface Item {
        id: number;
        date: string;
        prix: string; // Price field from JSON
        personnelsName?: string | null; // Personnel name can be null
        quantitynet?: string | null; // Quantity net can be null
        quantitybrut?: string | null; // Quantity brut can be null
        numberDeCoffre?: string | null; // Number of coffres can be null
        typeDeDatteName?: string | null; // Type de datte can be null
        prixUnitaireDeDatte?: string | null; // Price per unit of datte can be null
    }

    const [items, setItems] = useState<Item[]>([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [clientName, setClientName] = useState(''); // State for client search
    const [filteredItems, setFilteredItems] = useState<Item[]>([]); // For filtered items based on search

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get('http://localhost:5000/commandePersonnelles/');
                setItems(response.data); // Assuming response.data is an array of items
                setFilteredItems(response.data); // Set initially to show all items
                calculateTotalQuantity(response.data);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, []);

    const calculateTotalQuantity = (itemsData: Item[]) => {
        // Using quantitynet to calculate total quantity
        const total = itemsData.reduce((acc, item) => acc + (parseFloat(item.quantitynet || "0") || 0), 0);
        setTotalQuantity(total);
    };

    const handleSearch = () => {
        const filtered = items.filter((item) =>
            item.personnelsName?.toLowerCase().includes(clientName.toLowerCase()) // Use personnelsName for filtering
        );
        setFilteredItems(filtered);
        calculateTotalQuantity(filtered); // Recalculate total quantity for filtered items
    };
    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const client = clientName || "Client Inconnu"; // Fallback for client name
        const currentDate = new Date().toLocaleDateString('fr-FR'); // Set locale to French

        // Title and address
        doc.setFontSize(16);
        doc.setTextColor(40);
        const companyTitle = "SODEA";
        const address = "Route de Mornag Km2 Khlédia 2054 Tunis";

        // Header design with alignment and padding
        doc.setFillColor(200, 200, 255); // Light blue background
        doc.rect(0, 0, pageWidth, 40, 'F'); // Full-width header
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(companyTitle, 14, 15);
        doc.setFont("helvetica", "normal");
        doc.text(address, 14, 25);

        // Title aligned to the right
        const title = "Facture de Service";
        const titleXPosition = pageWidth - doc.getTextWidth(title) - 20;
        doc.text(title, titleXPosition, 35);

        // Invoice details
        doc.setFont("helvetica", "normal");
        doc.text(`Facture N°: ${invoiceNumber}`, 14, 50);
        doc.text(`Nom du Fournisseur: ${client}`, 14, 60);
        doc.text(`Date: ${currentDate}`, 14, 70);

        // Prepare the table data from filtered items
        const tableData = filteredItems.map(item => {
            return [
                item.date,
                item.quantitynet || 'N/A', // Show 'N/A' if quantitynet is null
                item.personnelsName || 'غير متوفر', // Show 'غير متوفر' if personnel name is null
                item.typeDeDatteName || 'غير متوفر', // Type de datte, handle null
                item.numberDeCoffre || 'غير متوفر', // Handle null for numberDeCoffre
                item.prix || 'N/A' // Show price, handle null
            ];
        });

        // Draw first table
        autoTable(doc, {
            head: [['Date', 'Quantité nette', 'Nom de l\'employé', 'Type de datte', 'Nombre de coffres', 'Prix']],
            body: tableData,
            startY: 80,
        });

        // Summary calculations
        const summary = {};

        filteredItems.forEach(item => {
            const key = `${item.typeDeDatteName || 'غير متوفر'}-${item.numberDeCoffre || 'غير متوفر'}`;

            if (!summary[key]) {
                summary[key] = {
                    totalQuantityBrut: 0,
                    totalQuantityNet: 0,
                    totalPrix: 0,
                    typeDeDatte: item.typeDeDatteName || 'غير متوفر',
                    numberDeCoffre: item.numberDeCoffre || 'غير متوفر',
                };
            }

            summary[key].totalQuantityBrut += item.quantitybrut || 0; // Ensure quantitybrut is handled
            summary[key].totalQuantityNet += item.quantitynet || 0; // Ensure quantitynet is handled
            summary[key].totalPrix += item.prix || 0; // Ensure price is handled
        });

        const summaryData = Object.values(summary).map(item => [
            item.typeDeDatte,
            item.numberDeCoffre,
            item.totalQuantityBrut,
            item.totalQuantityNet,
            item.totalPrix
        ]);

        // Draw summary table
        doc.setFont("helvetica", "bold");
        const summaryTitleY = doc.autoTable.previous.finalY + 10; // Positioning for the summary table title
        doc.text("Résumé par Type de Datte", 14, summaryTitleY);

        autoTable(doc, {
            head: [['Type de Datte', 'Nombre de Coffres', 'Total Brut', 'Total Net', 'Total Prix']],
            body: summaryData,
            startY: summaryTitleY + 10,
        });

        // Save the PDF
        doc.save(`${client}-facture.pdf`);
    };


    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                قائمة المعلومات
            </Typography>
            <TextField
                label="Rechercher par nom de client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ marginBottom: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleSearch} sx={{ marginBottom: 2 }}>
                Rechercher
            </Button>
            <Button variant="contained" color="secondary" onClick={handlePrintPDF} sx={{ marginBottom: 2, marginLeft: 2 }}>
                Imprimer en PDF
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>التاريخ</TableCell>
                            <TableCell>الكمية</TableCell>
                            <TableCell>اسم الموظف</TableCell>
                            <TableCell>نوع التمر</TableCell>
                            <TableCell>عدد الصناديق</TableCell>
                            <TableCell>السعر</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{item.quantitynet || 'N/A'}</TableCell>
                                <TableCell>{item.personnelsName || 'غير متوفر'}</TableCell>
                                <TableCell>{item.typeDeDatteName || 'غير متوفر'}</TableCell>
                                <TableCell>{item.numberDeCoffre || 'غير متوفر'}</TableCell>
                                <TableCell>{item.prix || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant="h6" sx={{ marginTop: 2 }}>
                Total Quantity: {totalQuantity}
            </Typography>
        </Box>
    );
};

export default Page;
