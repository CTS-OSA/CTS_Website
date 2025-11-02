import React, { useRef, useEffect, useState } from "react";
import "../SetupProfile/css/multistep.css";
import { FileUp } from "lucide-react";

const SCIFCertify = ({ data, updateData, showError, readOnly = false }) => {
  const hasConsented = data?.privacy_consent?.has_consented || false;
  const signatureName = data?.privacy_consent?.signature || "";
  const signatureUrlFromParent = data?.privacy_consent?.signature_url || "";
  const dateFiled = data?.privacy_consent?.date_filed || "";

  const fileInputRef = useRef(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(
    signatureUrlFromParent
  );
  const [isUploading, setIsUploading] = useState(false);

  // Keep local preview in sync with parent-provided URL (e.g. after fetch)
  useEffect(() => {
    if (signatureUrlFromParent) {
      setLocalPreviewUrl(signatureUrlFromParent);
    }
  }, [signatureUrlFromParent]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConsentChange = (e) => {
    if (readOnly) return;
    updateData({
      ...data,
      privacy_consent: {
        ...data.privacy_consent,
        has_consented: e.target.checked,
      },
    });
  };

  // Local-only preview + parent state update (stores filename + preview URL)
  const handleFileChange = async (e) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // create blob url for preview
    const blobUrl = URL.createObjectURL(file);

    // revoke previous blob url if it was one
    if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setLocalPreviewUrl(blobUrl);

    // Store filename + preview URL in parent state for immediate UI reflection.
    // Note: preview URL here is a blob URL (not persisted). If you need persistence,
    // upload file to server/storage and use returned public URL instead.
    updateData({
      ...data,
      privacy_consent: {
        ...data.privacy_consent,
        signature: file.name,
        signature_url: blobUrl,
      },
    });

    // ---- Optional: Upload file to server/storage now and replace blobUrl with real URL ----
    // If you want the file to persist after refresh, uncomment / use this example:
    /*
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadFileToServer(file);
      // replace preview url with server url and persist filename/url
      updateData({
        ...data,
        privacy_consent: {
          ...data.privacy_consent,
          signature: file.name,
          signature_url: uploadedUrl,
        },
      });
    } catch (err) {
      console.error("Upload failed:", err);
      // show toast or message to user here
    } finally {
      setIsUploading(false);
    }
    */
  };

  // Fallback typed signature input
  const handleSignatureType = (e) => {
    if (readOnly) return;
    updateData({
      ...data,
      privacy_consent: {
        ...data.privacy_consent,
        signature: e.target.value,
        // do not overwrite signature_url unless you want to clear it:
        // signature_url: ""
      },
    });
    // keep local preview unchanged when typing a name
  };

  const handleDateChange = (e) => {
    if (readOnly) return;
    updateData({
      ...data,
      privacy_consent: {
        ...data.privacy_consent,
        date_filed: e.target.value,
      },
    });
  };

  const openFilePicker = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  // Placeholder - implement with your storage backend (Supabase / S3 / your API)
  // Should accept a File and return a publicly accessible URL (string)
  const uploadFileToServer = async (file) => {
    // Example (pseudocode):
    // const form = new FormData();
    // form.append("file", file);
    // const res = await fetch("/api/upload-signature", { method: "POST", body: form });
    // const json = await res.json();
    // if (!res.ok) throw new Error(json.message || "Upload failed");
    // return json.url; // url to saved file
    throw new Error(
      "uploadFileToServer not implemented. Replace with your upload logic."
    );
  };

  return (
    <div className="form-section">
      <fieldset className="form-section" disabled={readOnly}>
        <h2 className="step-title text-upmaroon">Privacy Statement</h2>

        <p className="privacy-description mb-4">
          The University of the Philippines takes your privacy seriously and we
          are committed to protecting your personal information. For the UP
          Privacy Policy, please visit{" "}
          <a
            href="https://privacy.up.edu.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-upmaroon underline hover:text-updlightmaroon"
          >
            https://privacy.up.edu.ph
          </a>
          .
        </p>

        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col">
            <label className="form-label font-semibold mb-2">Signature</label>

            {/* Hidden file input (for editable mode only) */}
            {!readOnly && (
              <input
                type="file"
                accept=".svg,.png,.jpg,.jpeg,.gif"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={readOnly}
              />
            )}

            {/* Signature display area */}
            <div
              role={readOnly ? undefined : "button"}
              onClick={!readOnly ? openFilePicker : undefined}
              onKeyDown={
                !readOnly
                  ? (e) => e.key === "Enter" && openFilePicker()
                  : undefined
              }
              tabIndex={!readOnly ? 0 : -1}
              className={`border-dashed border-2 rounded-md p-6 text-center ${
                readOnly
                  ? "bg-gray-100 border-gray-200 cursor-default"
                  : "cursor-pointer border-gray-300 hover:border-upmaroon focus:outline-none"
              }`}
            >
              {localPreviewUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={localPreviewUrl}
                    alt="Signature preview"
                    className="max-h-36 object-contain mb-2"
                  />
                  <div className="text-sm">
                    <strong>{signatureName || "Uploaded file"}</strong>
                  </div>
                  {isUploading && (
                    <div className="text-xs text-gray-500 mt-1">
                      Uploading...
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-center">
                    <FileUp className="text-upmaroon" />
                  </div>
                  <div className="text-sm font-medium">
                    {readOnly
                      ? "No signature available"
                      : "Upload your signature here."}
                  </div>
                  {!readOnly && (
                    <div className="text-xs text-gray-500 mt-1">
                      SVG, PNG, JPG or GIF (max. 3MB)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col max-w-sm">
            <label className="form-label font-semibold">Date Filed:</label>
            <input
              type="date"
              value={dateFiled}
              onChange={handleDateChange}
              readOnly={readOnly}
              required
              className={`border rounded-md px-3 py-2 mt-1 ${
                readOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-upmaroon"
              }`}
            />
          </div>
        </div>

        <div className="certify-agreement flex flex-col gap-2">
          <label className="form-label flex items-start gap-3">
            <input
              type="checkbox"
              name="has_consented"
              checked={hasConsented}
              onChange={handleConsentChange}
              className="mt-2 ml-2 h-5 w-5  border-gray-300 rounded"
              disabled={readOnly}
            />
            <span className="text-sm leading-relaxed">
              I have read the University of the Philippines’ Privacy Notice for
              Students. I understand that for the UP System to carry out its
              mandate under the 1987 Constitution, the UP Charter, and other
              laws, the University must necessarily process my personal and
              sensitive personal information. Therefore, I recognize the
              authority of the University of the Philippines to process my
              personal and sensitive personal information, pursuant to the UP
              Privacy Notice and applicable laws.
            </span>
          </label>

          {showError && !hasConsented && (
            <div className="text-upmaroon text-sm mt-1">
              Please agree to the privacy notice to proceed.
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default SCIFCertify;
