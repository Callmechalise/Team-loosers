import { Injectable } from '@nestjs/common';
import { MOCK_CARETAKERS, MOCK_CARETAKER_PROFILE } from '../../common/constants/mock-data';
import { Caretaker } from '../../common/types';

@Injectable()
export class CaretakersService {
  private caretakers: Caretaker[] = MOCK_CARETAKERS;
  private profile: Caretaker = MOCK_CARETAKER_PROFILE;

  findAll(): Caretaker[] {
    return this.caretakers;
  }

  findOne(id: string): Caretaker | undefined {
    return this.caretakers.find(caretaker => caretaker.id === id);
  }

  getProfile(): Caretaker {
    return this.profile;
  }
}