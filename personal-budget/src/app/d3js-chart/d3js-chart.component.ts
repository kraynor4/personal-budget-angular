import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pb-d3js-chart',
  templateUrl: './d3js-chart.component.html',
  styleUrls: ['./d3js-chart.component.scss']
})
export class D3jsChartComponent implements OnInit, OnDestroy {

  private width = 450;
  private height = 450;
  private margin = 40;
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private svg: any;
  private pie: any;
  private arc: any;
  private outerArc: any;
  private color: any;

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

  private routerSubscription: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Listen to route changes and reload the chart when navigation occurs
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (isPlatformBrowser(this.platformId)) {
          this.loadData();
        }
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    // Cleanup subscription when the component is destroyed
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadData(): void {
    // Clear previous SVG (to prevent multiple SVGs being added)
    d3.select("#chart").selectAll("*").remove();

    // Clear the existing data to avoid duplicates
    this.dataSource.datasets[0].data = [];
    this.dataSource.labels = [];

    this.dataService.getData().subscribe((res: any) => {
      console.log("Data from server: ", res);

      // Populate data and labels
      res.myBudget.forEach((item: any) => {
        this.dataSource.datasets[0].data.push(item.budget);
        this.dataSource.labels.push(item.title);
      });

      this.createSvg();
      this.createColors();
      this.createDonutChart();
    });
  }

  private createSvg(): void {
    this.svg = d3.select("#chart")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)  // Make the chart responsive
      .attr("preserveAspectRatio", "xMinYMin meet")  // Preserve the aspect ratio
      .append("g")
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    this.svg.append("g").attr("class", "slices");
    this.svg.append("g").attr("class", "labels");
    this.svg.append("g").attr("class", "lines");

    this.pie = d3.pie<any>().sort(null).value((d: any) => d.value);
  }

  private createColors(): void {
    this.color = d3.scaleOrdinal()
      .domain(this.dataSource.labels)
      .range(this.dataSource.datasets[0].backgroundColor);
  }

  private createDonutChart(): void {
    const data = this.dataSource.labels.map((label, i) => ({
      key: label,
      value: this.dataSource.datasets[0].data[i]
    }));

    const pieData = this.pie(data);

    // Arc generator
    this.arc = d3.arc()
      .innerRadius(this.radius * 0.5) // Donut hole size
      .outerRadius(this.radius * 0.8);

    // Outer arc for labels
    this.outerArc = d3.arc()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9);

    // Add slices
    this.svg.selectAll('allSlices')
      .data(pieData)
      .enter()
      .append('path')
      .attr('d', this.arc)
      .attr('fill', (d: any) => this.color(d.data.key))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7);

    // Add polylines between chart and labels
    this.svg.selectAll('allPolylines')
      .data(pieData)
      .enter()
      .append('polyline')
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', (d: any) => {
        const posA = this.arc.centroid(d);
        const posB = this.outerArc.centroid(d);
        const posC = this.outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = this.radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      });

    // Add labels for category names
    this.svg.selectAll('allLabels')
      .data(pieData)
      .enter()
      .append('text')
      .text((d: any) => d.data.key)
      .attr('transform', (d: any) => {
        const pos = this.outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = this.radius * 0.99 * (midAngle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
      })
      .style('text-anchor', (d: any) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midAngle < Math.PI ? 'start' : 'end');
      });

    // Add numerical value labels inside the pie slices
    this.svg.selectAll('allValues')
      .data(pieData)
      .enter()
      .append('text')
      .text((d: any) => d.data.value)  // Display the value (budget amount)
      .attr('transform', (d: any) => {
        const pos = this.arc.centroid(d);  // Position inside the slice
        return `translate(${pos})`;
      })
      .style('text-anchor', 'middle')
      .style('font-size', '12px')  // Adjust font size
      .style('fill', 'white',);  // Color the text to stand out against the pie slices
  }
}
