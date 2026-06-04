export const LIVENESS_ACTIONS = [
  { id: "front", label: "Look straight at the camera", shortLabel: "Center" },
  { id: "left", label: "Turn your head slightly left", shortLabel: "Left" },
  { id: "right", label: "Turn your head slightly right", shortLabel: "Right" },
];

export const LIVENESS_HOLD_TARGET = 4;

/**
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} predictions
 * @param {string} currentActionId
 * @param {number} maskWarningFrames
 */
export function evaluateLivenessFrame(predictions, currentActionId, maskWarningFrames) {
  if (predictions.length > 1) {
    return {
      multipleFaces: true,
      sideView: false,
      eyesClosed: false,
      mask: false,
      matched: false,
      nextMaskFrames: 0,
      noFace: false,
    };
  }

  if (predictions.length === 0) {
    return {
      multipleFaces: false,
      sideView: false,
      eyesClosed: false,
      mask: false,
      matched: false,
      nextMaskFrames: 0,
      noFace: true,
    };
  }

  const face = predictions[0];
  const keypoints = face.keypoints;

  if (!keypoints || keypoints.length < 300) {
    return {
      multipleFaces: false,
      sideView: false,
      eyesClosed: false,
      mask: false,
      matched: false,
      nextMaskFrames: 0,
      noFace: true,
    };
  }

  const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  const nose = keypoints[1];
  const leftCheek = keypoints[234];
  const rightCheek = keypoints[454];
  const dLeft = getDistance(nose, leftCheek);
  const dRight = getDistance(nose, rightCheek);
  const ratio = Math.max(dLeft, dRight) / Math.min(dLeft, dRight);
  const yawRight = dLeft / (dRight || 1);
  const yawLeft = dRight / (dLeft || 1);

  const leftEyeVertical = getDistance(keypoints[159], keypoints[145]);
  const leftEyeHorizontal = getDistance(keypoints[33], keypoints[133]);
  const leftEAR = leftEyeVertical / (leftEyeHorizontal || 1);

  const rightEyeVertical = getDistance(keypoints[386], keypoints[374]);
  const rightEyeHorizontal = getDistance(keypoints[362], keypoints[263]);
  const rightEAR = rightEyeVertical / (rightEyeHorizontal || 1);

  const isEyesClosed = leftEAR < 0.12 || rightEAR < 0.12;

  const mouthWidth = getDistance(keypoints[78], keypoints[308]);
  const eyeDistance = getDistance(keypoints[33], keypoints[263]);
  const mouthEyeRatio = mouthWidth / (eyeDistance || 1);

  const upperNoseLength = getDistance(keypoints[168], keypoints[1]);
  const lowerNoseToChin = getDistance(keypoints[1], keypoints[152]);
  const noseChinRatio = lowerNoseToChin / (upperNoseLength || 1);

  const jawWidth = getDistance(keypoints[132], keypoints[361]);
  const jawEyeRatio = jawWidth / (eyeDistance || 1);

  const hasSevereOcclusionSignal =
    mouthEyeRatio < 0.24 ||
    mouthEyeRatio > 0.95 ||
    noseChinRatio < 0.8 ||
    noseChinRatio > 2.9 ||
    jawEyeRatio < 0.8 ||
    jawEyeRatio > 2.25;

  let nextMaskFrames = maskWarningFrames;
  if (hasSevereOcclusionSignal) {
    nextMaskFrames += 1;
  } else {
    nextMaskFrames = Math.max(0, nextMaskFrames - 2);
  }

  const isMaskDetected = nextMaskFrames >= 8;
  const sideViewExpected = currentActionId === "left" || currentActionId === "right";
  const isSideViewWhenNotExpected = !sideViewExpected && ratio > 1.7;

  if (isEyesClosed || isMaskDetected || isSideViewWhenNotExpected) {
    return {
      multipleFaces: false,
      sideView: isSideViewWhenNotExpected,
      eyesClosed: isEyesClosed,
      mask: isMaskDetected,
      matched: false,
      nextMaskFrames,
      noFace: false,
    };
  }

  let matched = false;
  if (currentActionId === "front") matched = ratio < 1.35;
  else if (currentActionId === "left") matched = yawLeft > 1.15;
  else if (currentActionId === "right") matched = yawRight > 1.15;

  return {
    multipleFaces: false,
    sideView: false,
    eyesClosed: false,
    mask: false,
    matched,
    nextMaskFrames,
    noFace: false,
  };
}

export function getLivenessStatusMessage(flags) {
  if (flags.multipleFaces) return "Only one person in frame";
  if (flags.noFace) return "Position your face in the oval";
  if (flags.sideView) return "Face the camera directly";
  if (flags.eyesClosed) return "Keep your eyes open";
  if (flags.mask) return "Remove mask or cover from face";
  if (flags.matched) return "Perfect — hold steady";
  return "Match the pose shown above";
}
