export interface PollResponse {
  nickname: string;
  args: {[arg: string]: string | number | boolean}
}

export interface PollResult {

  anonymous: boolean;
  question: string;
  type: string;
  participants?: Array<string>;
  data: Map<string, any>;

}

export abstract class Poll {

  static validateDefinition(definition: PollDefinition): string {
    if((definition.question?? "") == "")
      return "Please, enter a question|question";
    return "";
  }

  sessionId: string;
  anonymous: boolean;
  question: string;
  status: string;
  participants: Array<string>;
	totalParticipants: number;
  responseIndices: Array<number>;

  constructor(sessionId: string, anonymous: boolean, question: string, status?: string, participants?: Array<string>, responseIndices?: Array<number>) {
    this.sessionId = sessionId;
    this.anonymous = anonymous;
    this.question = question;
    this.status = status?? "pending";
    this.participants = participants?? [];
    this.totalParticipants = this.participants.length;
    this.responseIndices = responseIndices?? [];
  }

  validResponse(response: PollResponse): boolean {
    return !this.participants.includes(response.nickname);
  };

  validateResponse(response: PollResponse): string {
    if(this.participants.includes(response.nickname))
      return "You have already submit a response";
    return "";
  }

  respond(response: PollResponse): boolean {
    if(!this.validResponse(response))
      return false;
    this.participants.push(response.nickname);
    this.totalParticipants++;
    return true;
  }

  close(): void {
    this.status = "closed";
  }

  generatePollResult(): PollResult {
    if(this.status != "closed")
      return null;
    let result = {
      anonymous: this.anonymous,
      type: "base",
      question: this.question,
      totalParticipants: this.totalParticipants,
      data: new Map<string, any>()
    } as PollResult;
    if(!this.anonymous)
      result.participants = [...this.participants];
    return result;
  }

}

export interface PollDTO {
  sessionId: string;
  status: string;
  anonymous: boolean;
  question: string;
  type: string;
  participants: Array<string>;
  totalParticipants: number;
  responseIndices: Array<number>;
  data: {[name: string]: any};
}

export interface PollOption {

  text: string;
  participants: Array<string>;
  result: number;

}

export interface PollDefinition {

  type: string;
  question: string;
  anonymous: boolean;
  args: {[arg: string]: object | string | number | boolean};

}

export class LotteryPoll extends Poll {

  static override validateDefinition(definition: PollDefinition): string {
      let result = super.validateDefinition(definition);
      if(result != "")
        return result;
      if(definition.type != "lottery")
        return "Incompatible Type|type";
      return "";
  }

  winner: string;

  constructor(sessionId: string, anonymous: boolean, question: string, status?: string, participants?: Array<string>, responseIndices?: Array<number>, winner?: string) {
    super(sessionId, anonymous, question, status, participants, responseIndices);
    this.winner = winner?? null;
  }

  override close(): void {
    super.close();
    this.winner = this.participants[Math.floor(Math.random() * this.totalParticipants)];
  }

  override generatePollResult(): PollResult {
    let result = super.generatePollResult();
    if(result == null)
      return null;
    result.type = "lottery";
    result.data.set("winner", this.winner);
    return result;
  }

}

export abstract class PollWithOptions extends Poll {

  static override validateDefinition(definition: PollDefinition): string {
      let result = super.validateDefinition(definition);
      if(result != "")
        return result;
      if(!("options" in definition.args) ||
          !(typeof definition.args.options == "object" && definition.args.options instanceof Array) ||
          definition.args.options.length < 2)
        return "The poll needs at least 2 options|";
      for(let [index, option] of Object.entries(definition.args.options)) {
        if(typeof option != "object" || !("text" in option) || typeof option.text != "string")
          return "Invalid option type|option" + index;
        if(option == "")
          return "Please, enter the option "+ (index + 1) + "|option"+index;
      }
      return "";
  }

  options: Array<PollOption>;

  constructor(sessionId: string, anonymous: boolean, question: string, status?: string, participants?: Array<string>, responseIndices?: Array<number>, options?: Array<PollOption>) {
    super(sessionId, anonymous, question, status, participants, responseIndices);
    this.options = options?? [];
  }

