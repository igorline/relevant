import ExifReader from 'exifreader';
import dataUriToBuffer from 'data-uri-to-buffer';

/* Image resize / EXIF processing functions */

export const MAX_IMAGE_DIMENSION = 1024;
export const MAX_FILE_SIZE = 1024 * 400;

export function loadFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsArrayBuffer(file);
  });
}

function getScale(width, height, viewportWidth, viewportHeight, fillViewport) {
  function fitHorizontal() {
    return viewportWidth / width;
  }
  function fitVertical() {
    return viewportHeight / height;
  }
  fillViewport = !!fillViewport;
  const landscape = width / height > viewportWidth / viewportHeight;
  if (landscape) {
    if (fillViewport) {
      return fitVertical();
    }
    if (width > viewportWidth) {
      return fitHorizontal();
    }
  } else {
    if (fillViewport) {
      return fitHorizontal();
    }
    if (height > viewportHeight) {
      return fitVertical();
    }
  }
  return 1;
}

function applyRotation(canvas, ctx, deg) {
  const radians = deg * (Math.PI / 180);
  if (deg === 90) {
    ctx.translate(canvas.width, 0);
  } else if (deg === 180) {
    ctx.translate(canvas.width, canvas.height);
  } else if (deg === 270) {
    ctx.translate(0, canvas.height);
  }
  ctx.rotate(radians);
}

function base64ToUint8Array(string, start, finish) {
  start = start || 0;
  finish = finish || string.length;
  const binary = atob(string);
  const buffer = new Uint8Array(binary.length);
  for (let i = start; i < finish; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function getOrientation(uri) {
  // Split off the base64 URL header
  const base64String = uri.split(',')[1];
  // Read off first 128KB, which is all we need to
  // get the EXIF data
  const arr = base64ToUint8Array(base64String, 0, 2 ** 17);
  try {
    const tags = ExifReader.load(arr.buffer);
    return tags.Orientation.value;
  } catch (err) {
    return 1;
  }
}

/**
 * Mapping from EXIF orientation values to data
 * regarding the rotation and mirroring necessary to
 * render the canvas correctly
 * Derived from:
 * http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
 */
const orientationToTransform = {
  1: { rotation: 0, mirror: false },
  2: { rotation: 0, mirror: true },
  3: { rotation: 180, mirror: false },
  4: { rotation: 180, mirror: true },
  5: { rotation: 90, mirror: true },
  6: { rotation: 90, mirror: false },
  7: { rotation: 270, mirror: true },
  8: { rotation: 270, mirror: false }
};

function applyOrientationCorrection(canvas, ctx, uri) {
  const orientation = getOrientation(uri);
  // Only apply transform if there is some non-normal orientation
  if (orientation && orientation !== 1) {
    const { rotation } = orientationToTransform[orientation];
    const flipAspect = rotation === 90 || rotation === 270;
    if (flipAspect) {
      // Fancy schmancy swap algo
      canvas.width = canvas.height + canvas.width;
      canvas.height = canvas.width - canvas.height;
      canvas.width -= canvas.height;
    }
    if (rotation > 0) {
      applyRotation(canvas, ctx, rotation);
    }
  }
}

export function renderToCanvas(img, options) {
  if (!img) return null;
  options = options || {};

  // Canvas max size for any side
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const initialScale = options.scale || 1;
  // Scale to needed to constrain canvas to max size
  let scale = getScale(
    img.width * initialScale,
    img.height * initialScale,
    MAX_IMAGE_DIMENSION,
    MAX_IMAGE_DIMENSION,
    true
  );
  // Still need to apply the user defined scale
  scale *= initialScale;
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const { correctOrientation } = options;
  const jpeg = !!img.src.match(/data:image\/jpeg|\.jpeg$|\.jpg$/i);
  const hasDataURI = !!img.src.match(/^data:/);

  ctx.save();

  // Can only correct orientation on JPEGs represented as dataURIs
  // for the time being
  if (correctOrientation && jpeg && hasDataURI) {
    applyOrientationCorrection(canvas, ctx, img.src);
  }
  // Resize image if too large
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  ctx.drawImage(img, 0, 0);
  ctx.restore();

  return canvas;
}

export function downsample(img) {
  const resized = renderToCanvas(img, { correctOrientation: true });
  let buf;
  let dataURL;
  let quality = 0.8;
  do {
    dataURL = resized.toDataURL('image/jpeg', quality);
    buf = dataUriToBuffer(dataURL);
    quality -= 0.05;
  } while (buf.length > MAX_FILE_SIZE && quality > 0.1);
  return dataURL;
}

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        reader.onload = null;
        reader.onerror = null;
        const dataURL = e.target.result;
        const buf = dataUriToBuffer(dataURL);
        if (buf.length <= MAX_FILE_SIZE) {
          resolve(dataURL);
        } else {
          const img = new Image();
          img.onload = () => {
            img.onload = null;
            img.onerror = null;
            resolve(downsample(img));
          };
          img.onerror = () => {
            img.onload = null;
            img.onerror = null;
            reject();
          };
          img.src = dataURL;
        }
      };
      reader.onerror = () => {
        reader.onload = null;
        reader.onerror = null;
        reject();
      };
      reader.readAsDataURL(file);
    } else reject();
  });
}
