import { Test, TestingModule } from '@nestjs/testing';
import { FallsService } from './falls.service';

describe('FallsService', () => {
  let service: FallsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FallsService],
    }).compile();

    service = module.get<FallsService>(FallsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
