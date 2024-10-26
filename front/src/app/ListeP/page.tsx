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
}

const Page = () => {
    const [commandeData, setCommandeData] = useState<CommandeData[]>([]);

    useEffect(() => {
        fetchCommandeData();
    }, []);

    const fetchCommandeData = async () => {
        try {
            // Example: Replace this with your actual endpoint
            const response = await axios.get("http://localhost:5000/commande-data");
            setCommandeData(response.data);
        } catch (error) {
            console.error("Error fetching commande data:", error);
            Swal.fire("Error", "Unable to fetch commande data!", "error");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:5000/commande-data/${id}`);
            setCommandeData((prevData) => prevData.filter((item) => item.id !== id));
            Swal.fire("Deleted!", "The record has been deleted.", "success");
        } catch (error) {
            console.error("Error deleting the record:", error);
            Swal.fire("Error", "Unable to delete the record!", "error");
        }
    };

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const client = "Taher Ajel"; // Client name fallback in French
        const currentDate = new Date().toLocaleDateString();

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

        doc.text(`Facture N°: `, leftMargin, currentY);
        currentY += lineSpacing;
        doc.text(`Nom Fournisseur: ${client}`, leftMargin, currentY);
        currentY += lineSpacing;
        doc.text(`Date: ${currentDate}`, leftMargin, currentY);
        currentY += lineSpacing;
        doc.text("Doté à SODEA", leftMargin, currentY);
        currentY += lineSpacing;
        doc.text("Adresse de Récepteur: Route de Morneg Km 02 Khlidia, Ben Arous", leftMargin, currentY);

        // Draw main table with fetched data (no recalculations)
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
            body: commandeData.map((item) => [
                item.quantiteCoffre,
                item.nameDeCoffre || "Pas de Coffre",
                item.typeDeDatteName,
                item.brut,
                item.net,
                item.prix,
                (parseFloat(item.net) * parseFloat(item.prix)).toFixed(2), // Total
            ]),
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: currentY + 20 },
        });

        const finalY = doc.autoTable.previous.finalY;

        // Group data by type de datte and calculate totals
        const groupedData = commandeData.reduce((acc, item) => {
            const type = item.typeDeDatteName;
            const quantiteCoffre = parseFloat(item.quantiteCoffre) || 0;
            const brut = parseFloat(item.brut) || 0;
            const net = parseFloat(item.net) || 0;
            const prix = parseFloat(item.prix) || 0;
            const totalPrix = net * prix;

            if (!acc[type]) {
                acc[type] = {
                    totalCaisse: 0,
                    totalBrut: 0,
                    totalNet: 0,
                    totalPrix: 0,
                };
            }

            acc[type].totalCaisse += quantiteCoffre;
            acc[type].totalBrut += brut;
            acc[type].totalNet += net;
            acc[type].totalPrix += totalPrix;

            return acc;
        }, {});

        // Prepare grouped table data
        const groupedTableData = Object.keys(groupedData).map((type) => [
            type,
            groupedData[type].totalCaisse.toFixed(2),
            groupedData[type].totalBrut.toFixed(2),
            groupedData[type].totalNet.toFixed(2),
            groupedData[type].totalPrix.toFixed(2),
        ]);

        // Draw grouped data table
        autoTable(doc, {
            head: [
                [
                    "Type de Datte",
                    "Total Caisse",
                    "Total Brut (Kg)",
                    "Total Net (Kg)",
                    "Total Prix (TND)",
                ],
            ],
            body: groupedTableData,
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: finalY + 20 },
        });

        const finalTableY = doc.autoTable.previous.finalY;

        // Footer with a thank you note
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Merci pour votre collaboration", leftMargin, finalTableY + 20);
        // Signature and Stamp Boxes
        doc.setLineWidth(0.5);
        const boxWidth = 80;
        const boxHeight = 30;
        const footerY = finalTableY + 20;

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
                Gestion des Commandes Camion Taher
            </Typography>
            <Button variant="contained" onClick={handlePrintPDF} style={{ marginBottom: "20px" }}>
                Imprimer PDF
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Type de Datte</TableCell>
                            <TableCell>Prix (TND)</TableCell>
                            <TableCell>Nom de Coffre</TableCell>
                            <TableCell>Quantité</TableCell>
                            <TableCell>Brut (Kg)</TableCell>
                            <TableCell>Net (Kg)</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {commandeData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.typeDeDatteName}</TableCell>
                                <TableCell>{item.prix}</TableCell>
                                <TableCell>{item.nameDeCoffre}</TableCell>
                                <TableCell>{item.quantiteCoffre}</TableCell>
                                <TableCell>{item.brut}</TableCell>
                                <TableCell>{item.net}</TableCell>
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
