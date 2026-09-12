import React from 'react';
import { Edit3 } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

interface InlineEditButtonProps {
  section: 'hero' | 'doctor' | 'contact' | 'announcement' | 'footer';
  label?: string;
  className?: string;
}

export const InlineEditButton: React.FC<InlineEditButtonProps> = ({
  section,
  label = 'Absatz bearbeiten',
  className = '',
}) => {
  const { isEditMode, openCmsModal } = useSiteContent();

  if (!isEditMode) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openCmsModal(section);
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-md transition-all transform hover:scale-105 cursor-pointer z-30 ${className}`}
      title={`Diesen Bereich (${label}) im CMS anpassen`}
    >
      <Edit3 className="w-3 h-3" />
      <span>{label}</span>
    </button>
  );
};
