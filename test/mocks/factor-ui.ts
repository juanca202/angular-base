import { Component } from '@angular/core';

@Component({
  selector: 'ft-icon',
  template: '<span></span>',
  standalone: true
})
export class IconComponent {}

@Component({
  selector: 'ft-avatar',
  template: '<div></div>',
  standalone: true
})
export class AvatarComponent {}

@Component({
  selector: 'ft-progress',
  template: '<div></div>',
  standalone: true
})
export class ProgressComponent {}

export class MessageService {
  show(_msg: string) {}
  success() {}
  error() {}
  info() {}
}

import { Directive } from '@angular/core';

@Directive({
  selector: '[ftObserveIntersecting]',
  standalone: true
})
export class ObserveIntersectingDirective {}
