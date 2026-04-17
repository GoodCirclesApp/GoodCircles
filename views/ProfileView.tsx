import React, { useState } from 'react';
import NonprofitSelector from '../components/NonprofitSelector';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onUpdate: (updated: Partial<User>) => Promise<any>;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  discountMode: 'PRICE_REDUCTION' | 'PLATFORM_CREDITS';
}

export function ProfileView({ user, onUpdate }: ProfileViewProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    discountMode: (user?.discountMode as 'PRICE_REDUCTION' | 'PLATFORM_CREDITS') || 'PRICE_REDUCTION',
  });

  const [selectedNonprofit, setSelectedNonprofit] = useState<string | null>(
    user?.electedNonprofitId || null
  );
  const [showNonprofitSelector, setShowNonprofitSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const handleNonprofitSelect = async (nonprofitId: string) => {
    setSelectedNonprofit(nonprofitId);
    setShowNonprofitSelector(false);
    setSuccessMessage('');

    try {
      setIsLoading(true);
      await onUpdate({
        electedNonprofitId: nonprofitId,
      });
      setSuccessMessage('Nonprofit selection updated successfully!');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to update nonprofit selection'
      );
      setSelectedNonprofit(user?.electedNonprofitId || null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsLoading(true);
      await onUpdate({
        ...formData,
        electedNonprofitId: selectedNonprofit || undefined,
      });
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {errorMessage}
        </div>
      )}

      {showNonprofitSelector ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Your Cause</h2>
          <NonprofitSelector
            currentNonprofitId={selectedNonprofit || undefined}
            onSelect={handleNonprofitSelect}
            isLoading={isLoading}
          />
          <button
            onClick={() => setShowNonprofitSelector(false)}
            className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Discount Preference Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Discount Preference</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="discountMode"
                  value="PRICE_REDUCTION"
                  checked={formData.discountMode === 'PRICE_REDUCTION'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-gray-700">Price Reduction</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="discountMode"
                  value="PLATFORM_CREDITS"
                  checked={formData.discountMode === 'PLATFORM_CREDITS'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-gray-700">Platform Credits</span>
              </label>
            </div>
          </div>

          {/* Nonprofit Selection Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Your Cause</h2>
            <p className="text-gray-600 mb-4">
              {selectedNonprofit
                ? '10% of your savings will support your elected nonprofit'
                : 'Select a nonprofit to support with your purchases'}
            </p>
            <button
              type="button"
              onClick={() => setShowNonprofitSelector(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {selectedNonprofit ? 'Change Cause →' : 'Select a Cause →'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}
    </div>
  );
}
