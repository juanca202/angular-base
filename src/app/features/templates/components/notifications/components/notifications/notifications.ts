import { ChangeDetectionStrategy, Component, OnDestroy, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { lastValueFrom } from 'rxjs';
import { IconComponent, ObserveIntersectingDirective } from '@factor_ec/ui';
import { StringService } from '@factor_ec/utils';
import { QueryRef, Apollo, gql } from 'apollo-angular';

import { GraphqlUtils } from 'app/core/services/graphql-utils';
import { AppManager } from 'app/core/services/app-manager';
import { NotificationWrapped } from 'app/core/models/notification-wrapped';
import { Notification } from 'app/core/models/notification';
import { LayoutManager } from 'app/core/services/layout-manager';

@Component({
  selector: 'ft-notifications',
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    MatButtonModule,
    ObserveIntersectingDirective
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-page'
  }
})
export class Notifications implements OnDestroy {
  // Dependency injection
  private readonly apollo = inject(Apollo);
  public readonly appManager = inject(AppManager);
  private readonly graphqlUtils = inject(GraphqlUtils);
  public readonly layoutManager = inject(LayoutManager);
  private readonly stringService = inject(StringService);
  private readonly title = inject(Title);

  // Properties
  public readonly notifications = signal<NotificationWrapped[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly queryRef: QueryRef<any>;
  public readPool: string[] = [];
  private postReadTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.title.setTitle($localize`Notifications`);
    this.loading.set(true);
    this.queryRef = this.apollo.watchQuery<any>({
      query: gql`
        query {
          notifications {
            edges {
              node {
                id
                body
                action {
                  uuid
                  type
                  selected
                  options
                }
                seen
                createdAt
              }
            }
          }
        }
      `,
      fetchPolicy: 'network-only'
    });
    this.queryRef.valueChanges.subscribe({
      next: (query) => {
        this.loading.set(false);
        const notifications = this.graphqlUtils
          .parseEdges(query.data.notifications.edges)
          .map((notification: Notification) => {
            if (notification.action?.options) {
              notification.action.options.map((option: any) => {
                option.queryParams = {
                  action: notification.action?.uuid,
                  actionType: notification.action?.type,
                  actionValue: option.value
                };
              });
            }
            if (notification.action?.selected) {
              notification.action.selectedObject = notification.action.options.find(
                (a: any) => a.value === notification.action?.selected
              );
            }
            return { readTimer: null, notification };
          });
        this.notifications.set(notifications);
      },
      error: () => {
        this.loading.set(false);
      }
    });
    this.postReadTimer = setInterval(() => {
      this.postReadNotifications(this.readPool);
    }, 5000);
  }

  public ngOnDestroy(): void {
    if (this.postReadTimer) {
      clearInterval(this.postReadTimer);
      this.postReadNotifications(this.readPool);
      this.postReadTimer = null;
    }
  }
  public setAsRead(item: NotificationWrapped, visible: boolean): void {
    if (visible && !item.readTimer && !item.notification.seen) {
      item.readTimer = setTimeout(() => {
        this.readPool.push(item.notification.id);
        item.notification.seen = true;
      }, this.stringService.calculateReadingTime(item.notification.body));
    } else if (item.readTimer) {
      clearTimeout(item.readTimer);
      item.readTimer = null;
    }
  }
  public async postReadNotifications(ids: string[]): Promise<void> {
    if (this.readPool.length > 0) {
      await lastValueFrom(
        this.apollo.mutate<any>({
          mutation: gql`
          mutation {
            ${ids.map((id, index) => {
              return `update${index}: updateNotification(input: {id: "${id}", seen: true}) {
                  notification {
                    id
                  }
                }`;
            })}
          }
        `
        })
      );
      this.readPool = ids.filter((n) => !this.readPool.includes(n));
    }
  }
}
