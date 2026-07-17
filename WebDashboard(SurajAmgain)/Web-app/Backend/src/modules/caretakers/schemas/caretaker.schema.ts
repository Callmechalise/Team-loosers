import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CaretakerDocument = Caretaker & Document;

@Schema({ timestamps: true })
export class Caretaker {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  photo: string;

  @Prop({ required: true })
  shift: string;

  @Prop({ required: true })
  residentsAssigned: number;
}

export const CaretakerSchema = SchemaFactory.createForClass(Caretaker);
