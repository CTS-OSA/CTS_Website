import React from "react";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 600;

const PhotoUpload = ({
  photoFile,
  setPhotoFile,
  errors,
  setErrors,
  photoPreview,
  setPhotoPreview,
}) => {
  // --- Validation and File Setting Logic ---
  const validateAndSetFile = (file) => {
    const tempErrors = {};

    // 1. Clean up old preview URL if one exists
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }

    // --- 2. Quick Checks (Type and Size) ---
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      tempErrors.photo = "File must be a JPG or PNG image.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      tempErrors.photo = `File size must not exceed ${MAX_FILE_SIZE_MB}MB.`;
    }

    if (Object.keys(tempErrors).length > 0) {
      // Errors found in quick checks, clear file and show errors
      setErrors((prev) => ({ ...prev, ...tempErrors }));
      setPhotoFile(null);
      return;
    }

    // --- 3. Dimension Check (Requires loading the image) ---
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        let dimensionErrors = {};

        if (this.width < MIN_DIMENSION || this.height < MIN_DIMENSION) {
          dimensionErrors.photo = `Minimum dimension is ${MIN_DIMENSION}px x ${MIN_DIMENSION}px.`;
        } else if (this.width > MAX_DIMENSION || this.height > MAX_DIMENSION) {
          dimensionErrors.photo = `Maximum dimension is ${MAX_DIMENSION}px x ${MAX_DIMENSION}px.`;
        } else if (Math.abs(this.width / this.height - 1) > 0.05) {
          dimensionErrors.photo =
            "Image should be nearly square (1:1 aspect ratio).";
        }

        if (Object.keys(dimensionErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...dimensionErrors }));
          setPhotoFile(null);
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.photo;
            return newErrors;
          });
          const extension = file.name.split(".").pop();
          const timestamp = Date.now();
          const newFileName = `student_photo_${timestamp}.${extension}`;
          const renamedFile = new File([file], newFileName, {
            type: file.type,
          });
          setPhotoFile(renamedFile);
          const url = URL.createObjectURL(renamedFile);
          setPhotoPreview(url);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.photo;
      return newErrors;
    });

    if (file) {
      validateAndSetFile(file);
    } else {
      setPhotoFile(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-upmaroon text-2xl font-bold pb-4">STUDENT PHOTO</h2>

      {photoPreview ? (
        <div className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50 mb-4 sm:text-cente">
          <div className="w-32 h-32 border border-gray-400 rounded-md overflow-hidden mb-3">
            {/*  */}
            <img
              src={photoPreview}
              alt="Photo Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-semibold text-gray-700 break-all text-center">
            {photoFile.name}
          </p>
          <p className="text-xs text-gray-500">
            Size: {(photoFile.size / 1024 / 1024).toFixed(2)} MB
          </p>

          {errors?.photo && (
            <p className="text-red-500 text-sm font-medium mt-2 text-center">
              {errors.photo}
            </p>
          )}

          <label
            htmlFor="dropzone-file"
            className="text-upmaroon text-sm font-medium mt-2 cursor-pointer hover:underline"
          >
            Change Photo
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 ${
              errors?.photo ? "border-red-500" : "border-gray-300"
            } border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 sm:text-cente">
              {/* SVG Icon */}
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5.0 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 r">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG or JPG. Min. {MIN_DIMENSION}px x {MIN_DIMENSION}px
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: {MAX_FILE_SIZE_MB}MB
              </p>
              {errors?.photo && (
                <p className="text-red-500 text-sm font-medium mt-2 text-center">
                  {errors.photo}
                </p>
              )}
            </div>
          </label>
        </div>
      )}

      <input
        type="file"
        id="dropzone-file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default PhotoUpload;
