package io.openvidu.call.java.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import io.openvidu.call.java.models.polls.Poll;

@Service
public class PollService {
	
	/**
	 * Collection of polls identified by its session's id.
	 */
	private Map<String, Poll> polls = new HashMap<>();

	/**
	 * Update the poll in the poll collection.
	 * @param poll
	 */
	public void updatePoll(Poll poll) {
		polls.put(poll.getSessionId(), poll);
	}

	/**
	 * Gets the poll identified by the sessionId.
	 * @param sessionId Poll session ID
	 * @return poll from polls collection
	 */
	public Poll getPoll(String sessionId) {
		return polls.get(sessionId);
	}

	/**
	 * Deletes the poll from the poll collection.
	 * @param sessionId session ID of the poll
	 * @return Previous poll associated with the session ID provided
	 */
	public Poll deletePoll(String sessionId) {
		return polls.remove(sessionId);
	}
    
}