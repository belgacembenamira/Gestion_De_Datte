import React, { useEffect, useState } from 'react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Modal,
    Typography,
    Box,
} from '@mui/material';
import Swal from 'sweetalert2';
import axiosInstance from './axiosInstance';

interface Coffre {
    id: string;
    TypeCoffre: string;
    PoidsCoffre: string;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const CoffrePage: React.FC = () => {
    const [coffres, setCoffres] = useState<Coffre[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedCoffre, setSelectedCoffre] = useState<Coffre | null>(null);
    const [formData, setFormData] = useState<Coffre>({
        id: '',
        TypeCoffre: '',
        PoidsCoffre: '',
    });

    useEffect(() => {
        fetchCoffres();
    }, []);

    const fetchCoffres = async () => {
        try {
            const response = await axiosInstance.get('/'); // Ajoutez l'URL correcte pour les coffres
            setCoffres(response.data);
        } catch (error) {
            Swal.fire('Error', 'Error loading data.', 'error');
        }
    };

    const handleOpen = (coffre?: Coffre) => {
        setFormData(coffre || {
            id: '',
            TypeCoffre: '',
            PoidsCoffre: '',
        });
        setSelectedCoffre(coffre || null);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (selectedCoffre) {
                // Mise à jour d'un coffre existant
                await axiosInstance.patch(`/${selectedCoffre.id}`, formData);
                Swal.fire('Updated!', 'Coffre updated successfully.', 'success');
            } else {
                // Création d'un nouveau coffre
                const { id, ...newCoffreData } = formData; // Supprimez `id` lors de la création
                await axiosInstance.post('/', newCoffreData);  // N'envoyez pas `id` si c'est une création
                Swal.fire('Created!', 'Coffre created successfully.', 'success');
            }
            fetchCoffres();
            handleClose();
        } catch (error) {
            Swal.fire('Error', 'Error saving data.', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/${id}`);
                    Swal.fire('Deleted!', 'Coffre deleted successfully.', 'success');
                    fetchCoffres();
                } catch (error) {
                    Swal.fire('Error', 'Error deleting coffre.', 'error');
                }
            }
        });
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                إضافة الصندوق
            </Button>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>نوع الصندوق</TableCell>
                            <TableCell>وزن الصندوق</TableCell>
                            <TableCell>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {coffres.map((coffre) => (
                            <TableRow key={coffre.id}>
                                <TableCell>{coffre.TypeCoffre || 'N/A'}</TableCell>
                                <TableCell>{coffre.PoidsCoffre || 'N/A'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleOpen(coffre)}>تعديل</Button>
                                    <Button color="secondary" onClick={() => handleDelete(coffre.id)}>
                                        حذف
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        {selectedCoffre ? 'تعديل الصندوق' : 'إضافة الصندوق'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="نوع الصندوق"
                            name="TypeCoffre"
                            value={formData.TypeCoffre}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="وزن الصندوق"
                            name="PoidsCoffre"
                            value={formData.PoidsCoffre}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <Button type="submit" variant="contained" color="primary">
                            حفظ
                        </Button>
                    </form>
                </Box>
            </Modal>
        </div>
    );
};

export default CoffrePage;
