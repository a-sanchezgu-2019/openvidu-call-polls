import { Connection, Session } from 'openvidu-browser';
import { Component, Input, OnInit } from '@angular/core';
import { Poll, LotteryPoll, PollWithOptions, PollResponse, SingleOptionPoll, PreferenceOrderPoll, PollResult, MultipleOptionPoll, generatePollDTO } from 'src/app/models/poll.model';
import { PollSyncService } from 'src/app/services/poll-sync.service';
import { ParticipantService } from 'openvidu-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'poll-panel',
  templateUrl: './poll-panel.component.html',
  styleUrls: ['./poll-panel.component.scss']
})
export class PollPanelComponent implements OnInit {

  production: boolean = environment.production;

  @Input("session")
  session!: Session;

  @Input("poll")
  get poll(): Poll {
    return this._poll;
  }
  set poll(poll: Poll) {
    if(poll != null) {
      if(!this.pollSync && this.session.connection.role != 'MODERATOR') {
        let nickname = this.participantService.getLocalParticipant().getNickname();
        if(poll.participants?.includes(nickname)) {
          if(poll instanceof LotteryPoll) {
            poll.responseIndices.push(0);
            if(poll.status == "pending")
              poll.status = "responded";
          } else if(poll instanceof PollWithOptions) {
            for(let index = 0; index < poll.nOptions(); index++) {
              if(poll.options[index].participants.includes(nickname)) {
                this.poll.responseIndices.push(index);
                if(poll.status == 'pending')
                  poll.status = 'responded';
                break;
              }
            }
          }
        }
      }
    }
    this._poll = poll;
    this.exportResultsFilename = null;
    this.exportResultsHref = null;
  }
  private _poll?: Poll;

  private pollSync: boolean = environment.poll_sync;

  responseIndices: number[] = [];

  exportResultsFilename: string = null;
  exportResultsHref: string = null;

  generalError: string = null;

  constructor(private pollService: PollSyncService, private participantService: ParticipantService) { }

