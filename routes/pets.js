import express from 'express';
import { createPet, getMyPets, getPetsForFeed, updatePet, deletePet, addPhotos, removePhoto } from '../controllers/petController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect); 

// Ruta para crear mascota y subir a Cloudinary
router.post('/', upload.array('photos', 3), createPet);

router.get('/my-pets', getMyPets);

router.get('/', getPetsForFeed);

router.put('/:id', upload.array('photos', 3), updatePet);

router.post("/:id/photos", upload.array("photos", 3), addPhotos)

router.delete("/:id/photos", removePhoto)

router.delete('/:id', deletePet);

export default router;