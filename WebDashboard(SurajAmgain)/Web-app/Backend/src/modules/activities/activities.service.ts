import { Injectable } from '@nestjs/common';
import { MOCK_ACTIVITIES } from '../../common/constants/mock-data';
import { ActivityEvent } from '../../common/types';

@Injectable()
export class ActivitiesService {
  private activities: ActivityEvent[] = MOCK_ACTIVITIES;

  findAll(): ActivityEvent[] {
    return this.activities;
  }

  findOne(id: string): ActivityEvent | undefined {
    return this.activities.find(activity => activity.id === id);
  }

  getRecent(limit: number = 10): ActivityEvent[] {
    return this.activities
      .sort((a, b) => b.time - a.time)
      .slice(0, limit);
  }
}