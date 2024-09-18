import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'pb-d3js-chart',
  templateUrl: './d3js-chart.component.html',
  styleUrls: ['./d3js-chart.component.scss']
})
export class D3jsChartComponent implements OnInit {

  private width = 600;
  private height = 600;
  private radius = Math.min(this.width, this.height) / 2;
  private svg: any;
  private pie: any;
  private arc: any;
  private outerArc: any;
  private color: any;


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

  constructor(
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  private loadData(): void {
    this.dataService.getData().subscribe((res: any) => {
      console.log("Data from server: ", res);
      // Ensure the data is formatted correctly and loaded into the dataSource
      // this.dataSource.datasets[0].data = res.myBudget.map((item: any) => item.budget);
      // this.dataSource.labels = res.myBudget.map((item: any) => item.title);

      this.dataService.getData().subscribe((res: any) => {
        console.log("Data from server: ", res);
        for (var i = 0; i < res.myBudget.length; i++) {
          this.dataSource.datasets[0].data.push(res.myBudget[i].budget);
          this.dataSource.labels.push(res.myBudget[i].title);
        }
      });

      // Now that the data is loaded, create the chart
      this.createSvg();
      this.createColors();
      // this.change(this.dataSource.datasets[0].data);
      this.change();
    });
  }

  private createSvg(): void {
    this.svg = d3.select("#chart")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    this.svg.append("g").attr("class", "slices");
    this.svg.append("g").attr("class", "labels");
    this.svg.append("g").attr("class", "lines");

    this.pie = d3.pie<any>().sort(null).value((d: any) => d);

    this.arc = d3.arc()
      .outerRadius(this.radius * 0.8)
      .innerRadius(this.radius * 0.4);

    this.outerArc = d3.arc()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9);
  }

  private createColors(): void {
    this.color = d3.scaleOrdinal()
      .range(["#ffcd56", "#ff6384", "#36a2eb", "#fd6b19", "#83FF33", "#F633FF", "#FF3333", "#a38080"]);
  }

  private change(): void {
    var data  = this.dataSource.datasets[0].data;
    console.log("Data: ", data);
    const slice = this.svg.select(".slices").selectAll("path.slice")
      .data(this.pie(data), (d: any) => d.index);

    slice.enter()
      .insert("path")
      .style("fill", (d: any) => this.color(d.index))
      .attr("class", "slice");

    slice.transition().duration(1000)
      .attrTween("d", (d: any) => {
        const interpolate = d3.interpolate((this as any)._current || d, d);
        (this as any)._current = interpolate(0);
        return (t: any) => this.arc(interpolate(t));
      });

    slice.exit().remove();

    const text = this.svg.select(".labels").selectAll("text")
      .data(this.pie(data), (d: any) => d.index);

    text.enter().append("text").attr("dy", ".35em")
      .text((d: any) => this.dataSource.labels[d.index]);

    const radius = this.radius;
    const outerArc = this.outerArc;

    text.transition().duration(1000)
      .attrTween("transform", (d: any) => {
        const interpolate = d3.interpolate((this as any)._current || d, d);
        (this as any)._current = interpolate(0);
        return (t: any) => {
          const d2 = interpolate(t);
          const pos = outerArc.centroid(d2);
          pos[0] = radius * (this.midAngle(d2) < Math.PI ? 1 : -1);
          return "translate(" + pos + ")";
        };
      })
      .styleTween("text-anchor", (d: any) => {
        const interpolate = d3.interpolate((this as any)._current || d, d);
        (this as any)._current = interpolate(0);
        return (t: any) => {
          const d2 = interpolate(t);
          return this.midAngle(d2) < Math.PI ? "start" : "end";
        };
      });

    text.exit().remove();

    const polyline = this.svg.select(".lines").selectAll("polyline")
      .data(this.pie(data), (d: any) => d.index);

    polyline.enter().append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", (d: any) => {
        const interpolate = d3.interpolate((this as any)._current || d, d);
        (this as any)._current = interpolate(0);
        return (t: any) => {
          const d2 = interpolate(t);
          const pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (this.midAngle(d2) < Math.PI ? 1 : -1);
          return [this.arc.centroid(d2), outerArc.centroid(d2), pos];
        };
      });

    polyline.exit().remove();
  }

  private midAngle(d: any): number {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
}