  nOptions(): number {
    return this.options.length;
  }

  override generatePollResult(): PollResult {
    let result = super.generatePollResult();
    if(result == null)
      return null;
    let resultOptions: Array<PollOption>;
    if(this.anonymous) {
      resultOptions = [];
      for(let option of this.options) {
        let resOpt = {...option};
        resOpt.participants = [];
        resultOptions.push(resOpt);
      }
    } else {
      resultOptions = this.options;
    }
    result.data.set("options", resultOptions);
    return result;
  }

}

export class SingleOptionPoll extends PollWithOptions {

  override validResponse(response: PollResponse): boolean {
    if(!super.validResponse(response))
      return false;
    if(!("optionIndex" in response.args) || typeof response.args.optionIndex != "number")
      return false;
    return response.args.optionIndex < this.nOptions();
  }

  override validateResponse(response: PollResponse): string {
    let result = super.validateResponse(response);
    if(result != "")
      return result;
    if(!("optionIndex" in response.args) || typeof response.args.optionIndex != "number")
      return "Please, select an option";
    return "";
  }

  override respond(response: PollResponse): boolean {
    if(!this.validResponse(response))
      return false;
    if(!super.respond(response))
      return false;
    let optionIndex = response.args.optionIndex as number;
    this.options[optionIndex].participants.push(response.nickname);
    this.options[optionIndex].result++;
    return true;
  }

  override generatePollResult(): PollResult {
    let result = super.generatePollResult();
    if(result == null)
      return null;
    result.type = "single_option";
    return result;
  }

}

export class MultipleOptionPoll extends PollWithOptions {

  static override validateDefinition(definition: PollDefinition): string {
    let result = super.validateDefinition(definition);
    if(result != "")
      return result;
    if("minOptions" in definition.args) {
      if(typeof definition.args.minOptions != "number" || definition.args.minOptions < 1)
        return "Minimum options must be a number greater than 0|minOptions";
    } else {
      return "Missing minimum options|minOptions";
    }
    if("maxOptions" in definition.args) {
      if(typeof definition.args.maxOptions != "number" || definition.args.maxOptions > (definition.args.options as string[]).length)
        return "Maximum options must be a number smaller or equal to the number of options|maxOptions";
    } else {
      return "Missing maximum options|maxOptions";
    }
    if(definition.args.minOptions > definition.args.maxOptions)
      return "Maximum options must be greater or equal to the minimum options|maxOptions";
    return "";
  }

  minOptions: number;
  maxOptions: number;

  constructor(sessionId: string, anonymous: boolean, question: string, status?: string, participants?: Array<string>, responseIndices?: Array<number>, options?: Array<PollOption>, maxOptions?: number, minOptions?: number) {
    super(sessionId, anonymous, question, status, participants, responseIndices, options);
    this.minOptions = minOptions?? 1;
    this.maxOptions = maxOptions?? this.nOptions();
  }

  override validResponse(response: PollResponse): boolean {
    if(!super.validResponse(response))
      return false;
    if(!("options" in response.args) || typeof response.args.options != "string")
      return false;
    let options = response.args.options.split(",").map(Number);
    if(options.length < this.minOptions || options.length > this.maxOptions)
      return false;
    let selected = new Set<number>();
    for(let option of options) {
      if(isNaN(option))
        return false;
      if(option >= this.nOptions())
        return false;
      if(selected.has(option))
        return false;
      selected.add(option);
    }
    return true;
  }

  override validateResponse(response: PollResponse): string {
    let result = super.validateResponse(response);
    if(result != "")
      return result;
    if(!("options" in response.args) || typeof response.args.options != "string" || response.args.options == "")
      return "Please, select at least "+this.minOptions+" option(s).";
    let options = response.args.options.split(",").map(Number);
    if(options.length < this.minOptions)
      return "Please, select at least "+this.minOptions+" option(s).";
    if(options.length > this.maxOptions)
      return "Please, select at most "+this.maxOptions+" option(s).";
    for(let option of options) {
      if(isNaN(option) || option >= this.nOptions())
        return "Invalid option '"+option+"'";
    }
    return "";
  }

