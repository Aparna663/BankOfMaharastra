import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NotificationService } from './notification.service';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [
    trigger('notifications', [
      transition(
        ':enter', [
          style({ transform: 'translateX(100%)', opacity: 0 }),
          animate('250ms', style({ transform: 'translateX(0)', opacity: 1 }))
        ]
      ),
      transition(
        ':leave', [
          style({ transform: 'translateX(0)', opacity: 1 }),
          animate('250ms', style({ transform: 'translateX(100%)', opacity: 0 }))
        ]
      )
    ])
  ]
})

export class NotificationsComponent {
  notifications: any[] = [];
  constructor(private notificationService: NotificationService, private zone: NgZone) {
    this.notificationService.notifier().subscribe(notification => {
        this.notifications.push({ 'error': notification });
        this.zone.run(() => { });
    });
  }
}
