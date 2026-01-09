import React from 'react';
// import './PropertyForm.css'; //Styles migrated to Tailwind

const PropertyForm = ({
  formData,
  handleChange,
  handleImageChange,
  imagePreview,
  handleSubmit,
  loading,
  userType,
  showBhkType,
  editingProperty,
  disabled
}) => {
  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-semibold text-slate-700 ml-1">Property Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Luxury 3BHK Apartment"
            required
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="text-sm font-semibold text-slate-700 ml-1">Property Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
          >
            <option value="">Select type</option>
            <option value="Flat/Apartment">Flat/Apartment</option>
            <option value="Independent House/Villa">Independent House/Villa</option>
            <option value="Commercial Property">Commercial Property</option>
            <option value="Land">Land</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="location" className="text-sm font-semibold text-slate-700 ml-1">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Vadodara, Gujarat"
            required
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="price" className="text-sm font-semibold text-slate-700 ml-1">Price *</label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 50 L - 75 L"
            required
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
          />
        </div>
      </div>

      {/* Developer Specific Fields */}
      {userType === 'developer' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="companyName" className="text-sm font-semibold text-slate-700 ml-1">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g., ABC Developers"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="projectName" className="text-sm font-semibold text-slate-700 ml-1">Project Name *</label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="e.g., Green Valley Phase 2"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="totalUnits" className="text-sm font-semibold text-slate-700 ml-1">Total Units</label>
              <input
                type="number"
                id="totalUnits"
                name="totalUnits"
                value={formData.totalUnits}
                onChange={handleChange}
                placeholder="e.g., 120"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="completionDate" className="text-sm font-semibold text-slate-700 ml-1">Expected Completion</label>
              <input
                type="month"
                id="completionDate"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reraNumber" className="text-sm font-semibold text-slate-700 ml-1">RERA Registration Number</label>
            <input
              type="text"
              id="reraNumber"
              name="reraNumber"
              value={formData.reraNumber}
              onChange={handleChange}
              placeholder="e.g., PR/GJ/VADODARA/..."
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BHK Type - Only show for Flat/Apartment and Independent House/Villa */}
        {showBhkType && (
          <div className="flex flex-col gap-2">
            <label htmlFor="bhk" className="text-sm font-semibold text-slate-700 ml-1">BHK Type</label>
            <select
              id="bhk"
              name="bhk"
              value={formData.bhk}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
            >
              <option value="">Select BHK type</option>
              <option value="1 RK">1 RK</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="5 BHK">5 BHK</option>
              <option value="6+ BHK">6+ BHK</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="image" className="text-sm font-semibold text-slate-700 ml-1">Property Image</label>
           <div className="relative group">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 transition-colors cursor-pointer"
              />
           </div>
        </div>
      </div>

      {imagePreview && (
        <div className="w-full h-48 rounded-xl overflow-hidden shadow-md border border-slate-200">
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="facilities" className="text-sm font-semibold text-slate-700 ml-1">Facilities (comma-separated)</label>
        <input
          type="text"
          id="facilities"
          name="facilities"
          value={formData.facilities}
          onChange={handleChange}
          placeholder="e.g., Swimming Pool, Gym, Parking"
          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-semibold text-slate-700 ml-1">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your property..."
          rows="5"
          required
          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none resize-y min-h-[120px]"
        />
      </div>

      <button
        type="submit"
        disabled={loading || disabled}
        className="w-full bg-linear-to-r from-purple-700 to-fuchsia-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.99] hover:shadow-purple-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {editingProperty ? 'Updating Property...' : 'Posting Property...'}
          </span>
        ) : (
          editingProperty ? 'Update Property' : 'Post Property'
        )}
      </button>
    </form>
  );
};

export default PropertyForm;
