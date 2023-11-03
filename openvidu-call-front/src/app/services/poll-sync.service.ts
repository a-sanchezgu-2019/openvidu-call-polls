import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Poll } from 'src/app/models/poll.model';
import { Observable, catchError, map, throwError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PollSyncService {

  private baseHref: string;

  constructor(private http: HttpClient) {
    this.baseHref = '/' + (!!window.location.pathname.split('/')[1] ? window.location.pathname.split('/')[1] + '/polls' : 'polls');
  }

  createPoll(poll: Poll): Observable<Poll> {
    return this.http.post(this.baseHref, poll).pipe(
      map(response => response as Poll),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  getPoll(sessionId: string, ignoreNotFound: boolean = false): Observable<Poll> {
    return this.http.get(this.baseHref + "/" + sessionId).pipe(
      map(response => response as Poll),
      catchError(error => this.handleError(error, ignoreNotFound))
    ) as Observable<Poll>;
  }

  respondPoll(sessionId: string, nickname: string, responseIndex: number): Observable<Poll> {
    return this.http.put(this.baseHref + "/" + sessionId, null, {params: {nickname, responseIndex}}).pipe(
      map(response => response as Poll),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  closePoll(sessionId: string): Observable<Poll> {
    return this.http.put(this.baseHref + "/" + sessionId, null, {params: {status: "closed"}}).pipe(
      map(response => response as Poll),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  deletePoll(sessionId: string): Observable<Poll> {
    return this.http.delete(this.baseHref + "/" + sessionId).pipe(
      map(response => response as Poll),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  private handleError(error: any, ignoreNotFound: boolean = false) {
    if(error.status != 404 || !ignoreNotFound)
      return throwError(() => new Error("Server error(" + error.status + "): " + error.text));
    return of(null);
  }

}
