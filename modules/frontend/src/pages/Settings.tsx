import { useState, useEffect } from 'react';
import { IconUser, IconBuilding, IconCreditCard, IconBell, IconSun, IconMoon, IconTable } from '../components/icons';
import { useTheme } from '../providers/ThemeProvider';
import { toast } from 'react-hot-toast';
import { settingsService, UserSettings } from '../services/settingsService';
const settingsMenu = [
  {
    name: 'Profile',
    description: 'Update your personal information and preferences',
    icon: IconUser,
  },
  {
    name: 'Business',
    description: 'Manage your business details and services',
    icon: IconBuilding,
  },
  {
    name: 'Billing',
    description: 'View and update your payment methods',
    icon: IconCreditCard,
  },
  {
    name: 'Notifications',
    description: 'Configure how you receive updates',
    icon: IconBell,
  },
  {
    name: 'Appearance',
    description: 'Customize the look and feel of the application',
    icon: IconSun,
  },
  {
    name: 'Pagination',
    description: 'Configure table pagination settings',
    icon: IconTable,
  },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserSettings>({
    profile: { name: '', email: '' },
    business: { name: '', services: [] },
    notifications: { email: false, sms: false },
    appearance: { theme: 'light' },
    pagination: { rowsPerPage: 10 },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await settingsService.getUserSettings();
      setFormData(settings);

      // Handle appearance settings separately to sync with theme provider
      if (settings.appearance && settings.appearance.theme !== theme) {
        if (settings.appearance.theme === 'dark' && theme === 'light') {
          toggleTheme();
        } else if (settings.appearance.theme === 'light' && theme === 'dark') {
          toggleTheme();
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await settingsService.updateUserSettings(formData);

      // Update appearance separately if needed
      if (formData.appearance?.theme === 'dark' && theme === 'light') {
        toggleTheme();
      } else if (formData.appearance?.theme === 'light' && theme === 'dark') {
        toggleTheme();
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPaginationSettings = () => {
    if (isLoading) {
      return <div>Loading pagination settings...</div>;
    }

    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Table Pagination Settings</h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="rowsPerPage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Maximum Rows Per Page
            </label>
            <select
              id="rowsPerPage"
              name="rowsPerPage"
              value={formData.pagination?.rowsPerPage || 10}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  pagination: {
                    ...prev.pagination,
                    rowsPerPage: value
                  }
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={15}>15 rows</option>
              <option value={20}>20 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will determine how many rows are displayed per page in all tables across the application.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  };

  const renderProfileSettings = () => {
    if (isLoading) {
      return <div>Loading profile settings...</div>;
    }

    return (
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Profile Settings</h3>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.profile?.name || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile || { email: '' },
                    name: e.target.value
                  }
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.profile?.email || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile || { name: '' },
                    email: e.target.value
                  }
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
              placeholder="your@email.com"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderBusinessSettings = () => {
    if (isLoading) {
      return <div>Loading business settings...</div>;
    }

    return (
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Business Settings</h3>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Name
            </label>
            <input
              type="text"
              name="business-name"
              id="business-name"
              value={formData.business?.name || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  business: {
                    ...prev.business || { services: [] },
                    name: e.target.value
                  }
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
              placeholder="Your business name"
            />
          </div>
          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Services
            </label>
            <select
              id="services"
              name="services"
              multiple
              value={formData.business?.services || []}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  business: {
                    ...prev.business || { name: '' },
                    services: Array.from(e.target.selectedOptions, option => option.value)
                  }
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
            >
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Carpentry</option>
              <option>Painting</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationSettings = () => {
    if (isLoading) {
      return <div>Loading notification settings...</div>;
    }

    return (
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Notification Settings</h3>
        <div className="mt-5 space-y-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="email-notifications"
                name="email-notifications"
                type="checkbox"
                checked={formData.notifications?.email || false}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications || { sms: false },
                      email: e.target.checked
                    }
                  }));
                }}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="email-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                Email Notifications
              </label>
              <p className="text-gray-500 dark:text-gray-400">Receive email notifications for new jobs and updates.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="sms-notifications"
                name="sms-notifications"
                type="checkbox"
                checked={formData.notifications?.sms || false}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications || { email: false },
                      sms: e.target.checked
                    }
                  }));
                }}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="sms-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                SMS Notifications
              </label>
              <p className="text-gray-500 dark:text-gray-400">Receive SMS notifications for urgent matters.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppearanceSettings = () => {
    if (isLoading) {
      return <div>Loading appearance settings...</div>;
    }

    return (
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Appearance Settings</h3>
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose between light and dark mode.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                setFormData(prev => ({
                  ...prev,
                  appearance: {
                    ...prev.appearance,
                    theme: theme === 'light' ? 'dark' : 'light'
                  }
                }));
              }}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              role="switch"
              aria-checked={theme === 'dark'}
            >
              <span className="sr-only">Toggle theme</span>
              <span
                className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-700 shadow ring-0 transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                <span
                  className={`absolute inset-0 flex h-full w-full items-center justify-center rounded-full transition-opacity ${
                    theme === 'dark' ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                  }`}
                  aria-hidden="true"
                >
                  <IconSun className="h-3 w-3 text-gray-400" />
                </span>
                <span
                  className={`absolute inset-0 flex h-full w-full items-center justify-center rounded-full transition-opacity ${
                    theme === 'dark' ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                  }`}
                  aria-hidden="true"
                >
                  <IconMoon className="h-3 w-3 text-gray-400" />
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return renderProfileSettings();
      case 'Business':
        return renderBusinessSettings();
      case 'Appearance':
        return renderAppearanceSettings();
      case 'Notifications':
        return renderNotificationSettings();
      case 'Pagination':
        return renderPaginationSettings();
      default:
        return <div>Coming soon...</div>;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {settingsMenu.map((setting) => (
            <div
              key={setting.name}
              className={`relative rounded-lg border p-6 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 ${
                activeTab === setting.name ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-200'
              }`}
              onClick={() => setActiveTab(setting.name)}
            >
              <div>
                <span
                  className={`inline-flex rounded-lg p-3 ${
                    activeTab === setting.name ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  <setting.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{setting.name}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Settings Content */}
        <div className="mt-8">
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
            <div className="px-4 py-5 sm:p-6">
              {renderContent()}
            </div>
            <div className="bg-white dark:bg-gray-700 px-4 py-3 text-right sm:px-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
