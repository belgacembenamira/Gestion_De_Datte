"use client";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  TextField,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TableContainer,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import axios from 'axios';
import TableRowComponent from '../createCommande/TableRowComponent'; // Ensure this component is adjusted to show all required fields
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

interface TypeDeDatteQuantity {
  id: number;
  quantitynet: string;
  quantitybrut: string;
  numberDeCoffre: string;
  typeDeDatteName: string;
  prixUnitaireDeDatte?: string;
}

interface Client {
  id: number;
  name: string;
  montantDonner: number | null; // Allowing for null value
}

interface Coffre {
  id: number;
  TypeCoffre: string;
  PoidsCoffre: string;
}

interface Commande {
  id: number;
  client: Client;
  typeDeDatteQuantities: TypeDeDatteQuantity[];
  coffres: Coffre[];
  date: string;
  prix: string; // Updated to match JSON
}

const Page: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const fetchCommandes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/commandes/');
      setCommandes(data);
    } catch (error) {
      console.error('Error fetching commandes', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
  }, [fetchCommandes]);

  const filteredCommandes = commandes.filter(commande =>
    commande.client?.name.toLowerCase().includes(clientName.toLowerCase())
  );

  const handleDeleteClick = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/commandes/${id}`);
      fetchCommandes();
      setSnackbarMessage('Commande supprimée avec succès.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting order', error);
      setSnackbarMessage('Erreur lors de la suppression de la commande.');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingCommande) return;

    try {
      await axios.put(`http://localhost:5000/commandes/${editingCommande.id}`, editingCommande);
      fetchCommandes();
      setDialogOpen(false);
      setSnackbarMessage('Commande mise à jour avec succès.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating order', error);
      setSnackbarMessage('Erreur lors de la mise à jour de la commande.');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const client = clientName || "Client Inconnu";
    const currentDate = new Date().toLocaleDateString();

    doc.setFontSize(16);
    doc.setTextColor(40);
    const companyTitle = "SODEA";
    const address = "Route de Mornag Km2 Khlédia 2054 Tunis";

    // Header with background color
    doc.setFillColor(200, 200, 255);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(companyTitle, 14, 15);
    doc.setFont("helvetica", "normal");
    doc.text(address, 14, 25);

    const title = "Facture de Service";
    const titleXPosition = pageWidth - doc.getTextWidth(title) - 10;
    doc.setFontSize(12);
    doc.text(title, titleXPosition, 35);

    // Client information
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Client: ${clientName}`, 14, 55);
    doc.text(`Date: ${currentDate}`, 14, 65);
    doc.text(`Numéro de Facture: `, 14, 75);

    const tableColumn = [
      "Nombre de caisses", "Type de Coffre", "Type de Datte", "Quantité brute (kg)", "Quantité nette (kg)", "Prix Unitaire (TND)", "Montant (TND)"
    ];
    const tableRows: string[][] = [];
    let totalAmount = 0;
    let totalNet = 0;  // Total net quantity
    let totalBrut = 0; // Total brut quantity
    let totalCaisse = 0;

    // Filter commandes based on the client name
    const filteredCommandesForPDF = commandes.filter(commande =>
      commande.client?.name.toLowerCase().includes(clientName.toLowerCase())
    );

    filteredCommandesForPDF.forEach((order) => {
      order.typeDeDatteQuantities.forEach((type, index) => {
        const qtyNet = parseFloat(type.quantitynet);
        const qtyBrut = parseFloat(type.quantitybrut);
        const prixUnitaire = parseFloat(type.prixUnitaireDeDatte || "0"); // Ensure to handle undefined

        // Calcul du montant pour cette ligne
        const montant = prixUnitaire * qtyNet;
        totalAmount += montant;
        totalNet += qtyNet;  // Accumulate net quantity
        totalBrut += qtyBrut; // Accumulate brut quantity
        totalCaisse += parseInt(type.numberDeCoffre); // Accumulate number of boxes

        // Retrieve the corresponding TypeCoffre for the row
        const coffre = order.coffres[index];
        const coffreType = coffre ? coffre.TypeCoffre : "P"; // Fallback if no coffre is found

        const orderData = [
          type.numberDeCoffre,                 // Nombre de caisses
          coffreType,                          // Type de Coffre
          type.typeDeDatteName,                // Type de datte
          qtyBrut.toFixed(2),                  // Quantité brute
          qtyNet.toFixed(2),                   // Quantité nette
          prixUnitaire.toFixed(2),             // Prix unitaire
          montant.toFixed(2),                  // Montant total pour la ligne
        ];
        tableRows.push(orderData);
      });
    });

    // Affichage du tableau avec autoTable
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90,
    });

    // Affichage des montants totaux
    const finalY = (doc as any).lastAutoTable.finalY || 90;
    doc.setFont("helvetica", "bold");
    doc.text(`Montant Total: ${totalAmount.toFixed(2)} TND`, 14, finalY + 10);
    doc.text(`Total Net: ${totalNet.toFixed(2)} kg`, 14, finalY + 20);
    doc.text(`Total Brut: ${totalBrut.toFixed(2)} kg`, 14, finalY + 30);
    doc.text(`Total Caisses: ${totalCaisse}`, 14, finalY + 38);

    // Enregistrer le PDF
    doc.save("invoice.pdf");
  };




  return (
    <Container>
      <Typography variant="h4" align="center" sx={{ margin: '20px 0' }}>
        Gestion des Commandes
      </Typography>
      <TextField
        label="Rechercher par Client"
        variant="outlined"
        fullWidth
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Prix (TND)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCommandes.map((commande) => (
                <TableRowComponent
                  key={commande.id}
                  commande={commande}
                  onEdit={() => {
                    setEditingCommande(commande);
                    setDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteClick(commande.id)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Modifier Commande</DialogTitle>
        <DialogContent>
          {/* Add your form fields for editing the order here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleUpdateOrder}>Sauvegarder</Button>
        </DialogActions>
      </Dialog>

      <Button variant="contained" color="primary" onClick={handlePrintPDF}>
        Télécharger la Facture PDF
      </Button>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Page;
