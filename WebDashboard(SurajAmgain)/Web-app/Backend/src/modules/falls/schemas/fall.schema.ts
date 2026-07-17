import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FallDocument = FallEvent & Document;

@Schema({ timestamps: true })
export class FallEvent {
  @Prop({ required: true })
  residentId: string;

  @Prop({ required: true })
  residentName: string;

  @Prop({ required: true })
  photo: string;

  @Prop({ required: true })
  room: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  time: number;

  @Prop({ required: true, enum: ['pending', 'resolved', 'dispatched'] })
  responseStatus: string;

  @Prop({ required: true })
  assignedCaretaker: string;

  @Prop({ required: true })
  responseTimeSeconds: number;
}

export const FallSchema = SchemaFactory.createForClass(FallEvent);
