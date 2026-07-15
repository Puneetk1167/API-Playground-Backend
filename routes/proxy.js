const express = require('express');
const router = express.Router();
const axios = require('axios');
const { performance } = require('perf_hooks');

/**
 * POST /api/proxy
 * Proxies an API request on behalf of the client.
 * Body: { url, method, headers, params, body }
 */
router.post('/', async (req, res) => {
  const { url, method = 'GET', headers = {}, params = [], body = null } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  // Build the full URL by appending enabled query params
  let fullUrl = url;
  try {
    const parsed = new URL(url);
    // Merge enabled params from state into the URL
    params
      .filter((p) => p.enabled && p.key.trim())
      .forEach((p) => parsed.searchParams.set(p.key, p.value));
    fullUrl = parsed.toString();
  } catch (err) {
    // If URL parsing fails (e.g. relative), proceed as-is
    fullUrl = url;
  }

  // Filter out empty / disabled headers
  const cleanHeaders = {};
  if (Array.isArray(headers)) {
    headers
      .filter((h) => h.enabled && h.key.trim())
      .forEach((h) => {
        cleanHeaders[h.key] = h.value;
      });
  } else if (typeof headers === 'object') {
    Object.assign(cleanHeaders, headers);
  }

  const startTime = performance.now();

  try {
    const response = await axios({
      method: method.toLowerCase(),
      url: fullUrl,
      headers: cleanHeaders,
      data: body || undefined,
      // Don't throw for non-2xx — capture the status ourselves
      validateStatus: () => true,
      // Increase timeout to 30s
      timeout: 30000,
    });

    const endTime = performance.now();
    const elapsedMs = Math.round(endTime - startTime);

    // Calculate approximate response size
    const responseText = JSON.stringify(response.data);
    const sizeBytes = Buffer.byteLength(responseText, 'utf8');
    const sizeDisplay = sizeBytes < 1024
      ? `${sizeBytes} B`
      : sizeBytes < 1048576
        ? `${(sizeBytes / 1024).toFixed(1)} KB`
        : `${(sizeBytes / 1048576).toFixed(2)} MB`;

    // Map response headers to a clean array
    const responseHeaders = Object.entries(response.headers || {}).map(
      ([key, value]) => ({ key, value: String(value) })
    );

    return res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: responseHeaders,
      sizeBytes,
      sizeDisplay,
      timeMs: elapsedMs,
    });
  } catch (err) {
    const endTime = performance.now();
    const elapsedMs = Math.round(endTime - startTime);

    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timed out after 30 seconds.',
        timeMs: elapsedMs,
      });
    }

    return res.status(500).json({
      error: err.message || 'An unknown error occurred.',
      timeMs: elapsedMs,
    });
  }
});

module.exports = router;
