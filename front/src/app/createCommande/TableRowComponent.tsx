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
    quantitynet: string;
    quantitybrut: string;
    numberDeCoffre: string;
    typeDeDatteName: string;
    prixUnitaireDeDatte?: string; // Ensure unit price is included
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
    id: number;
    date: string;
    qty: number;
    prix: number;
    typeDeDatteQuantities: TypeDeDatteQuantity[];
    client: Client;
    coffres: Coffre[];
}

interface TableRowComponentProps {
    commande: Commande;
    onEdit: () => void;
    onDelete: () => void;
}

const TableRowComponent: React.FC<TableRowComponentProps> = memo(({ commande, onEdit, onDelete }) => {
    const uniqueTypeDeDatteQuantities = commande.typeDeDatteQuantities.map(type => ({
        ...type,
        quantitynet: parseFloat(type.quantitynet),
        quantitybrut: parseFloat(type.quantitybrut),
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
                        <Typography variant="body2" sx={{ marginRight: 1 }}>•</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {type.typeDeDatteName}
                        </Typography>
                        <Typography variant="body2" sx={{ marginLeft: 2, color: 'text.secondary' }}>
                            (كمية صافية: {type.quantitynet.toFixed(3)}, كمية إجمالية: {type.quantitybrut.toFixed(3)}, عدد الصناديق: {type.numberDeCoffre})
                        </Typography>
                    </div>
                ))}
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
                                uniqueTypeDeDatteQuantities,
                                commande.coffres,
                                commande.date,
                                commande.prix,
                                commande.id
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
