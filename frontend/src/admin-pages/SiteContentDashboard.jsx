import React, { useState, useEffect } from "react";
import { Trash2, Edit2, Upload, Plus, Minus } from "react-feather";
import DefaultLayout from "../components/DefaultLayout";
import { toast } from "react-toastify";
import axios from "axios";
import Button from "../components/UIButton";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

const SiteContentDashboard = () => {
  const [activeTab, setActiveTab] = useState("professionals");
  const [professionals, setProfessionals] = useState([]);
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Professional form state
  const [professionalForm, setProfessionalForm] = useState({
    full_name: "",
    post_nominal: "",
    positions: [""],
    licenses: [""],
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editingProfessionalId, setEditingProfessionalId] = useState(null);

  // Poster form state
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [editingPosterId, setEditingPosterId] = useState(null);

  useEffect(() => {
    fetchProfessionals();
    fetchPosters();
  }, []);

  // Fetch Professionals (Simplified error handling)
  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/professionals/");
      setProfessionals(response.data);
    } catch (error) {
      console.error("Failed to fetch professionals (silent error):", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Posters (Simplified error handling)
  const fetchPosters = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/posters/");
      setPosters(response.data);
    } catch (error) {
      console.error("Failed to fetch posters (silent error):", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Professional Photo Upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setProfessionalForm({ ...professionalForm, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Handle Poster Upload
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10485760) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  // Add Professional Position
  const handleAddPosition = () => {
    setProfessionalForm({
      ...professionalForm,
      positions: [...professionalForm.positions, ""],
    });
  };

  const handlePositionChange = (index, value) => {
    const updatedPositions = [...professionalForm.positions];
    updatedPositions[index] = value;
    setProfessionalForm({ ...professionalForm, positions: updatedPositions });
  };

  // Remove Professional Position
  const handleRemovePosition = (index) => {
    const updatedPositions = professionalForm.positions.filter((_, i) => i !== index);
    setProfessionalForm({ ...professionalForm, positions: updatedPositions });
  };

  // Add License
  const handleAddLicense = () => {
    setProfessionalForm({
      ...professionalForm,
      licenses: [...professionalForm.licenses, ""],
    });
  };

  const handleLicenseChange = (index, value) => {
    const updatedLicenses = [...professionalForm.licenses];
    updatedLicenses[index] = value;
    setProfessionalForm({ ...professionalForm, licenses: updatedLicenses });
  };

  // Remove License
  const handleRemoveLicense = (index) => {
    const updatedLicenses = professionalForm.licenses.filter((_, i) => i !== index);
    setProfessionalForm({ ...professionalForm, licenses: updatedLicenses });
  };

  // Submit Professional
  const handleSubmitProfessional = async (e) => {
    e.preventDefault();

    if (!professionalForm.full_name || !professionalForm.post_nominal) {
      toast.error("Please fill in required fields");
      return;
    }

    const formData = new FormData();
    formData.append("full_name", professionalForm.full_name);
    formData.append("post_nominal", professionalForm.post_nominal);
    // Filter out empty strings before sending
    formData.append("positions", JSON.stringify(professionalForm.positions.filter(p => p.trim() !== "")));
    formData.append("licenses", JSON.stringify(professionalForm.licenses.filter(l => l.trim() !== "")));

    if (professionalForm.photo) {
      formData.append("photo", professionalForm.photo);
    }

    try {
      if (editingProfessionalId) {
        await api.put(`/api/professionals/${editingProfessionalId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Professional updated successfully");
      } else {
        await api.post("/api/professionals/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Professional added successfully");
      }
      resetProfessionalForm();
      fetchProfessionals();
    } catch (error) {
      toast.error("Failed to save professional");
      console.error(error);
    }
  };

  // Edit Professional
  const handleEditProfessional = (professional) => {
    // Populate form with existing data, ensuring arrays have at least one empty string if empty
    const positions = Array.isArray(professional.positions) && professional.positions.length > 0
      ? professional.positions
      : [""];
    const licenses = Array.isArray(professional.licenses) && professional.licenses.length > 0
      ? professional.licenses
      : [""];

    setProfessionalForm({
      full_name: professional.full_name,
      post_nominal: professional.post_nominal,
      positions: positions,
      licenses: licenses,
      photo: null,
    });
    setPhotoPreview(professional.photo);
    setEditingProfessionalId(professional.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Professional
  const handleDeleteProfessional = async (id) => {
    if (!window.confirm("Are you sure you want to delete this professional?")) return;

    try {
      await api.delete(`/api/professionals/${id}/`);
      toast.success("Professional deleted successfully");
      fetchProfessionals();
    } catch (error) {
      toast.error("Failed to delete professional");
      console.error(error);
    }
  };

  // Reset Professional Form
  const resetProfessionalForm = () => {
    setProfessionalForm({
      full_name: "",
      post_nominal: "",
      positions: [""],
      licenses: [""],
      photo: null,
    });
    setPhotoPreview(null);
    setEditingProfessionalId(null);
  };

  // Submit Poster
  const handleSubmitPoster = async (e) => {
    e.preventDefault();

    if (!posterFile && !editingPosterId) {
      toast.error("Please select a poster image");
      return;
    }

    const formData = new FormData();
    if (posterFile) {
      formData.append("image", posterFile);
    }

    try {
      if (editingPosterId) {
        await api.put(`/api/posters/${editingPosterId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Poster updated successfully");
      } else {
        await api.post("/api/posters/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Poster uploaded successfully");
      }
      resetPosterForm();
      fetchPosters();
    } catch (error) {
      toast.error("Failed to save poster");
      console.error(error);
    }
  };

  // Edit Poster
  const handleEditPoster = (poster) => {
    setPosterPreview(poster.image);
    setEditingPosterId(poster.id);
    setPosterFile(null); // Clear file input
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Poster
  const handleDeletePoster = async (id) => {
    if (!window.confirm("Are you sure you want to delete this poster?")) return;

    try {
      await api.delete(`/api/posters/${id}/`);
      toast.success("Poster deleted successfully");
      fetchPosters();
    } catch (error) {
      toast.error("Failed to delete poster");
      console.error(error);
    }
  };

  // Reset Poster Form
  const resetPosterForm = () => {
    setPosterFile(null);
    setPosterPreview(null);
    setEditingPosterId(null);
  };

  const renderProfessionalsTab = () => (
    <div>
      <div className="border-l-4 border-upmaroon px-4 py-3 mb-6 bg-gray-50">
        <h2 className="text-xl font-bold text-upmaroon">
          {editingProfessionalId ? "EDIT PROFESSIONAL" : "ADD PROFESSIONAL"}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Add or update a professional to your staff directory
        </p>
      </div>

      <form onSubmit={handleSubmitProfessional}>
        <div className="bg-white p-6 rounded-lg mb-8 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-start justify-center">
              <label className="w-full h-40 border border-gray-400 rounded-md flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:border-upmaroon transition">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <>
                    <Upload size={24} className="text-gray-500 mb-1" />
                    <span className="text-xs text-gray-600 text-center px-2">
                      Drop or upload image here
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Supports jpg, png (600x600)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(null); setProfessionalForm({...professionalForm, photo: null}) }}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="md:col-span-2 space-y-4">
              {/* Name and Post Nominal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Full Name: <span className="text-upmaroon">*</span>
                  </label>
                  <input
                    type="text"
                    value={professionalForm.full_name}
                    onChange={(e) =>
                      setProfessionalForm({
                        ...professionalForm,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-upmaroon focus:border-upmaroon"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Post Nominal: <span className="text-upmaroon">*</span>
                  </label>
                  <input
                    type="text"
                    value={professionalForm.post_nominal}
                    onChange={(e) =>
                      setProfessionalForm({
                        ...professionalForm,
                        post_nominal: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-upmaroon focus:border-upmaroon"
                    required
                  />
                </div>
              </div>

              {/* Positions */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold mb-1">
                  Position(s):
                </label>
                {professionalForm.positions.map((position, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => handlePositionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-upmaroon focus:border-upmaroon"
                    />
                    {/* ADD/REMOVE POSITION BUTTONS */}
                    {index === professionalForm.positions.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAddPosition}
                        className="p-2 bg-upmaroon text-white rounded hover:bg-red-800 transition"
                        title="Add position"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                    {professionalForm.positions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(index)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        title="Remove position"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Licenses */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold mb-1">
                  License Name & Number:
                </label>
                {professionalForm.licenses.map((license, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={license}
                      onChange={(e) => handleLicenseChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-upmaroon focus:border-upmaroon"
                    />
                    {/* ADD/REMOVE LICENSE BUTTONS */}
                    {index === professionalForm.licenses.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAddLicense}
                        className="p-2 bg-upmaroon text-white rounded hover:bg-red-800 transition"
                        title="Add license"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                    {professionalForm.licenses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLicense(index)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        title="Remove license"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                {editingProfessionalId && (
                  <Button
                    type="button"
                    onClick={resetProfessionalForm}
                    className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="px-8 py-2 bg-upmaroon text-white rounded hover:bg-red-800 font-semibold"
                  variant="primary"
                >
                  {editingProfessionalId ? "Update Professional" : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Professionals List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">
          Professionals ({professionals.length})
        </h3>
        {loading && <p>Loading professionals...</p>}
        {!loading && professionals.length === 0 && <p className="text-gray-500">No professionals added yet.</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {professionals.map((prof) => (
            <div
              key={prof.id}
              className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm relative pt-12" // Increased padding for photo space
            >
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={() => handleEditProfessional(prof)}
                  className="p-1 bg-white rounded-full hover:bg-gray-100 shadow-md"
                  aria-label="Edit Professional"
                >
                  <Edit2 size={16} className="text-upmaroon" />
                </button>
                <button
                  onClick={() => handleDeleteProfessional(prof.id)}
                  className="p-1 bg-white rounded-full hover:bg-gray-100 shadow-md"
                  aria-label="Delete Professional"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
              
              {/* Photo */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-gray-200 shadow-lg">
                  {prof.photo ? (
                    <img
                      src={prof.photo}
                      alt={prof.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-2xl font-bold text-gray-600">
                      {prof.full_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Details */}
              <div className="pt-14 pb-4 px-3 text-center">
                <h4 className="font-bold text-sm leading-tight text-upmaroon">
                  {prof.full_name}, {prof.post_nominal}
                </h4>
                <div className="text-xs text-gray-600 space-y-1 mt-2">
                  {prof.positions?.map((pos, idx) => (
                    <p key={idx} className="leading-snug font-medium">{pos}</p>
                  ))}
                  {prof.licenses?.map((lic, idx) => (
                    <p key={idx} className="text-xs italic leading-snug">{lic}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPostersTab = () => (
    <div>
      <div className="border-l-4 border-upmaroon px-4 py-3 mb-6 bg-gray-50">
        <h2 className="text-xl font-bold text-upmaroon">
          {editingPosterId ? "EDIT POSTER" : "UPLOAD POSTER"}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Add or update posters for your homepage
        </p>
      </div>

      <form onSubmit={handleSubmitPoster}>
        <div className="bg-white p-6 rounded-lg mb-8 flex flex-col items-center shadow-sm border border-gray-200">
          <label className="w-full max-w-lg h-64 border border-gray-400 rounded-md flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:border-upmaroon transition">
            {posterPreview ? (
              <img
                src={posterPreview}
                alt="Poster Preview"
                className="w-full h-full object-contain p-2 rounded-md"
              />
            ) : (
              <>
                <Upload size={32} className="text-gray-500 mb-2" />
                <span className="text-sm text-gray-600 text-center px-4">
                  Drop or upload image here
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Supports jpg, png (Max 10MB)
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePosterChange}
              className="hidden"
            />
          </label>
          {posterPreview && (
            <button
              type="button"
              onClick={() => { setPosterPreview(null); setPosterFile(null); }}
              className="mt-2 text-xs text-red-600 hover:underline"
            >
              Remove Poster
            </button>
          )}

          <div className="flex gap-3 mt-6">
            {editingPosterId && (
              <Button
                type="button"
                onClick={resetPosterForm}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold"
                variant="secondary"
              >
                Cancel Edit
              </Button>
            )}
            <Button
              type="submit"
              className="px-8 py-2 bg-upmaroon text-white rounded hover:bg-red-800 font-semibold"
              variant="primary"
            >
              {editingPosterId ? "Update Poster" : "Submit"}
            </Button>
          </div>
        </div>
      </form>

      {/* Posters List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">Posters ({posters.length})</h3>
        {loading && <p>Loading posters...</p>}
        {!loading && posters.length === 0 && <p className="text-gray-500 pt-4">No posters uploaded yet.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md group"
            >
              <img
                src={poster.image}
                alt={`Poster ${poster.id}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditPoster(poster)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg"
                    aria-label="Edit Poster"
                  >
                    <Edit2 size={18} className="text-upmaroon" />
                  </button>
                  <button
                    onClick={() => handleDeletePoster(poster.id)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg"
                    aria-label="Delete Poster"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DefaultLayout>
      <div className="w-full min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex flex-col justify-center bg-upmaroon w-full h-60 text-white text-center">
            <h1 className="font-bold text-4xl -mt-10">
              SITE CONTENT DASHBOARD
            </h1>
            <p className="text-lg mt-2 px-4">
              Manage your website contents
            </p>
          </div>

        <div className="bg-white rounded-[15px] p-8 shadow-xl box-border w-11/12 lg:w-3/4 max-w-5xl mx-auto mb-[70px] -mt-12">
          
            <div className="flex border-b border-gray-300 mb-6">
              <button
                onClick={() => setActiveTab("professionals")}
                className={`px-6 py-3 font-semibold transition text-sm focus:outline-none ${
                  activeTab === "professionals"
                    ? "text-upmaroon border-b-2 border-upmaroon"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Professionals
              </button>
              <button
                onClick={() => setActiveTab("posters")}
                className={`px-6 py-3 font-semibold transition text-sm focus:outline-none ${
                  activeTab === "posters"
                    ? "text-upmaroon border-b-2 border-upmaroon"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Posters
              </button>
            </div>

            <div className="min-h-[500px]">
              {activeTab === "professionals" && renderProfessionalsTab()}
              {activeTab === "posters" && renderPostersTab()}
            </div>
          
        </div>
      </div>
    </DefaultLayout>
  );
};

export { SiteContentDashboard };