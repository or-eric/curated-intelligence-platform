import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Briefing } from './briefing';

describe('Briefing', () => {
  let component: Briefing;
  let fixture: ComponentFixture<Briefing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Briefing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Briefing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
