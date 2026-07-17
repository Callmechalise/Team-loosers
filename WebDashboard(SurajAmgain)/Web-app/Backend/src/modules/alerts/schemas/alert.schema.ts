import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertDocument = AlertEvent & Document;

@Schema({ timestamps: true })
export class AlertEvent {
  @Prop({ required: true })
  residentId: string;

  @Prop({ required: true })
  residentName: string;

  @Prop({ required: true })
  room: string;

  @Prop({ required: true })
  photo: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, enum: ['critical', 'warning', 'info'] })
  severity: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  time: number;

  @Prop({ default: false })
  acknowledged: boolean;

  @Prop()
  acknowledgedBy?: string;

  @Prop()
  acknowledgedAt?: number;
}

export const AlertSchema = SchemaFactory.createForClass(AlertEvent);
