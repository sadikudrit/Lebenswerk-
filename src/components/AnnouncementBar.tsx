import React from 'react';
import { Megaphone, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

export const AnnouncementBar: React.FC = () => {
  const { content } = useSiteContent();

  if (!content.announcement || !content.announcement.enabled || !content.announcement.text) {
    return null;
  }

  return (
    <div className="bg-[#1B5E20] text-white px-4 py-2 text-xs border-b border-[#A5D6A7]/30 shadow-xs relative z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 text-center">
        {content.announcement.badge && (
          <span className="px-2 py-0.5 rounded-full bg-[#66BB6A] text-[#1B5E20] font-extrabold text-[10px] uppercase tracking-wider">
            {content.announcement.badge}
          </span>
        )}
        <span className="font-medium text-white/95">
          {content.announcement.text}
        </span>
        {content.announcement.linkText && (
          <a
            href={content.announcement.linkHref || '#booking'}
            className="inline-flex items-center gap-1 font-bold text-[#A5D6A7] hover:text-white underline underline-offset-2 ml-1"
          >
            <span>{content.announcement.linkText}</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
