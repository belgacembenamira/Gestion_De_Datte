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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchClientIdByName } from "../../api/clientApi";

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
  const handleSubmit = async () => {
    const totalQty = commandeData.reduce((total, item) => {
      const selectedCoffre = coffres.find(coffre => coffre.id === item.coffreId);
      const poidsCoffre = selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) : 0;
      const qtyBrut = item.qty - (poidsCoffre * item.quantiteCoffre); // Calcul de la quantité brute
      return total + qtyBrut;
    }, 0);

    const totalPrix = commandeData.reduce((total, item) => {
      const selectedCoffre = coffres.find(coffre => coffre.id === item.coffreId);
      const selectedType = typesDeDatte.find(type => type.id === item.typeDeDatteId);
      const prixUnitaire = selectedType ? selectedType.prix : 0;
      const poidsCoffre = selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) : 0;
      const qtyBrut = item.qty - (poidsCoffre * item.quantiteCoffre); // Calcul de la quantité brute
      return total + (qtyBrut * prixUnitaire);
    }, 0);

    let clientId;

    console.log('Starting order submission...');
    console.log('Total Quantity:', totalQty);
    console.log('Total Price:', totalPrix);

    try {
      // Tentative de récupération de l'ID client
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
          const poidsCoffre = selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) : 0;
          const qtyBrut = data.qty - (poidsCoffre * data.quantiteCoffre); // Calcul de la quantité brute
          return {
            typeDeDatteName: selectedType?.name ?? 'Inconnu',
            quantity: qtyBrut, // Quantité brute
            date: new Date().toISOString(),
            prixUnitaireDeDatte: selectedType?.prix ?? 0, // Prix unitaire
            numberDeCoffre: data.quantiteCoffre ?? 0, // Nombre de coffres
          };
        })
        .filter(item => item.quantity > 0); // Inclure uniquement les éléments avec une quantité valide

      console.log('Type de Datte Quantities:', typeDeDatteQuantities);

      const commandeDataToSend = {
        date: new Date().toISOString().split('T')[0],
        qty: totalQty,
        prix: totalPrix,
        client: { id: clientId },
        coffres: commandeData.map(data => ({ id: data.coffreId, quantity: data.quantiteCoffre })),
        typeDeDatteQuantities,
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

    // Title and address
    doc.setFontSize(16);
    doc.setTextColor(40);

    const companyTitle = "SODEA - Collecte des Dattes";
    const address = "Route de Mornag Km2 Khlédia 2054 Tunis";
    const email = "E-Mail: info@sodea-fruits.com";
    const phone = "Tél: (216) 71 366 166";
    const fax = "Fax: (216) 71 366 255";

    // Header design with better alignment and padding
    doc.setFillColor(200, 200, 255); // Light blue background
    doc.rect(0, 0, pageWidth, 40, "F"); // Full-width header
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(companyTitle, 14, 15);
    doc.setFont("helvetica", "normal");
    doc.text(address, 14, 25);

    // Title aligned to the right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const title = "Facture de Service - Collecte des Dattes";
    const titleXPosition = pageWidth - doc.getTextWidth(title) - 20;
    doc.text(title, titleXPosition, 35);

    // Invoice details
    doc.text(`Facture N°: ${invoiceNumber}`, 14, 50);
    doc.text(`Nom agriculteur: ${client}`, 14, 60);
    doc.text(`Date: ${currentDate}`, 14, 70);

    // Prepare table data
    const tableData = commandeData.map((data) => {
      const selectedType = typesDeDatte.find((type) => type.id === data.typeDeDatteId);
      const selectedCoffre = coffres.find((coffre) => coffre.id === data.coffreId);
      const unitPrice = selectedType?.prix || 0;
      const brut = data.qty || 0; // Brut quantity
      const net = brut - (data.quantiteCoffre * (selectedCoffre ? parseFloat(selectedCoffre.PoidsCoffre) : 0)); // Net quantity after subtracting caisse weight

      // Ensure calculation of net * pricePerUnit
      const lineTotal = net * unitPrice;

      return {
        caisseNumber: data.quantiteCoffre || "N/A", // Caisse number
        caisseType: selectedCoffre ? selectedCoffre.TypeCoffre : "Pas de Coffre", // Caisse type
        type: selectedType?.name || "Inconnu", // Type of date
        brut: brut, // Brut quantity including coffre
        net: net, // Net quantity after subtracting caisse weight
        pricePerUnit: unitPrice, // Unit price with 2 decimal places
        lineTotal: lineTotal, // Line total (net * price per unit) with 2 decimal places
      };
    });

    // Calculate total based on net qty and unit price
    const totalSum = tableData.reduce(
      (total, item) => total + parseFloat(item.lineTotal),
      0
    ); // Total sum of all line totals, ensuring numeric addition

    // Draw table
    autoTable(doc, {
      head: [
        [
          "N° Caisse",
          "Type de Caisse",
          "Type de datte",
          "Quantité Brut(Kg)",
          "Quantité Net(Kg)",
          "Prix Unitaire",
          "Total (TND)",
        ],
      ], // Add 'Total' column
      body: tableData.map((item) => [
        item.caisseNumber || "N/A",
        item.caisseType || "N/A",
        item.type || "Inconnu",
        item.brut || 0, // Brut quantity (including coffre)
        item.net || 0, // Net quantity
        item.pricePerUnit || 0, // Unit price
        item.lineTotal || 0, // Line total (net * price per unit)
      ]),
      theme: "grid", // Use grid theme for better visibility
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { top: 80 }, // Add margin to avoid overlap with previous content
      didDrawPage: () => {
        const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 0; // Fallback to 0 if undefined
        const totalSumText = `Total: ${totalSum.toFixed(2)} TND`;
        doc.text(totalSumText, 14, finalY + 10); // Valid x and y coordinates
      },

    });

    // Add text for total in words or any other footer information
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${totalSum.toFixed(2)} TND`, 14, (doc as any).lastAutoTable.finalY + 10);


    // Save the PDF
    doc.save(`Facture_${invoiceNumber}.pdf`); // Filename in French
  };






  return (
    <Container>
      <Typography variant="h4" gutterBottom >إنشاء طلب agriculateur </Typography>
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
      <Button variant="contained" onClick={handleSubmit}>إرسال</Button>
      <Button variant="contained" onClick={handlePrintPDF}>pdf</Button>

    </Container>
  );
};

export default Page;
