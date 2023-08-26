import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';

// Material
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Application Components
import { AppComponent } from './app.component';
import { CallComponent } from './components/call/call.component';
import { HomeComponent } from './components/home/home.component';

// OpenVidu Angular
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { OpenViduAngularConfig, OpenViduAngularModule } from 'openvidu-angular';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { HttpRequestInterceptor } from './services/http-interceptor.service';
import { PollPanelComponent } from './components/poll-panel/poll-panel.component';
import { PollCreationComponent } from './components/poll-panel/poll-creation/poll-creation.component';

// Services

const config: OpenViduAngularConfig = {
	production: environment.production
};

@NgModule({
	declarations: [AppComponent, HomeComponent, CallComponent, AdminDashboardComponent, PollPanelComponent, PollCreationComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		MatToolbarModule,
		MatButtonModule,
		MatSlideToggleModule,
		MatIconModule,
		MatExpansionModule,
		MatTooltipModule,
		CdkAccordionModule,
		OpenViduAngularModule.forRoot(config),
		AppRoutingModule // Order is important, AppRoutingModule must be the last import for useHash working
	],
	providers: [{ provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true }],
	bootstrap: [AppComponent]
})
export class AppModule {
	ngDoBootstrap() {}
}
