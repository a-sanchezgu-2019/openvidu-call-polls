import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollCreationComponent } from './poll-creation.component';

describe('PollCreationComponent', () => {
  let component: PollCreationComponent;
  let fixture: ComponentFixture<PollCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollCreationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
