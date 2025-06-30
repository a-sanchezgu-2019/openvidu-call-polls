import { PollSyncService } from './../../services/poll-sync.service';
import { Session, SignalEvent } from 'openvidu-browser';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
	BroadcastingError,
	BroadcastingService,
	BroadcastingStatus,
	PanelService,
	PanelType,
	ParticipantService,
	RecordingInfo,
	RecordingService,
	RecordingStatus,
	TokenModel
} from 'openvidu-angular';

import { RestService } from 'src/app/services/rest.service';
import { generatePollDTO, LotteryPoll, MultipleOptionPoll, parsePollDTO, Poll, PollDTO, PollOption, PollResponse, PollWithOptions, PreferenceOrderPoll, SingleOptionPoll } from 'src/app/models/poll.model';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-call',
	templateUrl: './call.component.html',
	styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit {
	sessionId = '';
	tokens: TokenModel;
	joinSessionClicked: boolean = false;
	closeClicked: boolean = false;
	isSessionAlive: boolean = false;
	recordingEnabled: boolean = true;
	broadcastingEnabled: boolean = true;
	recordingList: RecordingInfo[] = [];
	recordingError: any;
	broadcastingError: BroadcastingError;
	serverError: string = '';
	loading: boolean = true;
	private isDebugSession: boolean = false;

	constructor(
		private restService: RestService,
		private participantService: ParticipantService,
		private recordingService: RecordingService,
		private broadcastingService: BroadcastingService,
		private panelService: PanelService,
		private pollService: PollSyncService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	async ngOnInit() {

		this.route.params.subscribe((params: Params) => {
			this.sessionId = params.roomName;
		});

		// Just for debugging purposes
		const regex = /^UNSAFE_DEBUG_USE_CUSTOM_IDS_/gm;
		const match = regex.exec(this.sessionId);
		this.isDebugSession = match && match.length > 0;

		try {
			await this.initializeTokens();
		} catch (error) {
			console.error(error);
			this.serverError = error?.error?.message || error?.statusText;
		} finally {
			this.loading = false;
		}

		this.subscribeToPanelToggling();
	}

	async onNodeCrashed() {
		// Request the tokens again for reconnect to the session
		await this.initializeTokens();
	}
	onLeaveButtonClicked() {
		this.isSessionAlive = false;
		this.closeClicked = true;
		this.router.navigate([`/`]);
	}
	async onStartRecordingClicked() {
		try {
			await this.restService.startRecording(this.sessionId);
		} catch (error) {
			this.recordingError = error;
		}
	}

	async onStopRecordingClicked() {
		try {
			this.recordingList = await this.restService.stopRecording(this.sessionId);
		} catch (error) {
			this.recordingError = error;
		}
	}

	async onDeleteRecordingClicked(recordingId: string) {
		try {
			this.recordingList = await this.restService.deleteRecording(recordingId);
		} catch (error) {
			this.recordingError = error;
		}
	}

	async onForceRecordingUpdate() {
		try {
			this.recordingList = await this.restService.getRecordings();
		} catch (error) {
			this.recordingError = error;
		}
	}

	async onStartBroadcastingClicked(broadcastingUrl: string) {
		try {
			this.broadcastingError = undefined;
			await this.restService.startBroadcasting(broadcastingUrl);
		} catch (error) {
			console.error(error);
			this.broadcastingError = error.error;
		}
	}

	async onStopBroadcastingClicked() {
		try {
			this.broadcastingError = undefined;
			await this.restService.stopBroadcasting();
		} catch (error) {
			console.error(error);
			this.broadcastingError = error.message || error;
		}
	}

	private async initializeTokens(): Promise<void> {
		let nickname: string = '';
		if (this.isDebugSession) {
			console.warn('DEBUGGING SESSION');
			nickname = this.participantService.getLocalParticipant().getNickname();
		}
		const { broadcastingEnabled, recordingEnabled, recordings, cameraToken, screenToken, isRecordingActive, isBroadcastingActive } =
			await this.restService.getTokens(this.sessionId, nickname);

		this.broadcastingEnabled = broadcastingEnabled;
		this.recordingEnabled = recordingEnabled;
		this.recordingList = recordings;
		this.tokens = {
			webcam: cameraToken,
			screen: screenToken
		};
		if (isRecordingActive) this.recordingService.updateStatus(RecordingStatus.STARTED);
		if (isBroadcastingActive) this.broadcastingService.updateStatus(BroadcastingStatus.STARTED);
	}

	// openvidu-call-polls code

	private session!: Session;
	private poll?: Poll;
	private pollSync: boolean = environment.poll_sync;
	showPollPanel: boolean = false;

	onSessionCreated(session: Session) {
		// Session management
		this.session = session;
		if(this.pollSync) {
			// Retrieve poll from backend
			this.pollService.getPoll(this.sessionId, true).subscribe({
				next: poll => this.poll = poll
			});
		}
	}

	onParticipantCreated(event) {
		// Message management
		this.session.on("signal:pollCreated", event => this.onPollCreated(event));
		this.session.on("signal:pollResponse", event => this.onPollResponse(event));
		this.session.on("signal:pollClosed", event => this.onPollClosed(event));
		this.session.on("signal:pollDeleted", event => this.onPollDeleted(event));
		this.session.on("signal:pollGet", event => this.onPollGet(event));
	}

	private subscribeToPanelToggling() {
		this.panelService.panelOpenedObs.subscribe(
			(ev: { opened: boolean; type?: PanelType | string }) => {
				this.showPollPanel = ev.opened && ev.type === "poll-panel";
			}
		);
	}

	togglePollPanel() {
		this.panelService.togglePanel("poll-panel");
	}

	private fetchPoll() {
		this.pollService.getPoll(this.sessionId).subscribe({
			next: poll => this.poll = poll,
			error: error => console.error("An unexpected error occured: " + error)
		})
	}

	onPollCreated(event: SignalEvent) {
		if(this.pollSync) {
			this.fetchPoll();
		} else {
			this.poll = parsePollDTO(JSON.parse(event.data) as PollDTO);
		}
	}

	onPollResponse(event: SignalEvent) {
		if(this.poll && this.session.connection.role == 'MODERATOR') {
			if(this.pollSync) {
				this.fetchPoll();
			} else if(event.from !== undefined) {
				const response: PollResponse = JSON.parse(event.data) as PollResponse;
				if(this.poll?.validResponse(response))
					this.poll.respond(response);
			}
		}
	}

	onPollClosed(event: SignalEvent) {
		if(this.pollSync) {
			this.fetchPoll();
		} else {
			this.poll = parsePollDTO(JSON.parse(event.data) as PollDTO);
		}
	}

	onPollDeleted(event: SignalEvent) {
		if(event.from?.role == "MODERATOR") {
			this.poll = undefined;
		}
	}

	onPollGet(event: SignalEvent) {
		if(this.session.connection.role === "MODERATOR") {
			if(event.from !== undefined) {
				this.session.signal({
					data: this.poll? JSON.stringify(this.parseParticipantPoll(event.from.connectionId)): null,
					to: [event.from],
					type: "pollGet"
				});
			}
		} else if(event.data !== null && event.data !== "") {
			this.poll = parsePollDTO(JSON.parse(event.data) as PollDTO);
		}
	}

	private parseParticipantPoll(id: string): PollDTO {
		if(this.poll instanceof LotteryPoll) {
			return generatePollDTO(new LotteryPoll(
				this.poll.sessionId,
				this.poll.anonymous,
				this.poll.question,
				this.poll.status
			));
		}
		let emptyOptions: PollOption[] = (this.poll as PollWithOptions).options.map(option => {
			return {text: option.text, result: 0, participants: []}
		});
		if(this.poll instanceof SingleOptionPoll) {
			return generatePollDTO(new SingleOptionPoll(
				this.poll.sessionId,
				this.poll.anonymous,
				this.poll.question,
				this.poll.status,
				[],
				[],
				emptyOptions
			));
		}
		if(this.poll instanceof MultipleOptionPoll) {
			return generatePollDTO(new MultipleOptionPoll(
				this.poll.sessionId,
				this.poll.anonymous,
				this.poll.question,
				this.poll.status,
				[],
				[],
				emptyOptions,
				this.poll.maxOptions,
				this.poll.minOptions
			));
		}
		if(this.poll instanceof PreferenceOrderPoll) {
			return generatePollDTO(new PreferenceOrderPoll(
				this.poll.sessionId,
				this.poll.anonymous,
				this.poll.question,
				this.poll.status,
				[],
				[],
				emptyOptions,
				this.poll.maxOptions,
				this.poll.minOptions,
				new Map(),
				this.poll.pointsMapping
			));
		}
	}

}
