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
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchPersonnelIdByName } from "./personnelApi";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

// Assuming you have a base64 encoded image or a URL to the image

interface TypeDeDatte {
    id: number;
    name: string;
    prix: number;
}
interface typeDeDatteQuantities {
    id: number;
    quantity: string;
    numberDeCoffre: string; // Changed from number to string
    typeDeDatteName: string;
}

export interface CommandeData {
    id: number;
    date?: string; // optional since it's nullable
    prix?: number; // optional since it's nullable
    personnelsName?: string; // optional since it's nullable
    quantitynet?: number; // optional since it's nullable
    quantitybrut?: number; // optional since it's nullable
    numberDeCoffre?: string; // optional since it's nullable
    typeDeDatteName?: string; // optional since it's nullable
    prixUnitaireDeDatte?: number; // optional since it's nullable
    coffre?: Coffre; // nullable ManyToOne relation
}

interface Coffre {
    id: string;
    TypeCoffre: string;
    PoidsCoffre: string;
}

interface Personnel {
    id: number;
    name: string;
}

const Page: React.FC = () => {
    const [personnelName, setPersonnelName] = useState<string>("");
    const [typesDeDatte, setTypesDeDatte] = useState<TypeDeDatte[]>([]);
    const [coffres, setCoffres] = useState<Coffre[]>([]);
    const [personnels, setPersonnels] = useState<Personnel[]>([]);
    const [commandeData, setCommandeData] = useState<CommandeData[]>([]);
    const [totalPrix, setTotalPrix] = useState<number>(0);

    // Fetch data on mount
    useEffect(() => {
        const fetchTypesDeDatte = async () => {
            try {
                const response = await axios.get("http://localhost:5000/types-de-dattes");
                setTypesDeDatte(response.data);
            } catch (error) {
                console.error("Error fetching types de dattes:", error);
            }
        };

        const fetchCoffres = async () => {
            try {
                const response = await axios.get("http://localhost:5000/coffres");
                setCoffres(response.data);
            } catch (error) {
                console.error("Error fetching coffres:", error);
            }
        };

        const fetchPersonnels = async () => {
            try {
                const response = await axios.get("http://localhost:5000/personnels");
                setPersonnels(response.data);
            } catch (error) {
                console.error("Error fetching personnels:", error);
            }
        };

        fetchTypesDeDatte();
        fetchCoffres();
        fetchPersonnels();
    }, []);


    // Handle changes in type, quantity, and price calculation
    const handleTypeChange = (index: number, field: keyof CommandeData, value: any) => {
        const updatedData: CommandeData[] = [...commandeData];
        updatedData[index][field] = value;

        if (field === "typeDeDatteId") {
            const selectedType = typesDeDatte.find(type => type.id === value);
            updatedData[index].typeDeDatteName = selectedType ? selectedType.name : "";
            updatedData[index].prix = selectedType ? selectedType.prix * (updatedData[index].qty || 0) : 0;
        }

        const selectedCoffre = coffres.find(coffre => coffre.id === updatedData[index].coffreId);
        if (selectedCoffre) {
            updatedData[index].brut = (updatedData[index].qty || 0) - (updatedData[index].quantiteCoffre * parseFloat(selectedCoffre.PoidsCoffre));
        }

        setCommandeData(updatedData);
        calculateTotalPrice(updatedData);
    };


    // Calculate the total price
    const handleAddType = () => {
        setCommandeData([...commandeData, {
            typeDeDatteId: 0,
            typeDeDatteName: "",
            qty: 0,
            prix: 0,
            coffreId: "",
            quantiteCoffre: 0,
            brut: 0,
            typeDeDatteQuantities: [],
            personnel: {
                id: 0,
                name: ""
            }
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



    const handlePersonnelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedPersonnelName = event.target.value as string;
        const selectedPersonnel = personnels.find(personnel => personnel.name === selectedPersonnelName);

        if (selectedPersonnel) {
            setPersonnelName(selectedPersonnel.name);
            console.log("Selected Personnel:", selectedPersonnel);
        }
    };

    // Handle form submission and order creation




    // Handle add personnel
    const handleAddPersonnel = async () => {
        if (!personnelName) {
            Swal.fire({ title: 'Erreur', text: 'Veuillez remplir tous les champs.', icon: 'error' });
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/personnels/create", {
                name: personnelName,
            });

            // Update personnels state with the newly added personnel
            setPersonnels((prevPersonnels) => [
                ...prevPersonnels,
                response.data,
            ]);
            Swal.fire({ title: 'Succès', text: 'تم إضافة الخراص بنجاح!', icon: 'success' });
        } catch (error) {
            Swal.fire({ title: 'Erreur', text: 'حدث خطأ أثناء إضافة الخراص!', icon: 'error' });
        }
    };

    const handlePrintPDFPersonnel = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
        const currentDate = new Date().toLocaleDateString();
        const personnel = personnelName || "Personnel Inconnu";

        doc.setFontSize(18);
        doc.setTextColor(30);

        const companyTitle = "SODEA ";

        doc.setFillColor(200, 200, 255);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(companyTitle, 14, 15);
        doc.setFont("helvetica", "normal");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        const title = "Facture de Service - Collecte des Dattes";
        const titleXPosition = pageWidth - doc.getTextWidth(title) - 20;
        doc.text(title, titleXPosition, 35);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Facture N°: ${invoiceNumber}`, 14, 50);
        doc.text(`Fournisseur: ${personnel}`, 14, 55);
        doc.text(`Date: ${currentDate}`, 14, 60);

        // Process table data
        const tableData = commandeData.map((data) => {
            const selectedType = typesDeDatte.find(type => type.id === data.typeDeDatteId);
            const selectedCoffre = coffres.find(coffre => coffre.id === data.coffreId);
            return {
                numberOfBoxes: data.quantiteCoffre || 0,
                boxType: selectedCoffre?.TypeCoffre || "Pas de Coffre",
                type: selectedType?.name || "Inconnu",
                supplier: data.personnel || "Fournisseur Inconnu",
                qtyBrut: data.brut || 0,
                qtyWithBox: data.qty || 0,
            };
        });

        // Calculate totals with error handling (ensure values are numbers)
        const totalBoxes = tableData.reduce((sum, item) => sum + (Number(item.numberOfBoxes) || 0), 0);
        const totalQtyBrut = tableData.reduce((sum, item) => sum + (Number(item.qtyBrut) || 0), 0);
        const totalQtyWithBox = tableData.reduce((sum, item) => sum + (Number(item.qtyWithBox) || 0), 0);

        // Generate the table
        autoTable(doc, {
            startY: 70,
            head: [['-', 'Nombre de Caisse', 'Type de Caisse', 'Type de Datte', 'Quantité  brut (Kg)', 'Quantité net (Kg)']],
            body: [
                ...tableData.map(row => [
                    typeof row.supplier === 'object' ? row.supplier.name : row.supplier,
                    row.numberOfBoxes,
                    row.boxType,
                    row.type,
                    row.qtyWithBox,
                    row.qtyBrut,
                ]),
                [
                    'Totaux :',
                    totalBoxes,
                    '-',
                    '-',
                    totalQtyWithBox,
                    totalQtyBrut,
                ]
            ],
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

        const finalY = (doc as any).lastAutoTable.finalY || 120;
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text("Merci pour votre collaboration!", 14, finalY + 20);
        doc.text(`SODEA`, 14, finalY + 25);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Cachet et signature", 14, finalY + 40);

        // Save PDF
        doc.save(`Facture_Personnel_${invoiceNumber}.pdf`);
    };




    const handleSubmit = async () => {
        // Calculate total quantities and total price based on brut
        const totalQty = commandeData.reduce((total, item) => total + item.qty, 0);
        const totalPrix = commandeData.reduce((total, item) => total + (item.brut || 0), 0);
        let personnelId;

        console.log('Starting order submission...');
        console.log('Total Quantity:', totalQty);
        console.log('Total Price:', totalPrix);

        try {
            // Attempt to fetch personnel ID by name
            if (personnelName) {
                const personnelResponse = await fetchPersonnelIdByName(personnelName);
                personnelId = personnelResponse?.data?.id;
            }

            // Form data to be submitted
            const dataToSubmit = {
                date: new Date().toISOString(),
                prix: totalPrix,
                personnelsName: personnelName,
                personnelId,
                typeDeDatteQuantities: commandeData.map(item => ({
                    typeDeDatteId: item.typeDeDatteId,
                    quantite: item.qty,
                    prix: item.prix,
                    numberDeCoffre: item.quantiteCoffre,
                    coffreId: item.coffreId
                }))
            };

            // Submit the order data
            const response = await axios.post('http://localhost:5000/commandePersonnelles/', dataToSubmit);
            console.log('Order successfully submitted:', response.data);
            Swal.fire({ title: 'Success', text: 'Order submitted successfully!', icon: 'success' });
        } catch (error) {
            console.error('Error during submission:', error);
            Swal.fire({ title: 'Error', text: 'Failed to submit order!', icon: 'error' });
        }
    };









    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                إنشاء طلب
            </Typography>

            {/* Add Personnel Form */}
            <Typography variant="h6">إضافة خراص جديد</Typography>
            <TextField
                label="اسم الخراص"
                fullWidth
                value={personnelName}
                onChange={(e) => setPersonnelName(e.target.value)}
                margin="normal"
            />

            <Button variant="contained" color="primary" onClick={handleAddPersonnel}>
                إضافة خراص
            </Button>

            {/* Personnel Selection */}
            <TextField
                select
                label="اسم الخراص"
                value={personnelName}
                onChange={handlePersonnelChange}
                fullWidth
                margin="normal"
            >
                {personnels.map((personnel) => (
                    <MenuItem key={personnel.id} value={personnel.name}>
                        {personnel.name}
                    </MenuItem>
                ))}
            </TextField>

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

            {/* Total Price */}

            {/* Submit */}
            <Button variant="contained" onClick={handleAddType}>إضافة نوع</Button>
            {/* <Button variant="contained" onClick={handleSubmit}>إرسال</Button> */}
            <Button variant="contained" onClick={handlePrintPDFPersonnel}>pdf</Button>

        </Container>
    );
};

export default Page;
