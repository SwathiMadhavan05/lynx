import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function: notifyStaffOnHighAlert
 *
 * Triggers on any new incident document.
 * If type === 'dual_match' AND confidence > 85, fetches all on-duty staff
 * and sends FCM push notifications to their registered device tokens.
 * Stale / expired tokens are automatically purged from Firestore.
 */
export const notifyStaffOnHighAlert = onDocumentCreated(
  'incidents/{incidentId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn('No data found in incident event.');
      return;
    }

    const incident = snapshot.data();
    const incidentId = event.params.incidentId;

    // Guard: only fire for dual_match incidents above 85% confidence
    if (incident.type !== 'dual_match' || incident.confidence <= 85) {
      logger.info(`Skipping notification: type=${incident.type}, confidence=${incident.confidence}`);
      return;
    }

    logger.info(`High-confidence dual_match detected (${incident.confidence}%). Fetching on-duty staff...`);

    // Fetch all on-duty staff with registered FCM tokens
    const staffSnapshot = await db
      .collection('staff')
      .where('isOnDuty', '==', true)
      .get();

    if (staffSnapshot.empty) {
      logger.warn('No on-duty staff found to notify.');
      return;
    }

    // Collect tokens and track which doc each belongs to for cleanup
    const tokenMap: Record<string, string> = {}; // token -> staffDocId
    staffSnapshot.forEach((staffDoc) => {
      const data = staffDoc.data();
      if (data.fcmToken && typeof data.fcmToken === 'string') {
        tokenMap[data.fcmToken] = staffDoc.id;
      }
    });

    const tokens = Object.keys(tokenMap);
    if (tokens.length === 0) {
      logger.warn('On-duty staff found but none have FCM tokens registered.');
      return;
    }

    logger.info(`Sending multicast notification to ${tokens.length} device(s)...`);

    // Build the multicast message payload
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: '⚠ LYNX HIGH ALERT',
        body: `Dual signal match at ${incident.zone}, Floor ${incident.floor} — Confidence: ${incident.confidence}%`
      },
      data: {
        incidentId,
        floor: String(incident.floor),
        zone: String(incident.zone),
        type: incident.type,
        confidence: String(incident.confidence)
      },
      webpush: {
        notification: {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
          tag: incidentId  // Collapses duplicate notifications for same incident
        },
        fcmOptions: {
          link: '/'
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    logger.info(`FCM multicast result: ${response.successCount} sent, ${response.failureCount} failed.`);

    // Clean up stale / expired tokens automatically
    const staleTokenCleanupPromises: Promise<admin.firestore.WriteResult>[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        const staleToken = tokens[idx];

        if (
          errorCode === 'messaging/registration-token-not-registered' ||
          errorCode === 'messaging/invalid-registration-token'
        ) {
          const staffDocId = tokenMap[staleToken];
          logger.warn(`Removing stale FCM token from staff doc: ${staffDocId}`);
          staleTokenCleanupPromises.push(
            db.collection('staff').doc(staffDocId).update({ fcmToken: admin.firestore.FieldValue.delete() })
          );
        } else {
          logger.error(`FCM send error for token ${staleToken}:`, resp.error);
        }
      }
    });

    if (staleTokenCleanupPromises.length > 0) {
      await Promise.all(staleTokenCleanupPromises);
      logger.info(`Cleaned up ${staleTokenCleanupPromises.length} stale token(s).`);
    }
  }
);
