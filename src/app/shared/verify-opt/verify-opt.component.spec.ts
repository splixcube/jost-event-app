import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyOptComponent } from './verify-opt.component';

describe('VerifyOptComponent', () => {
  let component: VerifyOptComponent;
  let fixture: ComponentFixture<VerifyOptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyOptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyOptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