  override respond(response: PollResponse): boolean {
    if(!this.validResponse(response))
      return false;
    if(!super.respond(response))
      return false;
    for(let optionIndex of (response.args.options as string).split(",").map(Number)) {
      this.options[optionIndex].participants.push(response.nickname);
      this.options[optionIndex].result++;
    }
  }

  override generatePollResult(): PollResult {
    let result = super.generatePollResult();
    if(result == null)
      return null;
    result.type = "multiple_option";
    return result;
  }

}

export class PreferenceOrderPoll extends PollWithOptions {

  static override validateDefinition(definition: PollDefinition): string {
    let result = super.validateDefinition(definition);
    if(result != "")
      return result;
    let maxOptions;
    let nOpts = (definition.args.options as string[]).length;
    if("minOptions" in definition.args) {
      if(typeof definition.args.minOptions != "number" || definition.args.minOptions < 1)
        return "Minimum options must be a number greater than 0|minOptions";
    } else {
      return "Missing minimum options|minOptions";
    }
    if("maxOptions" in definition.args) {
      if(typeof definition.args.maxOptions != "number" || definition.args.maxOptions > nOpts)
        return "Maximum options must be a number smaller or equal to the number of options|maxOptions";
      maxOptions = definition.args.maxOptions;
    } else {
      return "Missing maximum options|maxOptions";
    }
    if("pointsMapping" in definition.args) {
      if(typeof definition.args.pointsMapping != "object" || !(definition.args.pointsMapping instanceof Array))
        return "Points invalid type|pointsMapping";
      if(definition.args.pointsMapping.length != maxOptions)
        return "Points invalid length|pointsMapping";
      for(let points of definition.args.pointsMapping)
        if(typeof points != "number")
          return "Points invalid type|pointsMapping";
    } else {
      definition.args.pointsMapping = Array.from(Array(definition.args.maxOptions).keys()).reverse().map(value => value + 1)
    }
    return "";
  }

  minOptions: number;
  maxOptions: number;
  preferenceOrders: Map<string, Array<number>>;
  pointsMapping: Array<number>;

  constructor(sessionId: string, anonymous: boolean, question: string, status?: string, participants?: Array<string>, responseIndices?: Array<number>, options?: Array<PollOption>, maxOptions?: number, minOptions?: number, preferenceOrders?: Map<string, Array<number>>, pointsMapping?: Array<number>) {
    super(sessionId, anonymous, question, status, participants, responseIndices, options);
    this.minOptions = minOptions?? 1;
    this.preferenceOrders = preferenceOrders?? new Map();
    if(pointsMapping && pointsMapping.length > 1 && pointsMapping.length <= this.nOptions())
      this.pointsMapping = pointsMapping;
    else {
      this.pointsMapping = [];
      for(let points = maxOptions?? this.nOptions(); points > 0; points--)
        pointsMapping.push(points);
    }
    this.maxOptions = maxOptions?? this.pointsMapping.length;
  }

  override validResponse(response: PollResponse): boolean {
    if(!super.validResponse(response))
      return false;
    if(!("options" in response.args) || typeof response.args.options != "string")
      return false;
    let options = response.args.options.split(",").map(Number);
    if(options.length < this.minOptions || options.length > this.maxOptions)
      return false;
    let selected = new Set<number>();
    for(let option of options) {
      if(isNaN(option))
        return false;
      if(option >= this.nOptions())
        return false;
      if(selected.has(option))
        return false;
      selected.add(option);
    }
    return true;
  }

  override validateResponse(response: PollResponse): string {
    let result = super.validateResponse(response);
    if(result != "")
      return result;
    if(!("options" in response.args) || typeof response.args.options != "string" || response.args.options == "")
      return "Please, select at least "+this.minOptions+" option(s).";
    console.log(response.args.options);
    let options = response.args.options.split(",").map(Number);
    console.log(options);
    if(options.length < this.minOptions)
      return "Please, select at least "+this.minOptions+" option(s).";
    if(options.length > this.maxOptions)
      return "Please, select at most "+this.maxOptions+" option(s).";
    for(let option of options) {
      if(isNaN(option) || option >= this.nOptions())
        return "Invalid option '"+option+"'";
    }
    return "";
  }

