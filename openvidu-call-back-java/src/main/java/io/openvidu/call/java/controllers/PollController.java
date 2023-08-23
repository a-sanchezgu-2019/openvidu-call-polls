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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.openvidu.call.java.models.Poll;
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
    public ResponseEntity<?> startPoll(@RequestBody Poll poll,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken) {

        String sessionId = openviduService.getSessionIdFromCookie(moderatorToken);
        boolean isValidToken = openviduService.isModeratorSessionValid(sessionId, moderatorToken);

        if(!sessionId.isEmpty() && isValidToken) { // Is the moderator of the session
            openviduService.updatePoll(poll);
            return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{sessionId}").buildAndExpand(poll.getSessionId()).toUri()).body(poll);
        } else {
            System.err.println("Permissions denied to create a poll");
            return ResponseEntity.status(403).body("Permissions denied to create a poll");
        }
        
    }

    /**
     * Request in order to get the poll information
     * @param sessionId session ID of the call
     * @return Response entity with the poll information
     * @see Poll
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getPoll(@PathVariable String sessionId) {
        Poll poll = openviduService.getPoll(sessionId);
        if(poll == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(poll);
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
    @PostMapping("/{sessionId}")
    public ResponseEntity<?> updatePoll(
        @PathVariable String sessionId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String nickname,
        @RequestParam(required = false) Integer responseIndex,
        @CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken
    ) {

        if(status == null && (nickname == null || responseIndex == null))
            return ResponseEntity.badRequest().body("{ error: \"Needed one of these set of params: { status: string } || { nickname: string, responseIndex: number}\"}");

        if(status != null) {

            if(openviduService.isModeratorSessionValid(sessionId, moderatorToken)) { // Is the moderator of the session
                
                Poll poll = openviduService.getPoll(sessionId);

                if(poll == null)
                    return ResponseEntity.notFound().build();
                if(!status.equals("closed"))
                    return ResponseEntity.badRequest().body("Invalid poll status");

                poll.setStatus(status);
                openviduService.updatePoll(poll);
                return ResponseEntity.ok(poll);

            } else {

                System.err.println("Permissions denied to create a poll");
                return ResponseEntity.status(403).body("Permissions denied to change the poll status");

            }
            
        } else {

            Poll poll = openviduService.respondPoll(sessionId, nickname, responseIndex);

            if(poll != null)
                return ResponseEntity.ok(poll);
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
            return ResponseEntity.ok(poll);
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
