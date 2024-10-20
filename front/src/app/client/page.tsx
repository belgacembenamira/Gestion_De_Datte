// src/components/Client.tsx
"use client";
import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Client {
    id: string;
    name: string;
    montantDonner?: number; // Ajouter le champ montantDonner ici
}

const Page: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState(''); // État pour le terme de recherche
    const [name, setName] = useState('');
    const [montantDonner, setMontantDonner] = useState<number | ''>(''); // Ajouter état pour montantDonner
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/clients');
            setClients(response.data);
        } catch (error) {
            Swal.fire('Erreur', 'Échec de la récupération des clients!', 'error');
        }
    };

    const handleEdit = (client: Client) => {
        setName(client.name);
        setMontantDonner(client.montantDonner || ''); // Prendre en compte montantDonner
        setSelectedClient(client);
    };

    const handleCreateOrUpdate = async () => {
        try {
            if (selectedClient) {
                // Mise à jour du client
                await axios.patch(`http://localhost:5000/clients/${selectedClient.id}`, {
                    name,
                    montantDonner, // Ajouter montantDonner à la mise à jour
                });
                Swal.fire('Succès', 'Le client a été mis à jour avec succès!', 'success');
            } else {
                // Ajout d'un nouveau client
                await axios.post('http://localhost:5000/clients', { name, montantDonner }); // Ajouter montantDonner lors de la création
                Swal.fire('Succès', 'Le client a été ajouté avec succès!', 'success');
            }
            resetForm();
            fetchClients(); // Fetch clients to update the list
        } catch (error) {
            Swal.fire('Erreur', 'Échec de l\'enregistrement du client!', 'error');
        }
    };

    const resetForm = () => {
        setName('');
        setMontantDonner(''); // Réinitialiser montantDonner
        setSelectedClient(null); // Réinitialiser le client sélectionné
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/clients/${id}`);
            Swal.fire('Succès', 'Le client a été supprimé avec succès!', 'success');
            fetchClients(); // Refetch clients after delete
        } catch (error) {
            Swal.fire('Erreur', 'Échec de la suppression du client!', 'error');
        }
    };

    // Fonction pour filtrer les clients par nom
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fonction pour imprimer les clients filtrés en français
    const handlePrint = () => {
        const printContent = filteredClients
            .map(client => `Nom du client: ${client.name}, Montant donné: ${client.montantDonner || 'N/A'}`)
            .join('\n');

        const printWindow = window.open('', '', 'height=400,width=600');
        printWindow?.document.write('<pre>' + printContent + '</pre>');
        printWindow?.document.close();
        printWindow?.print();
    };

    return (
        <Box p={3} sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <Typography variant="h4" gutterBottom align="right">
                Gestion des Clients
            </Typography>
            <TextField
                label="Rechercher par nom" // Champ de recherche
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Mettre à jour l'état du terme de recherche
                fullWidth
                sx={{ mb: 2 }} // Ajouter un peu d'espace en bas
            />
            <TextField
                label="Nom"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
            />
            <TextField
                label="Montant donné" // Champ pour le montantDonner
                variant="outlined"
                type="number"
                value={montantDonner}
                onChange={(e) => setMontantDonner(e.target.value ? Number(e.target.value) : '')} // Convertir en nombre
                fullWidth
                sx={{ mt: 2 }} // Ajouter un peu d'espace
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleCreateOrUpdate}
                sx={{ mt: 2 }}
            >
                {selectedClient ? 'Mettre à jour le client' : 'Ajouter un client'}
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={handlePrint}
                sx={{ mt: 2, ml: 2 }} // Ajouter un peu d'espace à gauche
            >
                Imprimer
            </Button>
            <TableContainer sx={{ mt: 3, boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">Nom</TableCell>
                            <TableCell align="right">Montant donné</TableCell> {/* Ajouter une colonne pour le montant */}
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredClients.map((client) => ( // Utiliser les clients filtrés
                            <TableRow key={client.id}>
                                <TableCell align="right">{client.name}</TableCell>
                                <TableCell align="right">{client.montantDonner || 'N/A'}</TableCell> {/* Afficher le montant */}
                                <TableCell align="right">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleEdit(client)}
                                    >
                                        Modifier
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => handleDelete(client.id)}
                                        sx={{ ml: 1 }}
                                    >
                                        Supprimer
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Page;
