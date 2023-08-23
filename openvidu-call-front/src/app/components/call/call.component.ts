import { PollSyncService } from './../../services/poll-sync.service';
import { Session, SignalEvent } from 'openvidu-browser';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
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

import { RestService } from '../../services/rest.service';
import { Poll, PollPanelComponent } from '../poll-panel/poll-panel.component';
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
			this.pollService.getPoll(this.sessionId, false).subscribe({
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

	onPollCreated(event: SignalEvent) {
    this.poll = JSON.parse(event.data);
    console.info("Poll Creation: "+event.data);
	}

	onPollResponse(event: SignalEvent) {
		if(this.poll && this.session.connection.role == 'MODERATOR') {
			const data: number = parseInt(event.data);
			console.info("Poll Response: "+data);
			this.poll.totalResponses++;
			this.poll.responses[data].result++;
			console.info({role: this.session.connection.role, remoteConnections: this.session.remoteConnections, poll: this.poll});
			if(this.pollSync && this.session.remoteConnections.size == this.poll.totalResponses) {
				console.info("Trying to close poll...");
				this.pollService.closePoll(this.session.sessionId).subscribe({
					next: poll => this.poll = poll,
					error: error => alert("Ha ocurrido un error inesperado: "+error)
				});
			}
		}
	}

	onPollClosed(event: SignalEvent) {
    this.poll = JSON.parse(event.data);
    console.info("Poll Closed: "+event.data);
	}

	onPollDeleted(event: SignalEvent) {
		this.poll = undefined;
		console.info("Poll Deleted");
	}

}