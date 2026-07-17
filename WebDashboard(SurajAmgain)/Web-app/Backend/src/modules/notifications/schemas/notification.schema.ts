import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = NotificationItem & Document;

@Schema({ timestamps: true })
export class NotificationItem {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  time: number;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  residentId?: string;

  @Prop()
  residentName?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationItem);
