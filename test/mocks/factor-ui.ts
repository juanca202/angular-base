import { Component } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: '<span></span>',
  standalone: true,
})
export class IconComponent {}

@Component({
  selector: 'app-avatar',
  template: '<div></div>',
  standalone: true,
})
export class AvatarComponent {}

@Component({
  selector: 'app-progress',
  template: '<div></div>',
  standalone: true,
})
export class ProgressComponent {}

export class MessageService {
  success() {}
  error() {}
  info() {}
}

import { Directive } from '@angular/core';

@Directive({
  selector: '[appObserveIntersecting]',
  standalone: true,
})
export class ObserveIntersectingDirective {}
