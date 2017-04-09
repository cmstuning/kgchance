import { TestBed, inject } from '@angular/core/testing';

import { KgQuotaService } from './kg-quota.service';

describe('KgQuotaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KgQuotaService]
    });
  });

  it('should ...', inject([KgQuotaService], (service: KgQuotaService) => {
    expect(service).toBeTruthy();
  }));
});
