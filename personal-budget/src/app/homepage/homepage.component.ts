import { Component, OnDestroy, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy, AfterViewInit {

  public dataSource = {
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [
          '#ffcd56',
          '#ff6384',
          '#36a2eb',
          '#fd6b19',
          '#23d160',
          '#e84393',
          '#ff5733',
          '#ff8c33',
        ],
      }
    ],
    labels: [] as string[]
  };

  private myPieChart: Chart<'pie', number[], string> | undefined;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.http.get('http://localhost:3000/budget')
      .subscribe((res: any) => {
        for (var i = 0; i < res.myBudget.length; i++) {
          this.dataSource.datasets[0].data[i] = res.myBudget[i].budget;
          this.dataSource.labels[i] = res.myBudget[i].title;
        }
      });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  createChart() {
    if (isPlatformBrowser(this.platformId)) {
      var canvas = document.getElementById("myChart") as HTMLCanvasElement | null;
      if (canvas) {
        if (this.myPieChart) {
          this.myPieChart.destroy();
        }

        var ctx = canvas.getContext("2d");
        if (ctx) {
          this.myPieChart = new Chart<'pie', number[], string>(ctx, {
            type: 'pie',
            data: this.dataSource,
          });
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.myPieChart) {
      this.myPieChart.destroy();
    }
  }
}
