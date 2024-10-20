"use client"
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
        qty: number;
        personnel?: {
            name: string;
        };
        typeDeDatteQuantities: {
            id: number;
            typeDeDatteName: string;
            quantity: number;
        }[];
        coffres: {
            id: number;
            numberDeCoffre: string;
            TypeCoffre: string;
            PoidsCoffre: string;
        }[];
    }

    const [items, setItems] = useState<Item[]>([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [clientName, setClientName] = useState(''); // New state for client search
    const [filteredItems, setFilteredItems] = useState<Item[]>([]); // For filtered items based on search

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get('http://localhost:5000/commandes/findAllPersonnel');
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
        const total = itemsData.reduce((acc, item) => acc + (item.qty || 0), 0);
        setTotalQuantity(total);
    };

    const handleSearch = () => {
        const filtered = items.filter((item) =>
            item.personnel?.name?.toLowerCase().includes(clientName.toLowerCase())
        );
        setFilteredItems(filtered);
        calculateTotalQuantity(filtered); // Recalculate total quantity for filtered items
    };

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const client = clientName || "Client Inconnu"; // Fallback for client name
        const currentDate = new Date().toLocaleDateString();

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
        doc.text(`Nom  Fourniseur: ${client}`, 14, 60);
        doc.text(`Date: ${currentDate}`, 14, 70);

        // Filter commandes for the searched client
        const clientOrders = filteredItems.filter(commande =>
            commande.personnel?.name?.toLowerCase().includes(clientName.toLowerCase())
        );

        if (clientOrders.length === 0) {
            doc.text("Aucune commande trouvée pour ce client.", 14, 80);
            doc.save(`${client}-facture.pdf`);
            return;
        }

        // Prepare the table data with grouped columns and proper calculations
        const tableData = clientOrders.flatMap(commande =>
            commande.typeDeDatteQuantities.map(item => {
                const qty = item.quantity; // Quantité nette
                const nbreCoffres = commande.coffres.length; // Total number of coffres

                // Calculate the brut quantity (net + total weight of coffres)
                const poidsCoffre = commande.coffres.reduce((sum, coffre) => sum + parseFloat(coffre.PoidsCoffre), 0); // Total Poids des coffres
                const qtyBrut = qty + poidsCoffre; // Quantité brute = net + poids total des coffres

                // Details of the coffres
                const coffreDetails = commande.coffres.map(coffre => `${coffre.TypeCoffre} (${coffre.PoidsCoffre} kg)`).join(", ");

                return {
                    typeCoffre: coffreDetails,
                    nbreCoffres,
                    typeDeDatteName: item.typeDeDatteName,
                    qty, // Quantité nette
                    qtyBrut, // Quantité brute (net + poids des coffres)
                };
            })
        );

        // Draw table
        autoTable(doc, {
            head: [['Type de Caisse', 'N° de Caisses', 'Type de Datte', 'Quantité nette', 'Quantité brute']],
            body: tableData.map(item => [
                item.typeCoffre,
                item.nbreCoffres,
                item.typeDeDatteName,
                item.qty,
                item.qtyBrut, // Show two decimal places for qtyBrut
            ]),
            startY: 80,
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
                            <TableCell>نوع الصندوق</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{item.qty}</TableCell>
                                <TableCell>{item.personnel ? item.personnel.name : 'غير متوفر'}</TableCell>
                                <TableCell>
                                    {item.typeDeDatteQuantities.map((type) => (
                                        <div key={type.id}>
                                            {type.typeDeDatteName} (الكمية: {type.quantity})
                                        </div>
                                    ))}
                                </TableCell>
                                <TableCell>
                                    {item.coffres.map((coffre) => (
                                        <div key={coffre.id}>
                                            {coffre.numberDeCoffre}
                                        </div>
                                    ))}
                                </TableCell>
                                <TableCell>
                                    {item.coffres.map((coffre) => (
                                        <div key={coffre.id}>
                                            {coffre.TypeCoffre}
                                        </div>
                                    ))}
                                </TableCell>
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
