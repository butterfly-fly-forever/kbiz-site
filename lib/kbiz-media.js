/**
 * Map Wix static media IDs → high-res files in kbiz-clone/images (served at /kbiz-media/).
 */
const KBIZ_MEDIA_PREFIX = '/kbiz-media/';

/** Wix media id (before ~mv2) → filename in kbiz-clone/images */
const WIX_URI_TO_FILE = {
  'a6d944_cb3a577e306f477d950688b6d94b60d7': 'logo.png',
  'a6d944_93726c78dcbc442b87fe455c878a4a5e': 'hero-nhatrang.jpg',
  'a6d944_999ef32b8bd14ac28a50648a6c022622': 'about-office.jpg',
  'f6985b_0ef6350aab5641e1ae86daec2c5cbf1f': 'service-investment.jpg',
  'f6985b_11707ae0378e44e8b2fea737459dfaf2': 'service-newbiz.jpg',
  'f6985b_cc991a5577ce4743ba7c2575e6909925': 'service-bizdev.jpg',
  'f6985b_f79ae9cc3d45421a8e1d44d6cf51041e': 'service-investment.jpg',
  'f6985b_ecd2202d40af4080af50a1ec8e7a60ac': 'service-newbiz.jpg',
  'f6985b_f4dc75ebb6f5435fa48c42d3258dbaab': 'service-bizdev.jpg',
  'a6d944_5b7060c85c774a699f59ad2ceb870e1a': 'avatar-hang.png',
  'a6d944_0a5c963a2d7e4e4fbd0221ab4e61a37c': 'avatar-hiep.png',
  'a6d944_838e50a7f6e74583961dd62ea6e5875b': 'avatar-nhi.png',
  'a6d944_8a32cd3a796246ecaa18369617aae75f': 'avatar-son.png',
  'a6d944_6e87e865e89a433aa8fafcb258c4be63': 'avatar-anh.png',
  'a6d944_7222cf48aeae4001a66a4b83b8cfe393': 'avatar-khanh.png',
  'f6985b_b1fd5bdfd94a4d79b528a1165e748336': 'project-vanphong.jpg',
  'f6985b_ed4779e1f2d74351b16ac8d8c2c83d43': 'project-australis.jpg',
  'a6d944_9cb3d36d0d6546c6b49388fcadccc4d9': 'project-hospital.png',
  'f6985b_874a3c9d6dc149c6939602bdcf13fa02': 'project-khanhhoa.jpg',
  'f6985b_974070095b94471d9ce26543c7ff978a': 'project-olympia.jpg',
  'f6985b_d1e456763d1f4a5ab679dadb754997c7': 'project-anamandara.jpg',
  'f6985b_f418928fd1334cb296e36208c0255195': 'project-mia.jpg',
  'f6985b_c8f1316618534a9dba105f4509039fdb': 'project-karmsund.jpg',
  'f6985b_f0d3275fa801486f8268f933b1896b5a': 'service-investment.jpg',
  'f6985b_0242dff4aff048f9821097d1768cf908': 'service-investment.jpg',
  'a6d944_98a9c28d55cd4b7a9b6df6d9732b8834': 'service-newbiz.jpg',
  'f6985b_9e99b668c49d46c4a35a288c31c7b543': 'service-bizdev.jpg',
  'f6985b_52dc54b4ce85436c9afb44bd04c2e1bb': 'gallery-1.jpg',
  'a6d944_8040548d0fbe465a89a31401adc5d023': 'gallery-2.jpg',
};

function localUrl(file) {
  return KBIZ_MEDIA_PREFIX + file;
}

/** Per consulting snapshot: map page-specific Wix URIs → kbiz-clone service card image. */
const CONSULTING_PAGE_URIS = {
  'service/consulting-1': {
    file: 'service-investment.jpg',
    uris: [
      'f6985b_f0d3275fa801486f8268f933b1896b5a',
      'f6985b_0242dff4aff048f9821097d1768cf908',
      'nsplsh_8258c8de054049c199f1e9758760ec25',
    ],
  },
  'service/consulting-2': {
    file: 'service-newbiz.jpg',
    uris: [
      'a6d944_98a9c28d55cd4b7a9b6df6d9732b8834',
      'a6d944_8040548d0fbe465a89a31401adc5d023',
    ],
  },
  'service/consulting-3': {
    file: 'service-bizdev.jpg',
    uris: [
      'f6985b_9e99b668c49d46c4a35a288c31c7b543',
      'f6985b_52dc54b4ce85436c9afb44bd04c2e1bb',
    ],
  },
};

function replaceUriWithLocal(out, uri, file) {
  const local = localUrl(file);
  const escaped = uri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return out
    .replace(
      new RegExp(`https:\\/\\/static\\.wixstatic\\.com\\/media\\/${escaped}[^"'\\s)]*`, 'gi'),
      local,
    )
    .replace(
      new RegExp(`https://static\\.wixstatic\\.com/media/${escaped}[^"'\\s)]*`, 'gi'),
      local,
    )
    .replace(
      new RegExp(`(&quot;|")uri\\1:\\1(${escaped}[^"&]*)\\1`, 'gi'),
      `$1uri$1:$1${local}$1`
    );
}

/** Replace wixstatic URLs for known assets with local kbiz-clone images. */
function applyKbizMedia(html, snapshotFile) {
  let out = html;
  const pageUris = snapshotFile && CONSULTING_PAGE_URIS[snapshotFile];
  if (pageUris) {
    for (const uri of pageUris.uris) out = replaceUriWithLocal(out, uri, pageUris.file);
  }
  for (const [uri, file] of Object.entries(WIX_URI_TO_FILE)) {
    out = replaceUriWithLocal(out, uri, file);
  }
  return out;
}

/** Drop blur placeholders and bump tiny Wix transform sizes. */
function sharpifyWixImages(html) {
  let out = html
    .replace(/,blur_2\b/g, '')
    .replace(/\bblur_2,/g, '')
    .replace(/,usm_0\.66_1\.00_0\.01,blur_2/g, ',usm_0.66_1.00_0.01');

  out = out.replace(
    /\/fill\/w_(\d+),h_(\d+)(,[^"'\\s)]*)/gi,
    (match, wStr, hStr, rest) => {
      const w = parseInt(wStr, 10);
      const h = parseInt(hStr, 10);
      if (w >= 400 && h >= 300) return match;
      const scale = Math.max(400 / Math.max(w, 1), 300 / Math.max(h, 1), 2);
      const nw = Math.min(Math.round(w * scale), 1920);
      const nh = Math.min(Math.round(h * scale), 1920);
      return `/fill/w_${nw},h_${nh}${rest}`;
    },
  );

  out = out.replace(/\/fit\/w_(\d+),h_(\d+),q_(\d+)/gi, (match, wStr, hStr, q) => {
    const w = parseInt(wStr, 10);
    const h = parseInt(hStr, 10);
    if (w >= 800) return match;
    const nw = Math.min(Math.max(w, 800), 1920);
    const nh = Math.min(Math.max(h, Math.round((h / w) * nw)), 1920);
    const nq = Math.max(parseInt(q, 10) || 80, 90);
    return `/fit/w_${nw},h_${nh},q_${nq}`;
  });

  return out;
}

module.exports = {
  KBIZ_MEDIA_PREFIX,
  WIX_URI_TO_FILE,
  applyKbizMedia,
  sharpifyWixImages,
};