  override respond(response: PollResponse): boolean {
    if(!this.validResponse(response))
      return false;
    if(!super.respond(response))
      return false;
    let responseOptions = (response.args.options as string).split(",").map(Number);
    this.preferenceOrders.set(response.nickname, responseOptions);
    for(let [index, option] of Object.entries(responseOptions)) {
      this.options[index].participants.push(response.nickname);
      this.options[option].result += this.pointsMapping[index];
    }
  }

  override generatePollResult(): PollResult {
    let result = super.generatePollResult();
    if(result == null)
      return null;
    result.type = "preference_order";
    result.data.set("pointsMapping", this.pointsMapping);
    if(!this.anonymous)
      result.data.set("preferenceOrders", this.preferenceOrders);
    return result;
  }

}

function pollOptionFromText(optionText: {text: string}): PollOption {
  return {...optionText, result: 0, participants: []};
}

function mapOptionsFromText(optionsText: {text: string}[]): PollOption[] {
  return optionsText.map(pollOptionFromText);
}

// We only rely on this function if the poll information is not synchronized with the backend (environment.poll_sync = false)
export function generatePoll(sessionId: string, definition: PollDefinition, initialStatus: string = 'pending'): Poll {
  let options = "options" in definition.args? (definition.args.options as {text: string}[]).map(pollOptionFromText): undefined;
  switch(definition.type) {
    case "lottery":
      return new LotteryPoll(sessionId, definition.anonymous, definition.question, initialStatus);
    case "single_option":
      return new SingleOptionPoll(sessionId, definition.anonymous, definition.question, initialStatus, undefined, undefined, options);
    case "multiple_option":
      return new MultipleOptionPoll(sessionId, definition.anonymous, definition.question, initialStatus, undefined, undefined, options, definition.args.maxOptions as number, definition.args.minOptions as number);
    case "preference_order":
      return new PreferenceOrderPoll(sessionId, definition.anonymous, definition.question, initialStatus, undefined, undefined, options, definition.args.maxOptions as number, definition.args.minOptions as number, undefined, definition.args.pointsMapping as number[]);
  }
  return null;
}

export function parsePollDTO(pollDTO: PollDTO): Poll {
  let poll: Poll = null;
  if(pollDTO.type == "lottery") {
    poll = new LotteryPoll(pollDTO.sessionId, pollDTO.anonymous, pollDTO.question, pollDTO.status, pollDTO.participants, pollDTO.responseIndices, pollDTO.data.winner);
  } else if(pollDTO.type == "single_option" || pollDTO.type == "multiple_option" || pollDTO.type == "preference_order") {
    let options = pollDTO.data.options;
    if(options == undefined || !(typeof options == "object") ||
        !(options instanceof Array) || options.length < 2)
      return null;
    for(let option of options) {
      if(typeof option != "object" ||
          !("text" in option && typeof option.text == "string") ||
          !("result" in option && typeof option.result == "number") ||
          !("participants" in option && typeof option.participants == "object" && option.participants instanceof Array))
        return null;
      for(let participant of option.participants)
        if(typeof participant != "string")
          return null;
      switch(pollDTO.type) {
        case "single_option":
          poll = new SingleOptionPoll(pollDTO.sessionId, pollDTO.anonymous, pollDTO.question, pollDTO.status, pollDTO.participants, pollDTO.responseIndices, pollDTO.data.options);
          break;
        case "multiple_option":
          poll = new MultipleOptionPoll(pollDTO.sessionId, pollDTO.anonymous, pollDTO.question, pollDTO.status, pollDTO.participants, pollDTO.responseIndices, pollDTO.data.options, pollDTO.data.maxOptions, pollDTO.data.minOptions);
          break;
        case "preference_order":
          poll = new PreferenceOrderPoll(pollDTO.sessionId, pollDTO.anonymous, pollDTO.question, pollDTO.status, pollDTO.participants, pollDTO.responseIndices, pollDTO.data.options, pollDTO.data.maxOptions, pollDTO.data.minOptions, pollDTO.data.preferenceOrders, pollDTO.data.pointsMapping);
          break;
      }
    }
  }
  if(poll != null)
    poll.totalParticipants = pollDTO.totalParticipants;
  return poll;
}
