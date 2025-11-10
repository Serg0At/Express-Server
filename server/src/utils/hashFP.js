import crypto from 'crypto';

export function hashFingerprint(fpObj) {
  const raw = `${fpObj.os}|${fpObj.browser}|${fpObj.resolution}|${fpObj.timezone}|${fpObj.language}|${fpObj.touch}`;
  return crypto
    .createHmac('sha256', process.env.FP_SECRET)
    .update(raw)
    .digest('hex');
}

// soft-match
export function compareFingerprints(fp1, fp2) {
  let total = 0;
  let matched = 0;

  for (const key of Object.keys(fp1)) {
    total++;
    if (fp1[key] === fp2[key]) matched++;
  }

  const similarity = matched / total; // percentage of comparing %
  return similarity;
}
