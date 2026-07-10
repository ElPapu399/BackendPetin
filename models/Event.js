import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["veterinaria", "parque", "evento_adopcion", "tienda"],
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true }, 
    },
    sponsorName: { type: String }, // empresas, veterinarias
    photo: { type: String },
  },
  { timestamps: true },
);

eventSchema.index({ location: "2dsphere" });

const Event = mongoose.model("Event", eventSchema);

export default Event;
