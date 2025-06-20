import { Session } from 'openvidu-browser';
import { Component, Input } from '@angular/core';
import { LotteryPoll, MultipleOptionPoll, Poll, PollDefinition, PreferenceOrderPoll, SingleOptionPoll, generatePoll } from 'src/app/models/poll.model';
import { environment } from 'src/environments/environment';
import { PollSyncService } from 'src/app/services/poll-sync.service';

@Component({
  selector: 'app-poll-creation',
  templateUrl: './poll-creation.component.html',
  styleUrls: ['./poll-creation.component.scss']
})
export class PollCreationComponent {

  production: boolean = environment.production;

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
      type: "single_option",
      args: {options: [{text: ""}, {text: ""}]}
    };
    this.resetValidation();
  }

  addEmptyOption() {
    (this.pollDefinition.args.options as {text: string}[])?.push({text: ""});
    this.resetValidation();
  }

  removeOption(responseIndex: number) {
    if("options" in this.pollDefinition.args && this.pollDefinition.args.options instanceof Array)
      this.pollDefinition.args.options.splice(responseIndex, 1);
    this.resetValidation();
  }

  createPoll() {

    this.validateCurrentDefinition();

    if(this.creationError == "") {

      let callback = (poll: Poll) => {
        this.session.signal({
          data: JSON.stringify(poll),
          to: undefined,
          type: "pollCreated"
        });
        this.pollDefinition = null;
      };

      if(environment.poll_sync) {
        this.pollService.createPoll(this.pollDefinition).subscribe({
          next: poll => callback(poll),
          error: error => alert("An unexpected error ocurred: " + error)
        });
      } else {
        let generatedPoll = generatePoll(this.session.sessionId, this.pollDefinition);
        if(generatedPoll == null)
          alert("An unexpected error ocurred: could not create the poll.");
        else
          callback(generatedPoll);
      }

    }

  }

  validateCurrentDefinition() {

    let validationResult: string = this.validatePollDefinition(this.pollDefinition);

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

  changedPollType() {

    if(this.pollDefinition.type == "lottery") {

      if("options" in this.pollDefinition.args)
        delete this.pollDefinition.args.options;
      if("minOptions" in this.pollDefinition.args)
        delete this.pollDefinition.args.minOptions;
      if("maxOptions" in this.pollDefinition.args)
        delete this.pollDefinition.args.maxOptions;
      if("pointsMapping" in this.pollDefinition.args)
        delete this.pollDefinition.args.pointsMapping;

    } else {

      if(!("options" in this.pollDefinition.args))
        this.pollDefinition.args.options = [{text: ""}, {text: ""}];

      if(this.pollDefinition.type == "single_option") {

        if("minOptions" in this.pollDefinition.args)
          delete this.pollDefinition.args.minOptions;
        if("maxOptions" in this.pollDefinition.args)
          delete this.pollDefinition.args.maxOptions;
        if("pointsMapping" in this.pollDefinition.args)
          delete this.pollDefinition.args.pointsMapping;

      } else {

        if(!("minOptions" in this.pollDefinition.args))
          this.pollDefinition.args.minOptions = 1;
        if(!("maxOptions" in this.pollDefinition.args))
          this.pollDefinition.args.maxOptions = (this.pollDefinition.args.options as string[]).length;

        if(this.pollDefinition.type == "multiple_option") {
          if("pointsMapping" in this.pollDefinition.args)
            delete this.pollDefinition.args.pointsMapping;
        } else {
          if(!("pointsMapping" in this.pollDefinition.args))
            this.pollDefinition.args.pointsMapping = Array.from(Array(this.pollDefinition.args.maxOptions).keys()).reverse().map(value => value + 1);
        }

      }

    }

    this.resetValidation();

  }

  changedResponseOptionsLimit() {
    if(this.pollDefinition.type == "preference_order" && (this.pollDefinition.args.pointsMapping as number[]).length != this.pollDefinition.args.maxOptions)
      this.pollDefinition.args.pointsMapping = Array.from(Array(this.pollDefinition.args.maxOptions).keys()).reverse().map(value => value + 1);
    this.resetValidation();
  }

  private validatePollDefinition(definition: PollDefinition): string {
    switch(definition.type) {
      case "lottery":
        return LotteryPoll.validateDefinition(definition);
      case "single_option":
        return SingleOptionPoll.validateDefinition(definition);
      case "multiple_option":
        return MultipleOptionPoll.validateDefinition(definition);
      case "preference_order":
        return PreferenceOrderPoll.validateDefinition(definition);
    }
    return "Invalid poll type|type";
  }

  private logDefinition(definition: PollDefinition, text?: string) {
    if(text) {
      console.log(text+": "+JSON.stringify(definition));
    } else {
      console.log(JSON.stringify(definition));
    }
  }

}
