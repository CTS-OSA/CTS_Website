// src/utils/photoValidation.js
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
export const MIN_DIMENSION = 200;
export const MAX_DIMENSION = 600;

/**
 * Validate an uploaded photo file.
 * Runs type, size, and dimension checks.
 * @param {File} file
 * @param {Function} onValid - called when validation passes
 * @param {Function} onError - called when validation fails
 */
export const validatePhotoFile = (file, onValid, onError) => {
  const errors = {};

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.photo = "File must be a JPG or PNG image.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.photo = `File size must not exceed ${MAX_FILE_SIZE_MB}MB.`;
  }

  if (Object.keys(errors).length > 0) {
    onError(errors);
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const dimErrors = {};

      if (this.width < MIN_DIMENSION || this.height < MIN_DIMENSION) {
        dimErrors.photo = `Minimum dimension is ${MIN_DIMENSION}px x ${MIN_DIMENSION}px.`;
      } else if (this.width > MAX_DIMENSION || this.height > MAX_DIMENSION) {
        dimErrors.photo = `Maximum dimension is ${MAX_DIMENSION}px x ${MAX_DIMENSION}px.`;
      } else if (Math.abs(this.width / this.height - 1) > 0.05) {
        dimErrors.photo = "Image should be nearly square (1:1 aspect ratio).";
      }

      if (Object.keys(dimErrors).length > 0) {
        onError(dimErrors);
      } else {
        const ext = file.name.split(".").pop();
        const renamed = new File([file], `student_photo_${Date.now()}.${ext}`, {
          type: file.type,
        });
        const previewURL = URL.createObjectURL(renamed);
        onValid(renamed, previewURL);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};
