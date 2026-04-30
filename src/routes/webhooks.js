const express = require('express');
const {
  triggerStoreSync,
  getStoreSyncStatus
} = require('../jobs/sync-offline-stores');

const router = express.Router();
const RECENT_EVENT_TTL_MS = 10 * 60 * 1000;
const recentEventIds = new Map();

function cleanupRecentEvents() {
  const now = Date.now();
  for (const [eventId, createdAt] of recentEventIds.entries()) {
    if ((now - createdAt) > RECENT_EVENT_TTL_MS) {
      recentEventIds.delete(eventId);
    }
  }
}

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return require('crypto').timingSafeEqual(bufferA, bufferB);
}

router.post('/form-store-sync', async (req, res) => {
  const configuredSecret = process.env.STORE_SYNC_WEBHOOK_SECRET;

  if (!configuredSecret) {
    return res.status(500).json({
      success: false,
      error: 'Webhook secret not configured'
    });
  }

  const incomingSecret = req.get('x-sync-secret') || '';
  if (!safeCompare(incomingSecret, configuredSecret)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  cleanupRecentEvents();

  const eventId = (req.get('x-event-id') || req.body?.eventId || '').toString().trim();
  if (eventId) {
    if (recentEventIds.has(eventId)) {
      return res.status(202).json({
        success: true,
        accepted: false,
        duplicate: true,
        message: 'Duplicate event ignored',
        eventId,
        status: getStoreSyncStatus()
      });
    }
    recentEventIds.set(eventId, Date.now());
  }

  const result = await triggerStoreSync({ source: 'webhook:google-form' });

  return res.status(202).json({
    success: true,
    ...result,
    eventId: eventId || null,
    status: getStoreSyncStatus()
  });
});

router.get('/form-store-sync/status', (req, res) => {
  const configuredSecret = process.env.STORE_SYNC_WEBHOOK_SECRET;
  const incomingSecret = req.get('x-sync-secret') || '';

  if (!configuredSecret || !safeCompare(incomingSecret, configuredSecret)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  return res.json({
    success: true,
    status: getStoreSyncStatus()
  });
});

module.exports = router;
