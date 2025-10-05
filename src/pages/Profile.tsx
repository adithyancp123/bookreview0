import React, { useState } from 'react';
import { User, Mail, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export function Profile() {
  const { user, profile, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    const { error } = await updateProfile(formData);

    if (error) {
      setError(error.message || 'Failed to update profile');
    } else {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    }

    setIsUpdating(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-gray-900 dark:to-gray-800 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary-600" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white dark:text-gray-100">
                  {profile?.full_name || 'Your Profile'}
                </h1>
                <p className="text-primary-100 dark:text-primary-200 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{profile?.email}</span>
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                    placeholder="Tell us a bit about yourself and your reading interests..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">
                    {profile?.bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Member Since</h3>
                  <p className="text-gray-700">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}