export const getProfilePhotoUrl = (profile) =>
  profile?.photo?.image || profile?.photo?.url || "";

export const getProfileInitials = (profile) => {
  if (!profile) return "ID";
  const first = profile.first_name?.charAt(0) || "";
  const last = profile.last_name?.charAt(0) || "";
  const initials = `${first}${last}`.trim();
  return initials.toUpperCase() || "ID";
};

export async function toDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = reject;
  });
}
