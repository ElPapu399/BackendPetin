import express from 'express';
import {
    createPet,
    getMyPets,
    getPetsForFeed,
    getPetById,
    updatePet,
    deletePet,
    addPetPhotos,
    removePetPhoto
} from '../controllers/petController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect); 

// Ruta para crear mascota y subir a Cloudinary
router.post('/', upload.array('photos', 3), createPet);

router.get('/my-pets', getMyPets);

router.get('/', getPetsForFeed);

router.get('/:id', getPetById);

router.put('/:id', upload.array('photos', 3), updatePet);

router.delete('/:id', deletePet);

router.post('/:id/photos', upload.array('photos', 6), addPetPhotos);

router.delete('/:id/photos', removePetPhoto);

export default router;
