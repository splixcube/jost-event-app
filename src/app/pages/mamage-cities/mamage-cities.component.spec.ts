import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MamageCitiesComponent } from './mamage-cities.component';

describe('MamageCitiesComponent', () => {
  let component: MamageCitiesComponent;
  let fixture: ComponentFixture<MamageCitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MamageCitiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MamageCitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
