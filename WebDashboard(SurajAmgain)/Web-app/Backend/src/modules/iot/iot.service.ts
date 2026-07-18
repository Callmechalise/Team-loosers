import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IotData, IotDataDocument } from './schemas/iot-data.schema';
import { EmergencyAlert, EmergencyAlertDocument } from './schemas/emergency-alert.schema';
import { HealthDataDto } from './dto/health-data.dto';
import { EmergencyAlertDto } from './dto/emergency-alert.dto';

@Injectable()
export class IotService {
  constructor(
    @InjectModel(IotData.name) private iotDataModel: Model<IotDataDocument>,
    @InjectModel(EmergencyAlert.name) private emergencyAlertModel: Model<EmergencyAlertDocument>,
  ) {}

  async receiveData(healthData: HealthDataDto): Promise<any> {
    console.log('\n========== Received Data ==========');
    console.log('Card ID      :', healthData.card_id);
    console.log('Heart Rate   :', healthData.heartrate);
    console.log('SpO2         :', healthData.spo2);
    console.log('Timestamp    :', healthData.timestamp);
    console.log('Location     :', healthData.lat, healthData.lng);
    console.log('Speed        :', healthData.speed);
    console.log('Accel        :', healthData.ax, healthData.ay, healthData.az);
    console.log('Received At  :', new Date());
    console.log('===================================\n');

    const savedData = await this.saveIotData(healthData);
    
    if (this.isValidData(healthData)) {
      await this.checkForAlerts(healthData);
    }

    return {
      status: 'success',
      message: 'Data received',
      data: savedData,
    };
  }

  async receiveAlert(alertData: EmergencyAlertDto): Promise<any> {
    console.log('\n🚨🚨🚨 EMERGENCY ALERT 🚨🚨🚨');
    console.log('Card ID      :', alertData.card_id);
    console.log('Alert Type   :', alertData.msg);
    console.log('Coordinates  :', alertData.lat, alertData.lng);
    console.log('Timestamp    :', alertData.timestamp);
    console.log('Received At  :', new Date());
    console.log('🚨🚨🚨==========================🚨🚨🚨\n');

    const savedAlert = await this.saveEmergencyAlert(alertData);

    const response = {
      Alert: true,
      msg: alertData.msg || 'Emergency Alert',
      lat: alertData.lat || 0,
      lng: alertData.lng || 0,
      timestamp: alertData.timestamp || Date.now(),
      card_id: alertData.card_id,
      status: 'pending'
    };

    return {
      status: 'success',
      message: 'Emergency alert received',
      alert: response,
    };
  }

  private async saveEmergencyAlert(alertData: EmergencyAlertDto): Promise<EmergencyAlert> {
    const newAlert = new this.emergencyAlertModel({
      card_id: alertData.card_id,
      msg: alertData.msg || 'Emergency Alert',
      lat: alertData.lat || 0,
      lng: alertData.lng || 0,
      timestamp: alertData.timestamp || Date.now(),
      receivedAt: new Date(),
      acknowledged: false,
      status: 'pending',
    });
    
    return await newAlert.save();
  }

  async getAllAlerts(): Promise<EmergencyAlert[]> {
    return this.emergencyAlertModel
      .find()
      .sort({ timestamp: -1 })
      .exec();
  }

  async getDeviceAlerts(cardId: string): Promise<EmergencyAlert[]> {
    return this.emergencyAlertModel
      .find({ card_id: cardId })
      .sort({ timestamp: -1 })
      .exec();
  }

  private isValidData(healthData: HealthDataDto): boolean {
    const { heartrate, spo2 } = healthData;
    
    if (heartrate !== undefined && heartrate !== null && heartrate > 0) {
      if (heartrate < 30 || heartrate > 200) {
        return false;
      }
    }
    
    if (spo2 !== undefined && spo2 !== null && spo2 > 0) {
      if (spo2 < 70 || spo2 > 100) {
        return false;
      }
    }
    
    return true;
  }

  private async saveIotData(healthData: HealthDataDto): Promise<IotData> {
    const newData = new this.iotDataModel({
      card_id: healthData.card_id,
      heartrate: healthData.heartrate || 0,
      spo2: healthData.spo2 || 0,
      timestamp: healthData.timestamp || Date.now(),
      receivedAt: new Date(),
      lat: healthData.lat || 0,
      lng: healthData.lng || 0,
      speed: healthData.speed || 0,
      ax: healthData.ax || 0,
      ay: healthData.ay || 0,
      az: healthData.az || 0,
      fallDetected: healthData.fallDetected || false,
      btn_alert: healthData.btn_alert || false,
    });
    
    return await newData.save();
  }

  private async checkForAlerts(healthData: HealthDataDto): Promise<void> {
    const { card_id, heartrate, spo2 } = healthData;
    
    if (!heartrate && !spo2) return;

    let alertType: string | null = null;
    let severity = 'info';
    let message = '';

    if (heartrate && heartrate > 0) {
      if (heartrate > 120) {
        alertType = 'heart-rate-high';
        severity = 'warning';
        message = 'High heart rate: ' + heartrate + ' BPM';
      } else if (heartrate < 50 && heartrate > 20) {
        alertType = 'heart-rate-low';
        severity = 'warning';
        message = 'Low heart rate: ' + heartrate + ' BPM';
      }
    }

    if (spo2 && spo2 > 0) {
      if (spo2 < 90 && spo2 >= 70) {
        alertType = 'spo2-low';
        severity = 'critical';
        message = 'Low blood oxygen: ' + spo2 + '%';
      }
    }

    if (healthData.fallDetected) {
      alertType = 'fall-detected';
      severity = 'critical';
      message = 'Fall detected! Immediate attention required.';
    }

    if (healthData.btn_alert) {
      alertType = 'btn_alert';
      severity = 'critical';
      message = 'Emergency button pressed! Immediate attention required.';
    }

    if (alertType) {
      console.log('⚠️ ALERT - ' + severity + ': ' + message + ' (Card: ' + card_id + ')');
    }
  }

  async getDeviceData(cardId: string, limit: number = 100): Promise<IotData[]> {
    return this.iotDataModel
      .find({ card_id: cardId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getLatestDeviceData(cardId: string): Promise<IotData | null> {
    return this.iotDataModel
      .findOne({ card_id: cardId })
      .sort({ timestamp: -1 })
      .exec();
  }

  async getAllLatestData(): Promise<IotData[]> {
    const allData = await this.iotDataModel
      .find()
      .sort({ timestamp: -1 })
      .exec();
    
    const latestMap = new Map();
    for (const item of allData) {
      if (!latestMap.has(item.card_id)) {
        latestMap.set(item.card_id, item);
      }
    }
    
    return Array.from(latestMap.values());
  }

  async getDataByTimeRange(
    cardId: string,
    startTime: number,
    endTime: number,
  ): Promise<IotData[]> {
    return this.iotDataModel
      .find({
        card_id: cardId,
        timestamp: { 
          $gte: startTime, 
          $lte: endTime 
        },
      })
      .sort({ timestamp: -1 })
      .exec();
  }
}