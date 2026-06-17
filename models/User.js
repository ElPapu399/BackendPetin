import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// para guardar usuario
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
        },
        email: {
            type: String,
            required: [true, 'El correo electrónico es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: function() {
                return this.authProvider === 'local';
            },
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },
    },
    {
        timestamps: true, //en las columnas de "createdAt" y "updatedAt"
    }
);

// ------------------------------------------
// MIDDLEWARE DE MONGOOSE antes de guardar
// ------------------------------------------
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ------------------------------------------
//  COMPARAR CONTRASEÑA
// ------------------------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
