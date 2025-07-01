import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { parsePollDTO, Poll, PollDefinition, PollDTO, PollResponse, PollResult } from 'src/app/models/poll.model';
import { Observable, catchError, map, throwError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PollSyncService {

  private baseHref: string;
  private backendSynchronization: boolean = true;

  constructor(private http: HttpClient) {
    this.baseHref = '/' + (!!window.location.pathname.split('/')[1] ? window.location.pathname.split('/')[1] + "/polls": "polls");
    this.http.get(this.baseHref + "/pollSync/config").pipe(
      map(response => response as {pollSyncEnabled: boolean}),
      catchError(error => this.handleError(error))
    ).subscribe({
      next: config => {
        this.backendSynchronization = config.pollSyncEnabled;
      },
      error: _ => console.log("Couldn't fetch pollSynchronization configuration")
    });
  }

  isBackendSyncEnabled(): boolean {
    return this.backendSynchronization;
  }

  createPoll(definition: PollDefinition): Observable<Poll> {
    definition = this.modifyDefinitionForBackend(definition);
    return this.http.post(this.baseHref, definition).pipe(
      map(response => parsePollDTO(response as PollDTO)),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  getPoll(sessionId: string, ignoreNotFound: boolean = false): Observable<Poll> {
    return this.http.get(this.baseHref + "/" + sessionId).pipe(
      map(response => parsePollDTO(response as PollDTO)),
      catchError(error => this.handleError(error, ignoreNotFound))
    ) as Observable<Poll>;
  }

  respondPoll(sessionId: string, pollResponse: PollResponse): Observable<Poll> {
    let backResponse = {token: null, ...pollResponse};
    return this.http.post(this.baseHref + "/" + sessionId + "/response", backResponse).pipe(
      map(response => parsePollDTO(response as PollDTO)),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  closePoll(sessionId: string): Observable<Poll> {
    return this.http.put(this.baseHref + "/" + sessionId, null, {params: {status: "closed"}}).pipe(
      map(response => parsePollDTO(response as PollDTO)),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  getPollResults(sessionId: string): Observable<PollResult> {
    return this.http.get(this.baseHref + "/" + sessionId + "/result").pipe(
      map(response => response as PollResult),
      catchError(error => this.handleError(error))
    ) as Observable<PollResult>;
  }

  deletePoll(sessionId: string): Observable<Poll> {
    return this.http.delete(this.baseHref + "/" + sessionId).pipe(
      map(response => parsePollDTO(response as PollDTO)),
      catchError(error => this.handleError(error))
    ) as Observable<Poll>;
  }

  private modifyDefinitionForBackend(definition: PollDefinition) {
    let newDefinition = {...definition};
    newDefinition.args = {...definition.args};
    if(newDefinition.type != "lottery") {
      newDefinition.args.options = (definition.args.options as {text: string}[]).map(opt => opt.text);
      if(newDefinition.type != "single_option") {
        if(!("minOptions" in newDefinition.args))
          newDefinition.args = {...newDefinition.args, minOptions: 1};
        if(!("maxOptions" in newDefinition.args))
          newDefinition.args = {...newDefinition.args, maxOptions: (definition.args.options as string[]).length};
      }
    }
    return newDefinition;
  }

  private handleError(error: any, ignoreNotFound: boolean = false) {
    if(error.status != 404 || !ignoreNotFound)
      return throwError(() => new Error("Server error(" + error.status + "): " + error.text));
    return of(null);
  }

}
