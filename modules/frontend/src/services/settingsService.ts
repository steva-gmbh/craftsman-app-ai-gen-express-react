import { api } from './api';

export interface UserSettings {
  appearance?: {
    theme: 'light' | 'dark';
  };
  pagination?: {
    rowsPerPage: number;
  };
  profile?: {
    name: string;
    email: string;
  };
  business?: {
    name: string;
    services: string[];
  };
  notifications?: {
    email: boolean;
    sms: boolean;
  };
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  appearance: {
    theme: 'light',
  },
  pagination: {
    rowsPerPage: 10,
  },
  profile: {
    name: '',
    email: '',
  },
  business: {
    name: '',
    services: [],
  },
  notifications: {
    email: false,
    sms: false,
  },
};

export const settingsService = {
  /**
   * Get current user's settings
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      // Get the current user's ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      if (!userId) {
        return DEFAULT_SETTINGS;
      }

      const settings = await api.getUserSettings(userId);
      
      // Parse each section and merge with defaults
      const parsedSettings = {
        appearance: settings.appearance ? JSON.parse(settings.appearance) : DEFAULT_SETTINGS.appearance,
        pagination: settings.pagination ? JSON.parse(settings.pagination) : DEFAULT_SETTINGS.pagination,
        profile: settings.profile ? JSON.parse(settings.profile) : DEFAULT_SETTINGS.profile,
        business: settings.business ? JSON.parse(settings.business) : DEFAULT_SETTINGS.business,
        notifications: settings.notifications ? JSON.parse(settings.notifications) : DEFAULT_SETTINGS.notifications,
      };

      return parsedSettings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update user settings
   */
  async updateUserSettings(settings: UserSettings): Promise<UserSettings> {
    try {
      // Get the current user's ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      if (!userId) {
        throw new Error('No user ID found');
      }

      // Convert sections to JSON strings
      const formattedSettings = {
        appearance: settings.appearance ? JSON.stringify(settings.appearance) : null,
        pagination: settings.pagination ? JSON.stringify(settings.pagination) : null,
        profile: settings.profile ? JSON.stringify(settings.profile) : null,
        business: settings.business ? JSON.stringify(settings.business) : null,
        notifications: settings.notifications ? JSON.stringify(settings.notifications) : null,
      };

      await api.updateUserSettings(userId, formattedSettings);
      return settings;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  /**
   * Get the number of rows per page from settings
   */
  async getRowsPerPage(): Promise<number> {
    try {
      const settings = await this.getUserSettings();
      return settings.pagination?.rowsPerPage || 10;
    } catch (error) {
      console.error('Error getting rows per page:', error);
      return 10;
    }
  },

  /**
   * Update the number of rows per page
   */
  async updateRowsPerPage(rowsPerPage: number): Promise<void> {
    try {
      const settings = await this.getUserSettings();
      const updatedSettings = {
        ...settings,
        pagination: {
          ...settings.pagination,
          rowsPerPage,
        },
      };
      await this.updateUserSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating rows per page:', error);
      throw error;
    }
  }
}; 