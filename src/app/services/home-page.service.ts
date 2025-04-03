import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HomePageService {
  private readonly API_URL = 'http://144.22.240.151:3000/api';

  constructor(private http: HttpClient) {}

  getPolylinesForMultipleLines(lineIds: string[]): Observable<any[]> {
    const requests = lineIds.map(id =>
      this.http.get<any>(`${this.API_URL}/map/polylines/${id}`)
    );

    return forkJoin(requests).pipe(
      map(responses => {
        // Combina as polylines de todas as respostas
        return responses.reduce((acc, curr) => {
          if (curr.polylines) {
            return [...acc, ...curr.polylines];
          }
          return acc;
        }, []);
      })
    );
  }
}
