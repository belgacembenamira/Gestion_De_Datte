"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Typography,
    IconButton,
    TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface CommandeData {
    id: number;
    quantiteCoffre: number;
    nameDeCoffre: string;
    typeDeDatteName: string;
    brut: string;
    net: string;
    prix: string;
    clientName: string;  // Include clientName
}

const Page = () => {
    const [commandeData, setCommandeData] = useState<CommandeData[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
    const [filteredData, setFilteredData] = useState<CommandeData[]>([]); // State for filtered data

    useEffect(() => {
        fetchCommandeData();
    }, []);

    const fetchCommandeData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/commandeF");
            setCommandeData(response.data);
            setFilteredData(response.data); // Initialize filtered data
        } catch (error) {
            console.error("Error fetching commande data:", error);
            Swal.fire("Error", "Unable to fetch commande data!", "error");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:5000/commandeF/${id}`);
            setCommandeData((prevData) => prevData.filter((item) => item.id !== id));
            setFilteredData((prevData) => prevData.filter((item) => item.id !== id)); // Update filtered data
            Swal.fire("Deleted!", "The record has been deleted.", "success");
        } catch (error) {
            console.error("Error deleting the record:", error);
            Swal.fire("Error", "Unable to delete the record!", "error");
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = commandeData.filter(item =>
            item.clientName && item.clientName.toLowerCase().includes(value)
        );
        setFilteredData(filtered);
    };

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const currentDate = new Date().toLocaleDateString();
        const client = filteredData.length > 0 ? filteredData[0].clientName || "N/A" : "N/A";

        // Title and address
        doc.setFontSize(16);
        const title = "SODEA";
        const titleWidth = doc.getTextWidth(title);
        const titleXPosition = (pageWidth - titleWidth) / 2;
        doc.setFillColor(200, 200, 255);
        doc.rect(0, 0, pageWidth, 40, "F");
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(title, titleXPosition, 25);

        // Invoice details
        doc.setFontSize(12);
        const leftMargin = 14;
        let currentY = 50;
        const lineSpacing = 10;

        doc.text(`Facture N°:`, leftMargin, currentY);
        currentY += lineSpacing;
        doc.text(`Nom Fournisseur: ${client}`, leftMargin, currentY);
        currentY += lineSpacing;
        doc.text(`Date: ${currentDate}`, leftMargin, currentY);
        currentY += lineSpacing;
        doc.text("Doté à SODEA", leftMargin, currentY);
        currentY += lineSpacing;
        doc.text("Adresse de Récepteur: Route de Morneg Km 02 Khlidia, Ben Arous", leftMargin, currentY);

        // Draw main table with fetched data
        autoTable(doc, {
            head: [
                ["N° Caisse", "Type de Caisse", "Type de datte", "Quantité Brut (Kg)", "Quantité Net (Kg)"],
            ],
            body: filteredData.map((item) => [
                item.quantiteCoffre,
                item.nameDeCoffre || "Pas de Coffre",
                item.typeDeDatteName,
                item.brut,
                item.net,
            ]),
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: currentY + 20 },
        });

        const finalY = doc.autoTable.previous.finalY;

        // Group data by type de datte and calculate totals
        const groupedData = filteredData.reduce((acc, item) => {
            const type = item.typeDeDatteName;
            const quantiteCoffre = parseFloat(item.quantiteCoffre) || 0;
            const brut = parseFloat(item.brut) || 0;
            const net = parseFloat(item.net) || 0;

            if (!acc[type]) {
                acc[type] = {
                    totalCaisse: 0,
                    totalBrut: 0,
                    totalNet: 0,
                };
            }

            acc[type].totalCaisse += quantiteCoffre;
            acc[type].totalBrut += brut;
            acc[type].totalNet += net;

            return acc;
        }, {});

        const groupedTableData = Object.keys(groupedData).map((type) => [
            type,
            groupedData[type].totalCaisse.toFixed(2),
            groupedData[type].totalBrut.toFixed(2),
            groupedData[type].totalNet.toFixed(2),
        ]);

        // Draw grouped data table
        autoTable(doc, {
            head: [
                ["Type de Datte", "Total Caisse", "Total Brut (Kg)", "Total Net (Kg)"],
            ],
            body: groupedTableData,
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: finalY + 20 },
        });

        const finalTableY = doc.autoTable.previous.finalY;

        // Footer with thank you note and signature/stamp areas
        const footerY = finalTableY + 30;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Merci pour votre collaboration", leftMargin, footerY);

        // Signature and Stamp Boxes
        doc.setLineWidth(0.5);
        const boxWidth = 80;
        const boxHeight = 30;

        // Recipient (Recepteur) on the left
        doc.text("Signateur & cache Recepteur", leftMargin, footerY + 40);
        doc.rect(leftMargin, footerY + 45, boxWidth, boxHeight); // Signature box

        // Supplier (Fournisseur) on the right
        const rightMargin = pageWidth - boxWidth - leftMargin;
        doc.text("Signateur & cache Fournisseur", rightMargin, footerY + 40);
        doc.rect(rightMargin, footerY + 45, boxWidth, boxHeight); // Signature box

        // Save the PDF
        doc.save(`Facture_Personnel_${invoiceNumber}.pdf`);
    };


    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Gestion des Commandes Camion fournisseur
            </Typography>

            <TextField
                variant="outlined"
                label="Rechercher par Nom de Fournisseur"
                value={searchTerm}
                onChange={handleSearch}
                style={{ marginBottom: "20px", width: "300px" }}
            />

            <Button variant="contained" onClick={handlePrintPDF} style={{ marginBottom: "20px" }}>
                Imprimer PDF
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Type de Datte</TableCell>
                            <TableCell>Nom de Coffre</TableCell>
                            <TableCell>Quantité</TableCell>
                            <TableCell>Brut (Kg)</TableCell>
                            <TableCell>Net (Kg)</TableCell>
                            <TableCell>Name Fourniseur </TableCell>

                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.typeDeDatteName}</TableCell>
                                <TableCell>{item.nameDeCoffre}</TableCell>
                                <TableCell>{item.quantiteCoffre}</TableCell>
                                <TableCell>{item.brut}</TableCell>
                                <TableCell>{item.net}</TableCell>
                                <TableCell>{item.clientName}</TableCell>

                                <TableCell>
                                    <IconButton onClick={() => handleDelete(item.id)}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default Page;
