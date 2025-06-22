import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, } from '@angular/common/http/testing';

import { CallComponent } from './call.component';

describe('CallComponent', () => {
  let component: CallComponent;
  let fixture: ComponentFixture<CallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallComponent ],
      imports: [ HttpClientTestingModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
