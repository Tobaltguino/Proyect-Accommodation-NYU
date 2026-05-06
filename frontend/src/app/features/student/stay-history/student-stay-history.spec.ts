import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentStayHistory } from './student-stay-history';

describe('StudentStayHistory', () => {
  let component: StudentStayHistory;
  let fixture: ComponentFixture<StudentStayHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentStayHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentStayHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
