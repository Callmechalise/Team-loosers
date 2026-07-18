import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmergencyAlertDocument = EmergencyAlert & Document;

@Schema({ timestamps: true })
export class EmergencyAlert {
  @Prop({ required: true, index: true })
  card_id: string;

  @Prop({ required: true })
  msg: string;

  @Prop({ type: Number, default: 0 })
  lat: number;

  @Prop({ type: Number, default: 0 })
  lng: number;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ type: Date, default: Date.now })
  receivedAt: Date;

  @Prop({ type: Boolean, default: false })
  acknowledged: boolean;

  @Prop({ type: String })
  acknowledgedBy: string;

  @Prop({ type: Date })
  acknowledgedAt: Date;

  @Prop({ type: String, default: 'pending' })
  status: string; // 'pending', 'responding', 'resolved'
}

export const EmergencyAlertSchema = SchemaFactory.createForClass(EmergencyAlert);

EmergencyAlertSchema.index({ card_id: 1, timestamp: -1 });
EmergencyAlertSchema.index({ receivedAt: -1 });
