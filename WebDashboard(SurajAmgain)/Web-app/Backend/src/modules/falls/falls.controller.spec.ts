import { Test, TestingModule } from '@nestjs/testing';
import { FallsController } from './falls.controller';
import { FallsService } from './falls.service';

describe('FallsController', () => {
  let controller: FallsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FallsController],
      providers: [FallsService],
    }).compile();

    controller = module.get<FallsController>(FallsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
