import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Poll } from '../components/poll-panel/poll-panel.component';
import { Observable, catchError, map, throwError } from 'rxjs';

// const BASE_HREF: string = "http://localhost:5000/polls";

@Injectable({
  providedIn: 'root'
})
export class PollSyncService {

  private baseHref: string;

  constructor(private http: HttpClient) {
    let cookies = new Map<string, string>();
    for(let cookie of document.cookie.split(";")) {
      let [key, value] = cookie.split("=");
      cookies.set(key.trim(), value.trim());
    }

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
    return this.http.post(this.baseHref + "/" + sessionId, null, {params: {nickname, responseIndex}}).pipe(
      map(response => response as string),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  closePoll(sessionId: string): Observable<Poll> {
    return this.http.post(this.baseHref + "/" + sessionId, null, {params: {status: "closed"}}).pipe(
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
    return throwError(() => {
      if(error.status != 404 || !ignoreNotFound)
        return new Error('Server error (' + error.status + '): ' + error.text);
      return null;
    });
  }

}
