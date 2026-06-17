import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', 
        },
        name: {
            type: String,
            required: [true, 'El nombre de la mascota es obligatorio'],
        },
        type: {
            type: String,
            enum: ['perro', 'gato', 'otro'],
            required: [true, 'El tipo de mascota es obligatorio'],
        },
        breed: {
            type: String,
            required: [true, 'La raza es obligatoria'],
        },
        age: {
            type: Number,
            required: [true, 'La edad es obligatoria'],
        },
        description: {
            type: String,
            maxLength: 500,
        },
        photos: [
            {
                type: String, // urlsde Cloudinary
            }
        ],
      
        lookingFor: {
            type: String,
            enum: ['amistad', 'pareja', 'paseos'],
            default: 'amistad'
        }
    },
    {
        timestamps: true,
    }
);

const Pet = mongoose.model('Pet', petSchema);

export default Pet;
