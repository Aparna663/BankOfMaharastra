import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app.component';
import { AadharseedauthComponent } from '../driving_licence/aadharseedauth/aadharseedauth.component';
import { AuthenticationComponent } from '../driving_licence/authentication/authentication.component';
import { DltransactionsComponent } from '../driving_licence/dltransactions/dltransactions.component';
import { NextComponent } from '../next/next.component';
import { RegaadharauthComponent } from '../registration/regaadharseedauth/regaadharauth.component';
import { RegservicesauthComponent } from '../registration/regservicesauth/regservicesauth.component';

const routes: Routes = [
  
    {
        path: 'dashboard',
        component: AuthenticationComponent,
    },
    
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: '**', redirectTo: 'dashboard' }

];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true })
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
export class AppRoutingModule { }