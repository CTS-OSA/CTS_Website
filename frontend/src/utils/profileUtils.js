export const getProfilePhotoUrl = (profile) =>
  profile?.photo?.image || profile?.photo?.url || "";

export const getProfileInitials = (profile) => {
  if (!profile) return "ID";
  const first = profile.first_name?.charAt(0) || "";
  const last = profile.last_name?.charAt(0) || "";
  const initials = `${first}${last}`.trim();
  return initials.toUpperCase() || "ID";
};
