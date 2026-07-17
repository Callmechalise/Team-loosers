import { Injectable } from '@nestjs/common';
import { MOCK_FALLS } from '../../common/constants/mock-data';
import { FallEvent } from '../../common/types';

@Injectable()
export class FallsService {
  private falls: FallEvent[] = MOCK_FALLS;

  findAll(): FallEvent[] {
    return this.falls;
  }

  findOne(id: string): FallEvent | undefined {
    return this.falls.find(fall => fall.id === id);
  }

  getPending(): FallEvent[] {
    return this.falls.filter(fall => fall.responseStatus === 'pending');
  }
}