import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3jsChartComponent } from './d3js-chart.component';

describe('D3jsChartComponent', () => {
  let component: D3jsChartComponent;
  let fixture: ComponentFixture<D3jsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [D3jsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3jsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
