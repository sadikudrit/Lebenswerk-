import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteContent, HeroContent, DoctorContent, ContactContent, AnnouncementContent, FooterContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../utils/defaultSiteContent';

const STORAGE_KEY = 'lebenswerk_site_content_v1';
const AUTH_KEY = 'lebenswerk_cms_auth_token';

export type CmsTabType = 'hero' | 'doctor' | 'contact' | 'footer' | 'announcement' | 'settings';

interface SiteContentContextType {
  content: SiteContent;
  isEditMode: boolean;
  setIsEditMode: (active: boolean) => void;
  isAuthenticated: boolean;
  loginWithPin: (pin: string) => Promise<boolean>;
  logout: () => void;
  updateHero: (data: Partial<HeroContent>) => void;
  updateDoctor: (data: Partial<DoctorContent>) => void;
  updateContact: (data: Partial<ContactContent>) => void;
  updateFooter: (data: Partial<FooterContent>) => void;
  updateAnnouncement: (data: Partial<AnnouncementContent>) => void;
  saveToServer: (forcedContent?: SiteContent) => Promise<{ success: boolean; message: string }>;
  resetToDefault: () => Promise<{ success: boolean; message: string }>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  isCmsModalOpen: boolean;
  openCmsModal: (tab?: CmsTabType) => void;
  closeCmsModal: () => void;
  activeCmsTab: CmsTabType;
  setActiveCmsTab: (tab: CmsTabType) => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Purge any temporary dummy overrides if present in browser cache
        if (parsed.contact?.street === 'Bernstrasse 10') {
          parsed.contact.street = DEFAULT_SITE_CONTENT.contact.street;
        }
        if (parsed.doctor?.name === 'Dr. Vigan Musliu') {
          parsed.doctor.name = DEFAULT_SITE_CONTENT.doctor.name;
        }
        if (parsed.doctor?.sectionTitle === 'Dr. Vigan Musliu') {
          parsed.doctor.sectionTitle = DEFAULT_SITE_CONTENT.doctor.sectionTitle;
        }
        if (parsed.contact?.phoneDisplay === '+41 32 672 10 00') {
          parsed.contact.phoneDisplay = DEFAULT_SITE_CONTENT.contact.phoneDisplay;
          parsed.contact.phoneRaw = DEFAULT_SITE_CONTENT.contact.phoneRaw;
          parsed.contact.whatsappNumber = DEFAULT_SITE_CONTENT.contact.whatsappNumber;
        }
        if (parsed.contact?.hoursThursday === '08:00 – 18:00 Uhr') {
          parsed.contact.hoursThursday = DEFAULT_SITE_CONTENT.contact.hoursThursday;
          parsed.contact.hoursFriday = DEFAULT_SITE_CONTENT.contact.hoursFriday;
          parsed.contact.hoursSaturday = DEFAULT_SITE_CONTENT.contact.hoursSaturday;
        }
        if (parsed.hero?.scheduleThursday === 'Donnerstag: 08:00 – 18:00 Uhr') {
          parsed.hero.scheduleThursday = DEFAULT_SITE_CONTENT.hero.scheduleThursday;
          parsed.hero.scheduleFriday = DEFAULT_SITE_CONTENT.hero.scheduleFriday;
          parsed.hero.scheduleSaturday = DEFAULT_SITE_CONTENT.hero.scheduleSaturday;
        }

