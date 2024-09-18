import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private data: any[] | null = null;

  constructor(private http: HttpClient) {}

  // Method to get data, either from cache or by making an HTTP call
  getData(): Observable<any[]> {
    if (this.data) {
      // If data is already loaded, return it as an observable
      return of(this.data);
    } else {
      // Make an HTTP call to fetch the data
      console.log('Fetching data from server');
      return this.http.get<any[]>('Http://localhost:3000/budget').pipe(
        map(res => {
          this.data = res;
          return this.data;
        })
      );
    }
  }
}
