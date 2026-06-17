import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
    {
        fromPet: { //mascota que da like
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Pet', 
        },
        toPet: { // mascota que recibe el like
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Pet',
        },
        status: {
            type: String,
            enum: ['like', 'dislike', 'match'], // match
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

matchSchema.index({ fromPet: 1, toPet: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);

export default Match;
