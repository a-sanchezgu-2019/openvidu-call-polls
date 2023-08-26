import { Session } from 'openvidu-browser';
import { Component, Input } from '@angular/core';
import { Poll, PollDefinition, generatePoll } from 'src/app/models/poll.model';
import { environment } from 'src/environments/environment';
import { PollSyncService } from 'src/app/services/poll-sync.service';

@Component({
  selector: 'app-poll-creation',
  templateUrl: './poll-creation.component.html',
  styleUrls: ['./poll-creation.component.scss']
})
export class PollCreationComponent {

  @Input("session")
  session!: Session;

  pollDefinition: PollDefinition = null;

  creationError: string = "";
  creationErrorInput: string = "";

  exportFilename: string = null;
  exportHref: string = null;

  constructor(private pollService: PollSyncService) {}

  loadPollForCreation() {
    this.pollDefinition = {
      anonymous: true,
      question: "",
      responses: [{text: ""}, {text: ""}]
    };
    this.resetValidation();
  }

  addEmptyResponse() {
    this.pollDefinition.responses.push({text: ""});
    this.resetValidation();
  }

  removeResponse(responseIndex: number) {
    this.pollDefinition.responses.splice(responseIndex, 1);
    this.resetValidation();
  }

  createPoll() {

    console.debug("Call to createPoll()");

    this.validateCurrentDefinition();

    if(this.creationError == "") {

      let generatedPoll = generatePoll(this.session.sessionId, this.pollDefinition);

      let callback = (poll: Poll) => {
        this.session.signal({
          data: JSON.stringify(poll),
          to: undefined,
          type: "pollCreated"
        });
        this.pollDefinition = null;
      };

      if(environment.poll_sync) {
        this.pollService.createPoll(generatedPoll).subscribe({
          next: poll => callback(poll),
          error: error => alert("Ha ocurrido un error inesperado: " + error)
        });
      } else {
        callback(generatedPoll);
      }

    }

  }

  validateCurrentDefinition() {

    console.debug("Call to validateCurrentDefinition()");

    let validationResult = this.validatePollDefinition(this.pollDefinition);

    if(validationResult == "") {
      this.creationError = "";
      this.creationErrorInput = "";
      this.exportFilename = this.session.sessionId+".poll-def.json";
      this.exportHref = 'data:app/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(this.pollDefinition, null, 2));
    } else {
      [this.creationError, this.creationErrorInput] = validationResult.split("|");
      this.exportFilename = null;
      this.exportHref = null;
    }

  }

  importSelectedPoll(file: File) {

    console.debug("Call to importSelectedPoll()");

    file.text().then( text => {
      try {
        let object = JSON.parse(text);
        try {
          let definition: PollDefinition = object as PollDefinition;
          let validationResult = this.validatePollDefinition(definition);
          if(validationResult == "") {
            if(confirm("Do you want to overwrite your current poll with the imported one?")) {
              this.pollDefinition = definition;
              this.resetValidation();
            }
          } else {
            validationResult = validationResult.split("|")[0];
            alert("Error Importing: "+validationResult);
          }
        } catch(e) {
          if(e instanceof TypeError) {
            alert("Imported file is not a PollDefinition: "+e.message);
          } else {
            console.error(e);
            alert("An unexpected error occurred");
          }
        }
      } catch (e) {
        if(e instanceof SyntaxError) {
          alert("Imported file is not in JSON format");
        } else {
          console.error(e);
          alert("An unexpected error occurred");
        }
      }
    });

  }

  resetValidation() {
    this.creationError = "";
    this.creationErrorInput = "";
    this.exportFilename = null;
    this.exportHref = null;
  }

  logCurrentDefinition() {
    this.logDefinition(this.pollDefinition, "Current");
  }

  private validatePollDefinition(definition: PollDefinition): string {

    if(definition.question == "") {
      return "Please, enter a question|question";
    }
    if(definition.responses.length < 2) {
      return "The poll needs at least 2 responses|";
    }

    for(let [index, response] of Object.entries(definition.responses)) {
      if(response.text == "") {
        return "Please, enter the response "+(parseInt(index) + 1)+"|response"+index;
      }
    }

    return "";

  }

  private logDefinition(definition: PollDefinition, text?: string) {
    if(text) {
      console.log(text+": "+JSON.stringify(definition));
    } else {
      console.log(JSON.stringify(definition));
    }
  }

}
