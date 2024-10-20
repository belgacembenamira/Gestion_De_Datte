"use client";
import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Snackbar,
    IconButton,
    Typography,
} from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

// Define TypeDeDatte interface
interface TypeDeDatte {
    id: number;
    name: string;  // Changed from 'type' to 'name'
    prix: number;
}

// Custom hook to fetch types de dattes
const useTypeDeDattes = () => {
    const [typesDeDattes, setTypesDeDattes] = useState<TypeDeDatte[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTypesDeDattes = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/types-de-dattes');
            setTypesDeDattes(response.data);
        } catch (err) {
            setError('خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypesDeDattes();
    }, []);

    return { typesDeDattes, loading, error, refetch: fetchTypesDeDattes };
};

// Main CRUD component
const Page: React.FC = () => {
    const { typesDeDattes, loading, error, refetch } = useTypeDeDattes();
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTypeDeDatte, setSelectedTypeDeDatte] = useState<TypeDeDatte | null>(null);
    const [formData, setFormData] = useState<{ name: string; prix: number }>({ name: '', prix: 0 });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleClickOpen = (typeDeDatte: TypeDeDatte | null = null) => {
        if (typeDeDatte) {
            setSelectedTypeDeDatte(typeDeDatte);
            setFormData({ name: typeDeDatte.name, prix: typeDeDatte.prix });
            setEditMode(true);
        } else {
            setFormData({ name: '', prix: 0 });
            setEditMode(false);
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setSelectedTypeDeDatte(null);
    };

    const handleSubmit = async () => {
        try {
            if (editMode && selectedTypeDeDatte) {
                await axios.patch(`http://localhost:5000/types-de-dattes/${selectedTypeDeDatte.id}`, formData);
                setSnackbarMessage('تم تحديث نوع التمر بنجاح');
            } else {
                await axios.post('http://localhost:5000/types-de-dattes', formData);
                setSnackbarMessage('تم إضافة نوع تمر جديد بنجاح');
            }
            refetch(); // Refetch types after mutation
            setSnackbarOpen(true);
        } catch (err) {
            setSnackbarMessage('خطأ في عملية الإضافة أو التحديث');
            setSnackbarOpen(true);
        } finally {
            handleClose();
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:5000/types-de-dattes/${id}`);
            setSnackbarMessage('تم حذف نوع التمر بنجاح');
            refetch(); // Refetch types after deletion
            setSnackbarOpen(true);
        } catch (err) {
            setSnackbarMessage('خطأ في عملية الحذف');
            setSnackbarOpen(true);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                إدارة أنواع التمر
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleClickOpen()}
                style={{ marginBottom: '20px' }}
            >
                إضافة نوع تمر
            </Button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>النوع</TableCell>
                            <TableCell>السعر (TND)</TableCell>
                            <TableCell>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {typesDeDattes.map((typeDeDatte) => (
                            <TableRow key={typeDeDatte.id}>
                                <TableCell>{typeDeDatte.name}</TableCell>
                                <TableCell>{typeDeDatte.prix}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleClickOpen(typeDeDatte)} color="primary" variant="outlined" style={{ marginRight: '10px' }}>
                                        تعديل
                                    </Button>
                                    <Button onClick={() => handleDelete(typeDeDatte.id)} color="secondary" variant="outlined">
                                        حذف
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{editMode ? 'تعديل نوع التمر' : 'إضافة نوع تمر'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="النوع"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="السعر"
                        value={formData.prix}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, prix: parseFloat(e.target.value) })}
                        fullWidth
                        margin="normal"
                        type="number"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        إلغاء
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        {editMode ? 'تحديث' : 'إضافة'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for feedback messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackbarOpen(false)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </div>
    );
};

export default Page;
