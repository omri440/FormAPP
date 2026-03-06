import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSubmission } from './form-submission';

describe('FormSubmission', () => {
  let component: FormSubmission;
  let fixture: ComponentFixture<FormSubmission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSubmission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSubmission);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
