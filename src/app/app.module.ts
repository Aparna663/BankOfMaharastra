import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { CommonModule, DatePipe} from '@angular/common';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppConstants } from './app.constants';
import { AuthenticationComponent } from './driving_licence/authentication/authentication.component';
import { AuthenticationService } from './driving_licence/authentication/authentication.service';
import { AadharseedauthComponent } from './driving_licence/aadharseedauth/aadharseedauth.component';
import { RegaadharauthComponent } from './registration/regaadharseedauth/regaadharauth.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationService } from './notifications/notification.service';
import { RegaadharauthService } from './registration/regaadharseedauth/regaadharauth.service';
import { DltransactionsComponent } from './driving_licence/dltransactions/dltransactions.component';
import { RegservicesauthComponent } from './registration/regservicesauth/regservicesauth.component';
import { NextComponent } from './next/next.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    AadharseedauthComponent,
    RegaadharauthComponent,
    RegservicesauthComponent,
    NotificationsComponent,
    DltransactionsComponent,
    NextComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [AppConstants,AuthenticationService, RegaadharauthService, DatePipe, NotificationService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
