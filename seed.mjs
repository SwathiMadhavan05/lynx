/**
 * Lynx Firestore Seed Script
 * Run with: node seed.mjs
 * Requires: GOOGLE_APPLICATION_CREDENTIALS or firebase-admin service account
 *
 * Alternatively run from Firebase Console > Firestore > Add document manually.
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Uses Application Default Credentials (set by firebase login --reauth or ADC)
initializeApp({ projectId: 'lynx-76cfa' });

const db = getFirestore();

async function seed() {
  console.log('🌱 Seeding Firestore for Lynx...\n');

  // ─── CAMERAS ────────────────────────────────────────────────────────────────
  const cameras = [
    { id: 'CAM-01', label: 'Lobby Main', floor: '1', zone: 'Lobby',      status: 'online',  streamUrl: '' },
    { id: 'CAM-02', label: 'Corridor A', floor: '2', zone: 'Corridor A', status: 'online',  streamUrl: '' },
    { id: 'CAM-03', label: 'Corridor B', floor: '3', zone: 'Corridor B', status: 'online',  streamUrl: '' },
    { id: 'CAM-04', label: 'Stairwell',  floor: '4', zone: 'Stairwell',  status: 'offline', streamUrl: '' },
    { id: 'CAM-05', label: 'Reception',  floor: '5', zone: 'Reception',  status: 'online',  streamUrl: '' },
  ];

  for (const cam of cameras) {
    await db.collection('cameras').doc(cam.id).set(cam);
    console.log(`✅ Camera: ${cam.label} (Floor ${cam.floor})`);
  }

  // ─── STAFF ──────────────────────────────────────────────────────────────────
  // NOTE: The document ID should match the Firebase Auth UID of staff@lynx.com
  // After creating the user in Firebase Auth, replace 'REPLACE_WITH_AUTH_UID' below.
  const staff = {
    name: 'Swathi',
    email: 'staff@lynx.com',
    role: 'manager',
    floor: 'All',
    isOnDuty: true,
    fcmToken: null,
  };

  // Using email as doc ID as a fallback; ideally use the Auth UID
  await db.collection('staff').doc('swathi-manager').set(staff);
  console.log(`✅ Staff: ${staff.name} (${staff.role})`);

  // ─── HISTORICAL INCIDENTS ───────────────────────────────────────────────────
  const now = Date.now();
  const incidents = [
    {
      type: 'dual_match',
      confidence: 92,
      cameraId: 'CAM-01',
      floor: '1',
      zone: 'Lobby',
      status: 'resolved',
      timestamp: Timestamp.fromMillis(now - 3 * 60 * 60 * 1000), // 3 hours ago
      assignedStaff: 'swathi-manager',
      notes: 'Guest confirmed safe. False positive — luggage drag pattern.',
    },
    {
      type: 'gait_anomaly',
      confidence: 74,
      cameraId: 'CAM-02',
      floor: '2',
      zone: 'Corridor A',
      status: 'resolved',
      timestamp: Timestamp.fromMillis(now - 6 * 60 * 60 * 1000), // 6 hours ago
      assignedStaff: 'swathi-manager',
      notes: 'Staff responded. Guest had mobility assistance device.',
    },
    {
      type: 'lip_detection',
      confidence: 78,
      cameraId: 'CAM-03',
      floor: '3',
      zone: 'Corridor B',
      status: 'resolved',
      timestamp: Timestamp.fromMillis(now - 12 * 60 * 60 * 1000), // 12 hours ago
      assignedStaff: null,
      notes: 'Auto-resolved after no follow-up signal detected.',
    },
  ];

  for (const inc of incidents) {
    const ref = await db.collection('incidents').add(inc);
    // Write matching audit_log entry
    await db.collection('audit_logs').add({
      incidentId: ref.id,
      action: 'Status updated to resolved',
      staffId: 'swathi-manager',
      staffName: 'Swathi',
      timestamp: inc.timestamp,
    });
    console.log(`✅ Incident: ${inc.type} on Floor ${inc.floor} (resolved)`);
  }

  console.log('\n🎉 Seed complete! Your Lynx database is ready.');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
