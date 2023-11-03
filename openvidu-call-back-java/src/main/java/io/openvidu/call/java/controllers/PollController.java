package io.openvidu.call.java.controllers;

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

import io.openvidu.call.java.models.Poll;
import io.openvidu.call.java.models.DTO.PollDTO;
import io.openvidu.call.java.models.Poll.PollResponse;
import io.openvidu.call.java.services.OpenViduService;

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
     * Service which provides functionality to manage the polls
     */
	@Autowired
	private OpenViduService openviduService;

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
        @RequestBody Poll poll,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken
    ) {

        String sessionId = openviduService.getSessionIdFromCookie(moderatorToken);
        boolean isValidToken = openviduService.isModeratorSessionValid(sessionId, moderatorToken);

        if(!sessionId.isEmpty() && isValidToken) { // Is the moderator of the session
            openviduService.updatePoll(poll);
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
        Poll poll = openviduService.getPoll(sessionId);
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
        return ResponseEntity.status(403).body("Could not update the poll: Permission denied.");
    }

    /**
     * Updates the poll information. It's used by the users in order to respond the poll or by the moderators in order to close the poll
     * You must provide a combination of <code>sessionID</code>, <code>status</code> and <code>moderatorToken)</code> (close a poll) or <code>sessionID</code>, <code>nickname</code> and <code>responseIndex</code> (respond a poll).
     * @param sessionId session ID of the call
     * @param status status of the poll ('closed' or null)
     * @param nickname nickname of the user
     * @param responseIndex index of the response
     * @param moderatorToken OpenVidu moderator token cookie
     * @return Response entity with the poll information
     */
    @PutMapping("/{sessionId}")
    public ResponseEntity<?> updatePoll(
        @PathVariable String sessionId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String nickname,
        @RequestParam(required = false) Integer responseIndex,
        @CookieValue(name = OpenViduService.PARTICIPANT_TOKEN_NAME, defaultValue = "") String participantToken,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken
    ) {

        if(status == null && (nickname == null || responseIndex == null))
            return ResponseEntity.badRequest().body("{ error: \"Needed one of these set of params: { status: string } || { nickname: string, responseIndex: number}\"}");

        boolean validModerator = openviduService.isModeratorSessionValid(sessionId, moderatorToken);
        boolean validParticipant = openviduService.isParticipantSessionValid(sessionId, participantToken);

        if(status != null) {

            if(!validModerator)
                return ResponseEntity.status(403).body("Could not change the poll status: Permission denied.");
                
            Poll poll = openviduService.getPoll(sessionId);

            if(poll == null)
                return ResponseEntity.notFound().build();
            if(!status.equals("closed"))
                return ResponseEntity.badRequest().body("Invalid poll status");

            poll.setStatus(status);
            openviduService.updatePoll(poll);
            return ResponseEntity.ok(new PollDTO(poll));

            
        } else {
            
            if(validModerator)
                return ResponseEntity.badRequest().body("The moderator of the session can not respond a poll.");
            if(!validParticipant)
                return ResponseEntity.status(403).body("Could not respond the poll: Permission denied.");

            Poll poll = openviduService.respondPoll(sessionId, participantToken, nickname, responseIndex);
            if(poll != null)
                return ResponseEntity.ok(new PollDTO(poll, participantToken));
            return ResponseEntity.notFound().build();

        }

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
            Poll poll = openviduService.deletePoll(sessionId);
            if(poll == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(new PollDTO(poll));
        }

        return ResponseEntity.status(403).body("Permissions denied to delete polls");

    }

    /* private void logPoll(String title, Poll poll) {
        System.out.println("##### POLL LOG #####");
        System.out.printf("\tSession Id: \"%s\"\n", poll.getSessionId());
        System.out.printf("\tStatus: \"%s\"\n", poll.getStatus());
        System.out.printf("\tQuestion: \"%s\"\n", poll.getQuestion());
        System.out.println("\tResponses:");
        for(PollResponse response: poll.getResponses()) {
            System.out.printf("\t\t\"%s\": %d\n", response.getText(), response.getResult());
        }
        System.out.printf("\tTotal Responses: %d\n", poll.getTotalResponses());
        System.out.println("On "+title);
        System.out.println("####################");
    } */
    
}