  ngOnInit(): void {
    if(this.pollSync)
      this.fetchPoll();
    } else if(this.session.connection.role !== "MODERATOR" && this._poll === undefined) {
      // Retrieve poll from moderator
      let connection = this.getModeratorConnection();
      this.session.signal({
        data: null,
        to: connection === undefined? undefined: [connection],
        type: "pollGet"
      });
    }
  }

  getModeratorConnection(): Connection | undefined {
    let result: Connection | undefined;
    this.session.remoteConnections.forEach((connection, key) => {
      if(connection.role === "MODERATOR")
        result = connection;
    });
    return result;
  }

  respondPoll() {
    if(this.poll.status != "pending")
      return;
    let pollResponse = this.extractPollResponse();
    if(pollResponse == null)
      return;
    this.generalError = this.poll.validateResponse(pollResponse);
    if(this.generalError != "")
      return;
    if(this.pollSync) {
      this.pollService.respondPoll(this.poll.sessionId, pollResponse).subscribe({
        next: poll => {
          let to: Connection[] | undefined;
          if(this.poll.anonymous) {
            let connection = this.getModeratorConnection();
            if(connection !== undefined)
              to = [connection];
          }
          this.session.signal({
            data: pollResponse.nickname,
            to: to,
            type: "pollResponse"
          });
          this._poll = poll;
        },
        error: error => this.generalError = error.message
      });
    } else {
      let to: Connection[] | undefined;
      if(this.poll.anonymous) {
        let connection = this.getModeratorConnection();
        if(connection !== undefined)
          to = [connection];
      }
      this.session.signal({
        data: JSON.stringify(pollResponse),
        to: to,
        type: "pollResponse"
      });
      this._poll.status = "responded";
    }
  }

  selectOption(optionIndex: number) {
    if(!(this.poll instanceof PollWithOptions) || this.poll.status != "pending")
      return;
    let optPoll: PollWithOptions = this.poll as PollWithOptions;
    if(optionIndex < 0 || optionIndex >= optPoll.options.length)
      return;
    if(optPoll instanceof SingleOptionPoll) {
      this.poll.responseIndices = [optionIndex];
    } else {
      let indexIndex = this.poll.responseIndices.findIndex(value => value == optionIndex);
      if(indexIndex == -1) {
        this.poll.responseIndices.push(optionIndex);
      } else {
        this.poll.responseIndices.splice(indexIndex, 1);
      }
    }
  }

  closePoll() {
    if(!this.poll)
      return;
    this.generalError = "";
    if(this.pollSync) {
      this.pollService.closePoll(this.poll.sessionId).subscribe({
        next: poll => {
          this.session.signal({
            data: undefined,
            to: undefined,
            type: "pollClosed"
          });
        },
        error: error => this.generalError = error
      });
    } else {
      this._poll.status = "closed";
      this.session.signal({
        data: JSON.stringify(generatePollDTO(this.poll)),
        to: undefined,
        type: "pollClosed"
      });
    }
  }

  deletePoll() {
    this.generalError = "";
    if(this.pollSync) {
      this.pollService.deletePoll(this.session.sessionId).subscribe({
        complete: () => {
          this.session.signal({
            data: undefined,
            to: undefined,
            type: "pollDeleted"
          });
          this.exportResultsFilename = null;
          this.exportResultsHref = null;
        },
        error: error => this.generalError = error
      });
    } else {
      this.session.signal({
        data: undefined,
        to: undefined,
        type: "pollDeleted"
      });
      this.exportResultsFilename = null;
      this.exportResultsHref = null;
    }
  }

  getPointsMapping(optIndex: number): number | string {
    if(!(this.poll instanceof PreferenceOrderPoll) || !this.poll.responseIndices.includes(optIndex))
      return "";
    return this.poll.responseIndices.findIndex(i => i == optIndex) + 1;
  }

  calculateOptionPercentaje(optIndex: number): number {
    if(this.poll.totalParticipants == 0 || !(this.poll instanceof PollWithOptions) || optIndex >= this.poll.options.length)
      return 0;
    if(this.poll instanceof SingleOptionPoll) {
      return 100 * this.poll.options[optIndex].result / this.poll.totalParticipants;
    }
    return 100 * this.poll.options[optIndex].result / this.poll.options.map(o => o.result).reduce((acum, v) => acum + v);
  }

  isLottery(): boolean {
    return this.poll instanceof LotteryPoll;
  }

  isPollWithOptions(): boolean {
    return this.poll instanceof PollWithOptions;
  }

  isPreferenceOrder(): boolean {
    return this.poll instanceof PreferenceOrderPoll;
  }

  selectOptionsText(): string {
    if(!(this.poll instanceof PollWithOptions))
      return "";
    let result = "Select ";
    let minOpts = 1;
    let maxOpts = 1;
    if(this.poll instanceof SingleOptionPoll)
      return result + "an option";
    if(this.poll instanceof MultipleOptionPoll) {
      minOpts = this.poll.minOptions;
      maxOpts = this.poll.maxOptions;
    } else if(this.poll instanceof PreferenceOrderPoll) {
      minOpts = this.poll.minOptions;
      maxOpts = this.poll.maxOptions;
    }
    let singleNumber: boolean = minOpts == maxOpts;
    if(singleNumber) {
      if(maxOpts == 1)
        return result + "an option";
      return result + maxOpts + " options";
    }
    return result + "from " + minOpts + " to " + maxOpts + " options" + (this.poll instanceof PreferenceOrderPoll? " in order of preference": "");
  }

  loadExportCurrentResults() {
    this.generalError = "";
    if(this.pollSync) {
      this.pollService.getPollResults(this.session.sessionId).subscribe({
        next: pollResult => this.setPollResultExportData(this.session.sessionId+".poll.result.json", pollResult),
        error: error => this.generalError = error
      });
    } else {
      this.loadExportResults(this.poll);
    }
  }

  logPoll() {
      console.log(JSON.stringify(this._poll));
  }

  getTotalPercentage(): number {
    return this.session.remoteConnections.size? Math.round(100 * (this.poll?.totalParticipants?? 0) / this.session.remoteConnections.size): 0;
  }

  private extractPollResponse(): PollResponse {
    let pollResponse = {
      nickname: this.participantService.getLocalParticipant().getNickname(),
      args: {}
    }
    if(this.poll instanceof PollWithOptions) {
      if(this.poll.responseIndices) {
        if(this.poll instanceof SingleOptionPoll) {
          pollResponse.args = {optionIndex: this.poll.responseIndices[0]};
        } else {
          pollResponse.args = {options: this.poll.responseIndices.join(",")};
        }
      } else {
        this.generalError = "You must select an option.";
        return null;
      }
    }
    return pollResponse;
  }

  private setPollResultExportData(filename: string, pollResult: PollResult) {
    let mapReplacer = (key, value) => {
      if(value instanceof Map) {
        for(let key of value.keys())
          if(typeof key !== "string")
            return "";
        return Object.fromEntries(value.entries());
      }
      return value;
    }
    this.exportResultsFilename = filename?? "";
    this.exportResultsHref = pollResult? "data:application/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(pollResult, mapReplacer, 2)): "";
  }

  private loadExportResults(poll: Poll) {
    this.setPollResultExportData(this.session.sessionId+".poll.result.json", poll.generatePollResult());
  }

  private fetchPoll() {
    this.pollService.getPoll(this.session.sessionId, true).subscribe({
      next: poll => this.poll = poll
    });
  }

}
