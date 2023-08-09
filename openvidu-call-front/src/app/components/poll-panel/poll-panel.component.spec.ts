import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollPanelComponent } from './poll-panel.component';

describe('PollPanelComponent', () => {
  let component: PollPanelComponent;
  let fixture: ComponentFixture<PollPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
