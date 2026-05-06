import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentIncidents } from './student-incidents';

describe('StudentIncidents', () => {
  let component: StudentIncidents;
  let fixture: ComponentFixture<StudentIncidents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentIncidents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentIncidents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
