import { Test, TestingModule } from '@nestjs/testing';
import { AutoTranslateService } from './auto-translate.service';

describe('AutoTranslateService', () => {
  let service: AutoTranslateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoTranslateService],
    }).compile();

    service = module.get<AutoTranslateService>(AutoTranslateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
