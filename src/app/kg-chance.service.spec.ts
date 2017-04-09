import { TestBed, inject } from '@angular/core/testing';

import { KgChanceService } from './kg-chance.service';

describe('KgChanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KgChanceService]
    });
  });

  it('should ...', inject([KgChanceService], (service: KgChanceService) => {
    expect(service).toBeTruthy();
  }));
});
