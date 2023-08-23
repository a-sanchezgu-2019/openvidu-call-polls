import { Session } from 'openvidu-browser';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PollSyncService } from 'src/app/services/poll-sync.service';
import { ParticipantService } from 'openvidu-angular';

export interface PollResponse {
  text: string;
  result: number;
  participants: Array<string>;
}

export interface Poll {

  sessionId: string;
  status: string;
  anonimous: boolean;
  question: string;
  responses: Array<PollResponse>;
	totalResponses: number;
  participants: Array<string>;

}

@Component({
  selector: 'poll-panel',
  templateUrl: './poll-panel.component.html',
  styleUrls: ['./poll-panel.component.scss']
})
export class PollPanelComponent implements OnInit {

  public static max = Math.max;

  @Input("session")
  session!: Session;

  @Input("poll")
  get poll(): Poll {
    return this._poll;
  }
  set poll(poll: Poll) {
    if(this.session.connection.role != 'MODERATOR') {
      let nickname = this.participantService.getLocalParticipant().getNickname();
      if(poll.participants.includes(nickname)) {
        for(let index = 0; index < poll.responses.length; index++) {
          if(poll.responses[index].participants.includes(nickname)) {
            this.responseIndex = index;
            if(poll.status == 'pending')
              poll.status = 'responded';
            break;
          }
        }
      }
    }
    this._poll = poll;
  }

  private _poll?: Poll;

  @Input("poll-sync")
  private pollSync: boolean = false;

  responseIndex: number = -1;
  creationError: string = "";
  creationErrorInput: string = "";

  constructor(private pollService: PollSyncService, private participantService: ParticipantService) { }

  ngOnInit(): void {
    if(this.pollSync)
      this.fetchPoll();
  }

  createPoll(poll: Poll) {
    this.validatePoll(poll);
    if(this.creationError == "") {
      poll.status = "pending";
      if(this.pollSync) {
        this.pollService.createPoll(poll).subscribe({
          next: poll => {
              this.session.signal({
              data: JSON.stringify(poll),
              to: undefined,
              type: "pollCreated"
            });
          },
          error: error => alert("Ha ocurrido un error inesperado: " + error)
        });
      } else {
        this.session.signal({
          data: JSON.stringify(poll),
          to: undefined,
          type: "pollCreated"
        });
      }
    }
  }

  respondPoll(responseIndex: number) {
    if(this.poll.status == "pending") {
      this.responseIndex = responseIndex;
      if(this.pollSync) {
        this.pollService.respondPoll(this.poll.sessionId, this.participantService.getLocalParticipant().getNickname(), responseIndex).subscribe({
          next: poll => {
            this.session.signal({
              data: this.responseIndex.toString(),
              to: undefined,
              type: "pollResponse"
            });
            this._poll = poll;
            this._poll.status = "responded";
          },
          error: error => alert("Ha ocurrido un error inesperado: " + error)
        });
      } else {
        this.session.signal({
          data: this.responseIndex.toString(),
          to: undefined,
          type: "pollResponse"
        });
        this._poll.status = "responded";
      }
    }
  }

  closePoll() {
    if(this.pollSync) {
      this.pollService.closePoll(this.poll.sessionId).subscribe({
        next: poll => this.session.signal({
          data: JSON.stringify(poll),
          to: undefined,
          type: "pollClosed"
        }),
        error: error => alert("Ha ocurrido un error inesperado: " + error)
      });
    } else {
      this._poll.status = "closed";
      this.session.signal({
        data: JSON.stringify(this.poll),
        to: undefined,
        type: "pollClosed"
      });
    }
  }

  deletePoll() {
    if(this.pollSync) {
      this.pollService.deletePoll(this.session.sessionId).subscribe({
        complete: () => this.session.signal({
          data: undefined,
          to: undefined,
          type: "pollDeleted"
        }),
        error: error => alert("Ha ocurrido un error inesperado: " + error)
      });
    } else {
      this.session.signal({
        data: undefined,
        to: undefined,
        type: "pollDeleted"
      });
    }
  }

  // Creation Functions

  loadPollForCreation() {
    this._poll = {
      sessionId: this.session.sessionId,
      status: "creating",
      anonimous: true,
      question: "",
      responses: [{text: "", result: 0, participants: []}, {text: "", result: 0, participants: []}],
      totalResponses: 0,
      participants: []
    };
  }

  addEmptyResponse() {
    this._poll.responses.push({text: "", result: 0, participants: []});
    this.creationError = "";
    this.creationErrorInput = "";
  }

  removeResponse(responseIndex: number) {
    this._poll.responses.splice(responseIndex, 1);
    this.creationError = "";
    this.creationErrorInput = "";
  }

  private testPoll(): Poll {
    return {
      sessionId: this.session.sessionId,
      status: "pending",
      anonimous: true,
      question: "Encuesta de prueba",
      responses: [{text: "Respuesta 0", result: 0, participants: []}, {text: "Respuesta 1", result: 0, participants: []}],
      totalResponses: 0,
      participants: []
    };
  }

  private validatePoll(poll: Poll) {
    if(poll.question == "") {
      this.creationError = "Please, enter a question";
      this.creationErrorInput = "question";
      return;
    }
    if(poll.responses.length < 2) {
      this.creationError = "The poll needs at least 2 responses";
      this.creationErrorInput = "";
      return;
    }
    for(let [index, response] of Object.entries(poll.responses)) {
      if(response.text == "") {
        this.creationError = "Please, enter the response "+(parseInt(index) + 1);
        this.creationErrorInput = "response"+index;
        return;
      }
    }
    this.creationError = "";
    this.creationErrorInput = "";
  }

  private fetchPoll() {
    this.pollService.getPoll(this.session.sessionId, true).subscribe({
      next: poll => this.poll = poll
    });
  }

}
