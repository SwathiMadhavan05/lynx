"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyStaffOnHighAlert = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
const v2_1 = require("firebase-functions/v2");
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
exports.notifyStaffOnHighAlert = (0, firestore_1.onDocumentCreated)('incidents/{incidentId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        v2_1.logger.warn('No data found in incident event.');
        return;
    }
    const incident = snapshot.data();
    const incidentId = event.params.incidentId;
    // Guard: only fire for dual_match incidents above 85% confidence
    if (incident.type !== 'dual_match' || incident.confidence <= 85) {
        v2_1.logger.info(`Skipping notification: type=${incident.type}, confidence=${incident.confidence}`);
        return;
    }
    v2_1.logger.info(`High-confidence dual_match detected (${incident.confidence}%). Fetching on-duty staff...`);
    // Fetch all on-duty staff with registered FCM tokens
    const staffSnapshot = await db
        .collection('staff')
        .where('isOnDuty', '==', true)
        .get();
    if (staffSnapshot.empty) {
        v2_1.logger.warn('No on-duty staff found to notify.');
        return;
    }
    // Collect tokens and track which doc each belongs to for cleanup
    const tokenMap = {}; // token -> staffDocId
    staffSnapshot.forEach((staffDoc) => {
        const data = staffDoc.data();
        if (data.fcmToken && typeof data.fcmToken === 'string') {
            tokenMap[data.fcmToken] = staffDoc.id;
        }
    });
    const tokens = Object.keys(tokenMap);
    if (tokens.length === 0) {
        v2_1.logger.warn('On-duty staff found but none have FCM tokens registered.');
        return;
    }
    v2_1.logger.info(`Sending multicast notification to ${tokens.length} device(s)...`);
    // Build the multicast message payload
    const message = {
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
                tag: incidentId // Collapses duplicate notifications for same incident
            },
            fcmOptions: {
                link: '/'
            }
        }
    };
    const response = await admin.messaging().sendEachForMulticast(message);
    v2_1.logger.info(`FCM multicast result: ${response.successCount} sent, ${response.failureCount} failed.`);
    // Clean up stale / expired tokens automatically
    const staleTokenCleanupPromises = [];
    response.responses.forEach((resp, idx) => {
        var _a;
        if (!resp.success) {
            const errorCode = (_a = resp.error) === null || _a === void 0 ? void 0 : _a.code;
            const staleToken = tokens[idx];
            if (errorCode === 'messaging/registration-token-not-registered' ||
                errorCode === 'messaging/invalid-registration-token') {
                const staffDocId = tokenMap[staleToken];
                v2_1.logger.warn(`Removing stale FCM token from staff doc: ${staffDocId}`);
                staleTokenCleanupPromises.push(db.collection('staff').doc(staffDocId).update({ fcmToken: admin.firestore.FieldValue.delete() }));
            }
            else {
                v2_1.logger.error(`FCM send error for token ${staleToken}:`, resp.error);
            }
        }
    });
    if (staleTokenCleanupPromises.length > 0) {
        await Promise.all(staleTokenCleanupPromises);
        v2_1.logger.info(`Cleaned up ${staleTokenCleanupPromises.length} stale token(s).`);
    }
});
//# sourceMappingURL=index.js.map