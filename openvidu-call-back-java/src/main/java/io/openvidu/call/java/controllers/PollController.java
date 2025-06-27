package io.openvidu.call.java.controllers;

import javax.management.InvalidAttributeValueException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.openvidu.call.java.models.polls.Poll;
import io.openvidu.call.java.models.polls.PollStatus;
import io.openvidu.call.java.models.polls.creation.PollBuilder;
import io.openvidu.call.java.models.polls.creation.PollDefinition;
import io.openvidu.call.java.models.polls.exceptions.InvalidDefinitionPollException;
import io.openvidu.call.java.models.polls.exceptions.PollException;
import io.openvidu.call.java.models.DTO.PollDTO;
import io.openvidu.call.java.models.polls.PollResponse;
import io.openvidu.call.java.models.polls.PollResult;
import io.openvidu.call.java.services.OpenViduService;
import io.openvidu.call.java.services.PollService;

/**
 * REST Controller that manages poll requests
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("polls")
public class PollController {

    @Value("${OPENVIDU_URL}")
    private String OPENVIDU_URL;

    /**
     * Service which provides functionality to manage the videoconference parameters
     */
	@Autowired
	private OpenViduService openviduService;

    /**
     * Service which provides functionality to manage polls
     */
	@Autowired
	private PollService pollService;



    /**
     * Request used in order to create a new poll.
     * The sessionID is obtained from the moderator key and not from the poll.
     * @param poll Poll object with the poll information
     * @param moderatorToken
     * @return Response of the request
     * @see Poll
     */
    @PostMapping("")
    public ResponseEntity<?> startPoll(
        @RequestBody PollDefinition definition,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken
    ) {

        String sessionId = openviduService.getSessionIdFromCookie(moderatorToken);
        boolean isValidToken = openviduService.isModeratorSessionValid(sessionId, moderatorToken);

        if(!sessionId.isEmpty() && isValidToken) { // Is the moderator of the session
            definition.setSessionId(sessionId);
            PollBuilder builder = new PollBuilder(definition);
            Poll poll;
            try {
                poll = builder.build();
            } catch (InvalidDefinitionPollException | InvalidAttributeValueException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
            pollService.updatePoll(poll);
            return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{sessionId}").buildAndExpand(poll.getSessionId()).toUri()).body(new PollDTO(poll));
        }
        
        return ResponseEntity.status(403).body("Could not create a poll: Permission denied.");
        
    }

    /**
     * Request in order to get the poll information.
     * If the poll is not anonymous and the request comes from the moderator of the session, it will add the participant nicknames to the responses and the poll.
     * If the poll is not anonymous, it has been closed and the request comes from a participant of the session, it will add the participant nicknames to the responses and the poll.
     * @param sessionId session ID of the call
     * @param participantToken
     * @param moderatorToken
     * @return Response entity with the poll information
     * @see Poll
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getPoll(
        @PathVariable String sessionId,
        @CookieValue(name = OpenViduService.PARTICIPANT_TOKEN_NAME, defaultValue = "") String participantToken,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken
    ) {
        Poll poll = pollService.getPoll(sessionId);
        if(openviduService.isModeratorSessionValid(sessionId, moderatorToken)) { // Moderator
            if(poll == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(new PollDTO(poll));
        }
        if(openviduService.isParticipantSessionValid(sessionId, participantToken)) { // Participant
            if(poll == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(new PollDTO(poll, participantToken));
        }
        return ResponseEntity.status(403).body("Could not get the poll: Permission denied.");
    }

    /**
     * Updates the poll information. It's used by the users in order to respond the poll or by the moderators in order to close the poll
     * Must be provided with a combination of <code>sessionID</code>, <code>status</code> and <code>moderatorToken)</code> (close a poll) or <code>sessionID</code>, <code>nickname</code> and <code>responseIndex</code> (respond a poll).
     * @param sessionId session ID of the call
     * @param params parameters of the request
     * @param moderatorToken OpenVidu moderator token cookie
     * @return Response entity with the poll information
     */
    @PutMapping("/{sessionId}")
    public ResponseEntity<?> updatePoll(
        @PathVariable String sessionId,
        @RequestParam String status,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken
    ) {

        if(!openviduService.isModeratorSessionValid(sessionId, moderatorToken))
            return ResponseEntity.status(403).body("Could not change the poll status: Permission denied.");

        PollStatus pollStatus = PollStatus.fromString(status);
        if(pollStatus == null)
            return ResponseEntity.badRequest().body("Invalid poll status");

        Poll poll = pollService.getPoll(sessionId);
        if(poll == null)
            return ResponseEntity.notFound().build();
                
        if(pollStatus == PollStatus.CLOSED)
            try {
                poll.close();
            } catch (PollException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        else
            poll.setStatus(pollStatus);
        pollService.updatePoll(poll);
        return ResponseEntity.ok(new PollDTO(poll));

    }

    @PostMapping("/{sessionId}/response")
    public ResponseEntity<?> respondPoll(
        @PathVariable String sessionId,
        @RequestBody PollResponse response,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken,
        @CookieValue(name = OpenViduService.PARTICIPANT_TOKEN_NAME, defaultValue = "") String participantToken
    ) {
            
        if(!openviduService.isParticipantSessionValid(sessionId, participantToken))
            return ResponseEntity.status(403).body("Could not respond the poll: Permission denied.");

        if(openviduService.isModeratorSessionValid(sessionId, moderatorToken))
            return ResponseEntity.badRequest().body("The moderator cannot respond a poll");

        Poll poll = pollService.getPoll(sessionId);
        if(poll == null)
            return ResponseEntity.notFound().build();

        if(!poll.validResponse(response))
            return ResponseEntity.badRequest().body("Invalid poll response");

        response.setToken(participantToken);
        try {
            poll.respond(response);
        } catch(PollException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }

        pollService.updatePoll(poll);
        return ResponseEntity.ok(new PollDTO(poll, participantToken));

    }
    

    @GetMapping("/{sessionId}/result")
    public ResponseEntity<?> getPollResult(
        @PathVariable String sessionId,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken
    ) {
        if(!openviduService.isModeratorSessionValid(sessionId, moderatorToken))
            return ResponseEntity.status(403).body("Permission Denied");
        Poll poll = pollService.getPoll(sessionId);
        if(poll == null)
            return ResponseEntity.notFound().build();
        PollResult result = poll.generatePollResult();
        if(result == null)
            return ResponseEntity.badRequest().body("Poll must be closed before generating its results.");
        return ResponseEntity.ok(result);
    }
    

    /**
     * Deletes the poll from a session
     * @param sessionId session ID of the poll
     * @param moderatorToken OpenVidu moderator token cookie
     * @return
     */
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> deletePoll(@PathVariable String sessionId,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken) {

        if(openviduService.isModeratorSessionValid(sessionId, moderatorToken)) { // Is the moderator of the session
            Poll poll = pollService.deletePoll(sessionId);
            if(poll == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(new PollDTO(poll));
        }

        return ResponseEntity.status(403).body("Permissions denied to delete polls");

    }
    
}
