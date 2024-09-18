import { Component, OnDestroy, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from '../data.service';  // Import the DataService

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy, AfterViewInit {

  public dataSource = {
    datasets: [
      {
        data: [''] ,
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
    labels: ['']
  };

  private myPieChart: Chart<'pie', number[], string> | undefined;

  constructor(
    private dataService: DataService,  // Inject the DataService
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  loadData(): void {
    this.dataService.getData().subscribe((res: any) => {
      console.log("Data from server: ", res);
      for (var i = 0; i < res.myBudget.length; i++) {
        this.dataSource.datasets[0].data.push(res.myBudget[i].budget);
        this.dataSource.labels.push(res.myBudget[i].title);
      }
    });
  }

  createChart(): void {
    if (isPlatformBrowser(this.platformId)) {

      const canvas = document.getElementById("myChart") as HTMLCanvasElement | null;
      if (canvas) {

    console.log("Creating chart with data source: ", this.dataSource);
        if (this.myPieChart) {
          this.myPieChart.destroy();
        }

        const ctx = <HTMLCanvasElement>document.getElementById('myChart');

          var myPieChart = new Chart(ctx, {
            type: 'pie',
            data: this.dataSource,
          });

      }
    }
  }

  ngOnDestroy(): void {
    if (this.myPieChart) {
      this.myPieChart.destroy();
    }
  }
}
