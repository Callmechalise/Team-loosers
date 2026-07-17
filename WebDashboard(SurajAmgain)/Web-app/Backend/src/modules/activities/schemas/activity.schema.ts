import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityDocument = ActivityEvent & Document;

@Schema({ timestamps: true })
export class ActivityEvent {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  actor: string;

  @Prop({ required: true })
  time: number;

  @Prop({ required: true })
  icon: string;
}

export const ActivitySchema = SchemaFactory.createForClass(ActivityEvent);
