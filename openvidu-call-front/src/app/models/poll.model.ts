export interface PollResponse {
  text: string;
  result: number;
  participants: Array<string>;
}

export interface Poll {

  sessionId: string;
  status: string;
  anonymous: boolean;
  question: string;
  responses: Array<PollResponse>;
	totalResponses: number;
  participants: Array<string>;

}

export interface PollResults {

  anonymous: boolean;
  question: string;
  responses: Array<{
    text: string;
    result: number;
    participants?: Array<string>;
  }>;
  totalResponses: number;
  participants?: Array<string>;

}

export function generatePollResults(poll: Poll) {

  let results: PollResults = {
    anonymous: poll.anonymous,
    question: poll.question,
    responses: [],
    totalResponses: poll.totalResponses
  };

  for(let index = 0; index < poll.responses.length; index++) {
    results.responses.push({text: poll.responses[index].text, result: poll.responses[index].result});
    if(!poll.anonymous) {
      results.responses[index].participants = [];
      for(let participant of poll.responses[index].participants)
        results.responses[index].participants.push(participant);
    }
  }

  if(!poll.anonymous) {
    results.participants = [];
    for(let participant of poll.participants)
      results.participants.push(participant);
  }

  return results;

}
