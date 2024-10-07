import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: "admin";
  created_at: Date;
  edited_at: Date;
}

const adminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin", immutable: true },
  created_at: { type: Date, default: Date.now },
  edited_at: { type: Date, default: Date.now },
});

const Admin = model<IAdmin>("Admin", adminSchema);

export default Admin;
