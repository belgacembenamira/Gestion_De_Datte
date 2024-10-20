"use client";

import React, { memo } from 'react';
import {
    TableCell,
    TableRow,
    Typography,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { generateInvoicePDF } from '../createCommande/generatePDF';

interface TypeDeDatteQuantity {
    id: number;
    quantity: string; // Keep as string for input but convert to number during processing
    numberDeCoffre: string; // Keep as string for input but convert to number during processing
    typeDeDatteName: string;
}

interface Client {
    id: number;
    name: string;
}

interface Coffre {
    id: number;
    TypeCoffre: string;
    PoidsCoffre: number;
}

interface Commande {
    id: string;
    date: string;
    qty: number;
    prix: number;
    typeDeDatteQuantities: TypeDeDatteQuantity[];
    client: Client;
    coffres: Coffre[]; // Defined a more specific type for `coffres`
}

interface TableRowComponentProps {
    commande: Commande;
    onEdit: () => void;
    onDelete: () => void;
}

const TableRowComponent: React.FC<TableRowComponentProps> = memo(({ commande, onEdit, onDelete }) => {
    // Aggregate duplicate typeDeDatteQuantities
    const aggregatedTypeDeDatteQuantities = commande.typeDeDatteQuantities.reduce(
        (acc: Record<string, TypeDeDatteQuantity>, type) => {
            const key = type.typeDeDatteName;

            if (acc[key]) {
                // Sum the quantities and number of boxes
                acc[key].quantity = (parseInt(acc[key].quantity) + parseInt(type.quantity)).toString();
                acc[key].numberDeCoffre = (parseInt(acc[key].numberDeCoffre) + parseInt(type.numberDeCoffre)).toString();
            } else {
                // Initialize a new entry
                acc[key] = { ...type };
            }

            return acc;
        },
        {}
    );

    // Convert the aggregated object back to an array and ensure quantities are numbers
    const uniqueTypeDeDatteQuantities = Object.values(aggregatedTypeDeDatteQuantities).map(type => ({
        ...type,
        quantity: parseInt(type.quantity),
        numberDeCoffre: parseInt(type.numberDeCoffre),
    }));

    return (
        <TableRow key={commande.id}>
            <TableCell>{commande.client?.name || "غير متوفر"}</TableCell>
            <TableCell>{new Date(commande.date).toLocaleDateString("ar-TN")}</TableCell>
            <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Prix: {commande.prix} TND
                </Typography>
                <Typography variant="body2" sx={{ marginTop: 1, fontWeight: 'bold' }}>
                    أنواع التمور:
                </Typography>
                {uniqueTypeDeDatteQuantities.map((type) => (
                    <div key={type.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        {/* Use a bullet point or an icon for each type */}
                        <Typography variant="body2" sx={{ marginRight: 1 }}>•</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {type.typeDeDatteName}
                        </Typography>
                        <Typography variant="body2" sx={{ marginLeft: 2, color: 'text.secondary' }}>
                            (كمية: {type.quantity}, عدد الصناديق: {type.numberDeCoffre})
                        </Typography>
                    </div>
                ))}
                {/* Display coffres information */}
                <Typography variant="body2" sx={{ marginTop: 2, fontWeight: 'bold' }}>
                    أنواع الصناديق:
                </Typography>
                {commande.coffres.map((coffre) => (
                    <Typography key={coffre.id} variant="body2" sx={{ color: 'text.secondary' }}>
                        {coffre.TypeCoffre} - وزن الصندوق: {coffre.PoidsCoffre} كغ
                    </Typography>
                ))}
            </TableCell>

            <TableCell>
                <Tooltip title="تعديل">
                    <IconButton onClick={onEdit}>
                        <Edit />
                    </IconButton>
                </Tooltip>
                <Tooltip title="حذف">
                    <IconButton onClick={onDelete}>
                        <Delete />
                    </IconButton>
                </Tooltip>
                <Tooltip title="توليد PDF">
                    <IconButton
                        onClick={() => {
                            generateInvoicePDF(
                                commande.client?.name || "غير متوفر",
                                uniqueTypeDeDatteQuantities, // Aggregated quantities
                                commande.coffres, // Pass coffres
                                commande.date, // Pass the order date
                                commande.prix, // Pass the price per unit
                                commande.id // Add the order ID
                            );
                        }}
                    >
                        <Typography variant="caption">PDF</Typography>
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
});

export default TableRowComponent;
