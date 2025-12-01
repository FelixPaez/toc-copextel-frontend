import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { MessagesComponent } from './messages.component';
import { MessagesListComponent } from './messages-list/messages-list.component';
import { MessagesDetailComponent } from './messages-detail/messages-detail.component';

/**
 * Custom route matcher for messages.
 * This matcher allows for flexible routing based on filter (e.g., 'all', 'read', 'starred')
 * and an optional message ID.
 *
 * Examples:
 * - /messages/all/0 (filter 'all', page 0)
 * - /messages/read/1 (filter 'read', page 1)
 * - /messages/starred/0/msg-123 (filter 'starred', page 0, message ID 'msg-123')
 */
export const messagesRouteMatcher = (url: UrlSegment[]): UrlMatchResult | null => {
  if (url.length === 0) {
    return null;
  }

  const posParams: { [key: string]: UrlSegment } = {};
  let consumedSegments: UrlSegment[] = [];

  // The first segment is always the filter (e.g., 'all', 'read', 'sent')
  posParams['filter'] = url[0];
  consumedSegments.push(url[0]);

  // The second segment is the page number
  if (url.length > 1) {
    posParams['page'] = url[1];
    consumedSegments.push(url[1]);
  } else {
    // Default to page 0 if not provided
    posParams['page'] = new UrlSegment('0', {});
  }

  // The third segment is an optional message ID
  if (url.length > 2) {
    posParams['id'] = url[2];
    consumedSegments.push(url[2]);
  }

  return {
    consumed: consumedSegments,
    posParams: posParams
  };
};

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    component: MessagesComponent,
    children: [
      {
        path: '',
        redirectTo: 'all/0', // Default to 'all' messages on page 0
        pathMatch: 'full'
      },
      {
        matcher: messagesRouteMatcher,
        component: MessagesListComponent,
        children: [
          {
            path: ':id', // This path is matched by the custom matcher if an ID is present
            component: MessagesDetailComponent
          }
        ]
      }
    ]
  }
];

