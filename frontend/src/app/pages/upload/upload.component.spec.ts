import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadComponent } from './upload.component.js';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserTestingModule } from '@angular/platform-browser/testing';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadComponent, HttpClientTestingModule, BrowserTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