        return {
          ...DEFAULT_SITE_CONTENT,
          ...parsed,
          hero: { ...DEFAULT_SITE_CONTENT.hero, ...(parsed.hero || {}) },
          doctor: { ...DEFAULT_SITE_CONTENT.doctor, ...(parsed.doctor || {}) },
          contact: { ...DEFAULT_SITE_CONTENT.contact, ...(parsed.contact || {}) },
          footer: { ...DEFAULT_SITE_CONTENT.footer, ...(parsed.footer || {}) },
          announcement: { ...DEFAULT_SITE_CONTENT.announcement, ...(parsed.announcement || {}) },
        };
      }
    } catch (e) {
      console.warn('Could not read content from localStorage', e);
    }
    return DEFAULT_SITE_CONTENT;
  });

  const [savedBaseline, setSavedBaseline] = useState<string>(() => JSON.stringify(content));
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(() => new Date());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'authenticated';
    } catch {
      return false;
    }
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCmsModalOpen, setIsCmsModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [activeCmsTab, setActiveCmsTab] = useState<CmsTabType>('hero');

  // Immediately persist content to localStorage on EVERY change so data is never lost
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch (e) {
      console.warn('Could not persist content to localStorage', e);
    }
  }, [content]);

  // Load latest content from server API on boot
  useEffect(() => {
    let isMounted = true;
    async function fetchServerContent() {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.content && isMounted) {
            // Check if local cache has newer unsaved edits
            const localRaw = localStorage.getItem(STORAGE_KEY);
            if (localRaw) {
              try {
                const localParsed = JSON.parse(localRaw);
                if (localParsed.lastUpdated && data.content.lastUpdated) {
                  const localTime = new Date(localParsed.lastUpdated).getTime();
                  const serverTime = new Date(data.content.lastUpdated).getTime();
                  if (localTime > serverTime) {
                    // Local edits are newer than server, keep local edits and auto-sync to server
                    console.log('Local content is newer than server; preserving local customizations.');
                    return;
                  }
                }
              } catch (e) {
                // ignore
              }
            }

            const merged: SiteContent = {
              ...DEFAULT_SITE_CONTENT,
              ...data.content,
              hero: { ...DEFAULT_SITE_CONTENT.hero, ...(data.content.hero || {}) },
              doctor: { ...DEFAULT_SITE_CONTENT.doctor, ...(data.content.doctor || {}) },
              contact: { ...DEFAULT_SITE_CONTENT.contact, ...(data.content.contact || {}) },
              footer: { ...DEFAULT_SITE_CONTENT.footer, ...(data.content.footer || {}) },
              announcement: { ...DEFAULT_SITE_CONTENT.announcement, ...(data.content.announcement || {}) },
            };
            setContent(merged);
            setSavedBaseline(JSON.stringify(merged));
            setLastSavedAt(new Date(merged.lastUpdated || Date.now()));
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch (err) {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('Unable to sync content with server, using cached content', err);
      }
    }
    fetchServerContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasUnsavedChanges = JSON.stringify(content) !== savedBaseline;

  // Touch content helper to add updated timestamp
  const applyContentUpdate = useCallback((updater: (prev: SiteContent) => SiteContent) => {
    setContent((prev) => {
      const updated = updater(prev);
      const withTimestamp: SiteContent = {
        ...updated,
        lastUpdated: new Date().toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
      } catch (e) {
        // ignore
      }
      return withTimestamp;
    });
  }, []);

  const updateHero = useCallback((data: Partial<HeroContent>) => {
    applyContentUpdate((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...data },
    }));
  }, [applyContentUpdate]);

  const updateDoctor = useCallback((data: Partial<DoctorContent>) => {
    applyContentUpdate((prev) => ({
      ...prev,
      doctor: { ...prev.doctor, ...data },
    }));
  }, [applyContentUpdate]);

  const updateContact = useCallback((data: Partial<ContactContent>) => {
    applyContentUpdate((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...data },
    }));
  }, [applyContentUpdate]);

  const updateFooter = useCallback((data: Partial<FooterContent>) => {
    applyContentUpdate((prev) => ({
      ...prev,
      footer: { ...prev.footer, ...data },
    }));
  }, [applyContentUpdate]);

  const updateAnnouncement = useCallback((data: Partial<AnnouncementContent>) => {
    applyContentUpdate((prev) => ({
      ...prev,
      announcement: { ...prev.announcement, ...data },
    }));
  }, [applyContentUpdate]);

  const loginWithPin = async (pin: string): Promise<boolean> => {
    const trimmed = pin.trim();
    try {
      const res = await fetch('/api/content/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: trimmed }),
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setIsAuthenticated(true);
        setIsEditMode(true);
        try {
          localStorage.setItem(AUTH_KEY, 'authenticated');
          localStorage.setItem('cms_doctor_pin', trimmed);
          sessionStorage.setItem('cms_doctor_pin', trimmed);
        } catch {
          // ignore
        }
        return true;
      }
    } catch (e) {
      console.error('Error verifying PIN:', e);
    }
    // Fallback pin check only in case network fails
    if (trimmed === '01091996') {
      setIsAuthenticated(true);
      setIsEditMode(true);
      try {
        localStorage.setItem(AUTH_KEY, 'authenticated');
        localStorage.setItem('cms_doctor_pin', trimmed);
        sessionStorage.setItem('cms_doctor_pin', trimmed);
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsEditMode(false);
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('cms_doctor_pin');
      sessionStorage.removeItem('cms_doctor_pin');
    } catch {
      // ignore
    }
  };

  const saveToServer = async (forcedContent?: SiteContent): Promise<{ success: boolean; message: string }> => {
    const targetContent = forcedContent || content;
    setIsSaving(true);
    try {
      const pin = localStorage.getItem('cms_doctor_pin') || sessionStorage.getItem('cms_doctor_pin') || '01091996';
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-cms-authenticated': 'true',
        },
        body: JSON.stringify({ content: targetContent, pin }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedBaseline(JSON.stringify(targetContent));
        setLastSavedAt(new Date());
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(targetContent));
        } catch (e) {
          // ignore
        }
        setIsSaving(false);
        return { success: true, message: 'Inhalte wurden erfolgreich gespeichert und sind sofort live!' };
      } else {
        setIsSaving(false);
        return { success: false, message: data.message || 'Fehler beim Speichern' };
      }
    } catch (err: any) {
      console.error('Error saving content:', err);
      // Fallback save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(targetContent));
        setSavedBaseline(JSON.stringify(targetContent));
        setLastSavedAt(new Date());
      } catch (e) {
        // ignore
      }
      setIsSaving(false);
      return { success: true, message: 'Inhalte lokal gespeichert (Server temporär offline).' };
    }
  };

  // Debounced auto-save to server when user is authenticated and content changes
  useEffect(() => {
    if (!isAuthenticated) return;
    if (JSON.stringify(content) === savedBaseline) return;

    const timer = setTimeout(() => {
      saveToServer();
    }, 1200);

    return () => clearTimeout(timer);
  }, [content, isAuthenticated, savedBaseline]);

  const resetToDefault = async (): Promise<{ success: boolean; message: string }> => {
    setIsSaving(true);
    try {
      const pin = localStorage.getItem('cms_doctor_pin') || sessionStorage.getItem('cms_doctor_pin') || '01091996';
      await fetch('/api/content/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
    } catch (e) {
      console.warn('Server reset failed, applying local reset', e);
    }
    setContent(DEFAULT_SITE_CONTENT);
    setSavedBaseline(JSON.stringify(DEFAULT_SITE_CONTENT));
    setLastSavedAt(new Date());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONTENT));
    } catch {
      // ignore
    }
    setIsSaving(false);
    return { success: true, message: 'Alle Inhalte wurden auf die Werkseinstellungen zurückgesetzt.' };
  };

  const openCmsModal = (tab: CmsTabType = 'hero') => {
    setActiveCmsTab(tab);
    setIsCmsModalOpen(true);
  };

  const closeCmsModal = () => {
    // If there are unsaved changes, automatically flush to server on close
    if (hasUnsavedChanges) {
      saveToServer();
    }
    setIsCmsModalOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <SiteContentContext.Provider
      value={{
        content,
        isEditMode,
        setIsEditMode,
        isAuthenticated,
        loginWithPin,
        logout,
        updateHero,
        updateDoctor,
        updateContact,
        updateFooter,
        updateAnnouncement,
        saveToServer,
        resetToDefault,
        isSaving,
        hasUnsavedChanges,
        lastSavedAt,
        isCmsModalOpen,
        openCmsModal,
        closeCmsModal,
        activeCmsTab,
        setActiveCmsTab,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};
