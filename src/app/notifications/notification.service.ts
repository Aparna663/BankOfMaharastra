import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class NotificationService {
  errors = new Subject<any>();
  notify(e) {
    this.errors.next(e);
  }
  notifier(): Observable<any> {
    return this.errors.asObservable();
  }
}
