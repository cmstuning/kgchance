import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KgChanceComponent } from './kg-chance.component';

describe('KgChanceComponent', () => {
  let component: KgChanceComponent;
  let fixture: ComponentFixture<KgChanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KgChanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KgChanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
