import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IotDataDocument = IotData & Document;

@Schema({ timestamps: true })
export class IotData {
  @Prop({ required: true, index: true })
  card_id: string;

  @Prop({ type: Number, default: 0 })
  heartrate: number;

  @Prop({ type: Number, default: 0 })
  spo2: number;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ type: Date, default: Date.now })
  receivedAt: Date;

  @Prop({ type: Number, default: 0 })
  lat: number;

  @Prop({ type: Number, default: 0 })
  lng: number;

  @Prop({ type: Number, default: 0 })
  speed: number;

  @Prop({ type: Number, default: 0 })
  ax: number;

  @Prop({ type: Number, default: 0 })
  ay: number;

  @Prop({ type: Number, default: 0 })
  az: number;

  @Prop({ type: Boolean, default: false })
  fallDetected: boolean;

  @Prop({ type: Boolean, default: false })
  btn_alert: boolean;

  @Prop({ type: String })
  residentId: string;
}

export const IotDataSchema = SchemaFactory.createForClass(IotData);

IotDataSchema.index({ card_id: 1, timestamp: -1 });
IotDataSchema.index({ receivedAt: -1 });
