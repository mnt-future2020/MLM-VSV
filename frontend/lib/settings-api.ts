import { axiosInstance } from './api';

export interface GeneralSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyDescription: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
}

export interface HeroSlide {
  headline: string;
  subHeadline: string;
  highlights: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  image: string;
}

export interface HeroSettings {
  heroBadge: string;
  heroSlides: HeroSlide[];
}

export interface AllSettings extends GeneralSettings, SeoSettings, HeroSettings {
  _id?: string;
  settingsId?: string;
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all settings (admin only)
export const getSettings = async () => {
  const response = await axiosInstance.get('/api/settings');
  return response.data;
};

// Get public settings (no auth required)
export const getPublicSettings = async () => {
  const response = await axiosInstance.get('/api/settings/public');
  return response.data;
};

// Update general settings
export const updateGeneralSettings = async (data: GeneralSettings) => {
  const response = await axiosInstance.put('/api/settings/general', data);
  return response.data;
};

// Update SEO settings
export const updateSeoSettings = async (data: SeoSettings) => {
  const response = await axiosInstance.put('/api/settings/seo', data);
  return response.data;
};

// Update hero settings
export const updateHeroSettings = async (data: HeroSettings) => {
  const response = await axiosInstance.put('/api/settings/hero', data);
  return response.data;
};

// Update all settings at once
export const updateAllSettings = async (data: Partial<AllSettings>) => {
  const response = await axiosInstance.put('/api/settings/all', data);
  return response.data;
};
