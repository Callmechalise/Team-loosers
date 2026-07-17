import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResidentDocument = Resident & Document;

@Schema({ timestamps: true })
export class Resident {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop({ required: true })
  photo: string;

  @Prop({ required: true })
  room: string;

  @Prop({ required: true })
  bed: string;

  @Prop({ required: true })
  building: string;

  @Prop({ required: true })
  floor: string;

  @Prop({ type: [String], default: [] })
  medicalConditions: string[];

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ required: true })
  assignedCaretaker: string;

  @Prop({ required: true, enum: ['healthy', 'warning', 'emergency'] })
  status: string;

  @Prop({ type: Object, default: {} })
  emergencyContacts: any[];

  @Prop({ type: Object, default: {} })
  medicalHistory: any[];

  @Prop({ type: Object, default: {} })
  medications: any[];

  @Prop({ type: Object, default: {} })
  device: any;

  @Prop({ type: Object, default: {} })
  vitals: any;

  @Prop({ required: true })
  indoorLocation: string;

  @Prop({ required: true })
  joinedDate: string;
}

export const ResidentSchema = SchemaFactory.createForClass(Resident);
