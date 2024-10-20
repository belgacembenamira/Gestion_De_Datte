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
  Alert
} from '@mui/material';
import axios from 'axios';
import TableRowComponent from '../createCommande/TableRowComponent';
import { jsPDF } from "jspdf"; // Import jsPDF
import autoTable from 'jspdf-autotable'; // Import autoTable

interface TypeDeDatteQuantity {
  id: number;
  quantity: string;
  numberDeCoffre: string;
  typeDeDatteName: string;
  prixUnitaireDeDatte?: string;
}

interface Client {
  name: string;
}

interface Coffre {
  TypeCoffre: string;
  PoidsCoffre: string;
}

interface Commande {
  id: number;
  client: Client;
  typeDeDatteQuantities: TypeDeDatteQuantity[];
  coffres: Coffre[];
}

const Page: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
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

  const handleEditClick = (commande: Commande) => {
    setEditingCommande(commande);
    setDialogOpen(true);
  };

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
    const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
    const client = clientName || "Client Inconnu";
    const currentDate = new Date().toLocaleDateString();

    doc.setFontSize(16);
    doc.setTextColor(40);
    const companyTitle = "SODEA";
    const address = "Route de Mornag Km2 Khlédia 2054 Tunis";

    doc.setFillColor(200, 200, 255);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(companyTitle, 14, 15);
    doc.setFont("helvetica", "normal");
    doc.text(address, 14, 25);

    const title = "Facture de Service ";
    const titleXPosition = pageWidth - doc.getTextWidth(title) - 20;
    doc.text(title, titleXPosition, 35);

    doc.setFont("helvetica", "normal");
    doc.text(`Facture N°: ${invoiceNumber}`, 14, 50);
    doc.text(`Nom agriculteur: ${client}`, 14, 60);
    doc.text(`Date: ${currentDate}`, 14, 70);

    const clientOrders = commandes.filter(commande =>
      commande.client?.name.toLowerCase().includes(clientName.toLowerCase())
    );

    if (clientOrders.length === 0) {
      doc.text("Aucune commande trouvée pour ce client.", 14, 80);
      doc.save(`${client}-facture.pdf`);
      return;
    }

    let totalSum = 0;
    const tableData = clientOrders.flatMap(commande =>
      commande.typeDeDatteQuantities.map(item => {
        const prixUnitaire = parseFloat(item.prixUnitaireDeDatte ?? '0');
        const qty = parseFloat(item.quantity);
        const nbreCoffres = parseInt(item.numberDeCoffre, 10) || 0;
        const coffreDetails = commande.coffres.map(coffre => `${coffre.TypeCoffre} (${coffre.PoidsCoffre} kg)`).join(", ");
        const poidsCoffre = commande.coffres.reduce((sum, coffre) => sum + parseFloat(coffre.PoidsCoffre), 0);
        const qtyBrut = qty + (nbreCoffres * poidsCoffre);
        const brut = prixUnitaire * qty;
        totalSum += brut;
        return {
          typeCoffre: coffreDetails,
          nbreCoffres,
          typeDeDatteName: item.typeDeDatteName,
          qty,
          qtyBrut,
          prixUnitaire: prixUnitaire.toFixed(2),
          totalPrice: brut.toFixed(2),
        };
      })
    );

    autoTable(doc, {
      head: [['Type de Caisse', 'N° de Caisses', 'Type de Datte', 'Quantité brute', 'Quantité net', 'Prix Unitaire', 'Total']],
      body: tableData.map(item => [
        item.typeCoffre,
        item.nbreCoffres,
        item.typeDeDatteName,
        item.qtyBrut.toFixed(2),
        item.qty,
        `${item.prixUnitaire} TND`,
        `${item.totalPrice} TND`,
      ]),
      startY: 80,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${totalSum.toFixed(2)} TND`, 14, finalY + 10);
    doc.text(`Arrêté la présente facture à la somme de: ${totalSum.toFixed(2)} TND`, 14, finalY + 20);
    doc.save(`${client}-facture.pdf`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestion des Commandessss
      </Typography>

      <TextField
        label="Rechercher un client"
        fullWidth
        margin="normal"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />

      <Button variant="contained" color="primary" onClick={handlePrintPDF}>
        Imprimer
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer>
          {filteredCommandes.map((commande) => (
            <TableRowComponent key={commande.id} commande={commande} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          ))}
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Modifier Commande</DialogTitle>
        <DialogContent>
          <TextField
            label="Quantité"
            fullWidth
            margin="normal"
            type="number"
            inputProps={{ min: 0 }}
            value={editingCommande?.typeDeDatteQuantities[0].quantity || ''}
            onChange={(e) => setEditingCommande({
              ...editingCommande!,
              typeDeDatteQuantities: [{ ...editingCommande?.typeDeDatteQuantities[0], quantity: e.target.value }]
            })}
          />
          <TextField
            label="سعر"
            fullWidth
            margin="normal"
            type="number"
            inputProps={{ min: 0 }}
            value={editingCommande?.typeDeDatteQuantities[0].prixUnitaireDeDatte || ''}
            onChange={(e) => setEditingCommande({
              ...editingCommande!,
              typeDeDatteQuantities: [{ ...editingCommande?.typeDeDatteQuantities[0], prixUnitaireDeDatte: e.target.value }]
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleUpdateOrder} color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Page;
