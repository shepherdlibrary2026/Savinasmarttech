import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Download,
  Search,
  CheckCircle,
  FileText,
  Sparkles,
  ExternalLink,
  Award,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface LibraryResource {
  id: string;
  title: string;
  category: 'moe_syllabus' | 'wassce_past_papers' | 'liberian_literature' | 'stem_agriculture' | 'k3_early_reading';
  gradeLevel: string;
  authorOrSource: string;
  fileFormat: string;
  sizeKb: number;
  description: string;
  isDownloaded: boolean;
}

const INITIAL_RESOURCES: LibraryResource[] = [
  {
    id: 'res_01',
    title: 'Republic of Liberia National Curriculum Syllabus (Grades 1-12)',
    category: 'moe_syllabus',
    gradeLevel: 'Grade 1 - 12 (Comprehensive)',
    authorOrSource: 'Ministry of Education, Republic of Liberia (Monrovia)',
    fileFormat: 'PDF (Low Data Compression)',
    sizeKb: 480,
    description: 'Official national syllabus for Mathematics, Sciences, Social Studies, English, and Agriculture approved for Liberian basic & secondary schools.',
    isDownloaded: true,
  },
  {
    id: 'res_02',
    title: 'WAEC / WASSCE Core Mathematics 10-Year Question Bank (2015 - 2025)',
    category: 'wassce_past_papers',
    gradeLevel: 'Senior High (Grade 10-12)',
    authorOrSource: 'West African Examinations Council (WAEC Liberia Office)',
    fileFormat: 'Interactive PDF + Step-by-Step Solutions',
    sizeKb: 620,
    description: 'Full compilation of Paper 1 (Objective) and Paper 2 (Theory) with detailed marking schemes and Chief Examiner comments.',
    isDownloaded: false,
  },
  {
    id: 'res_03',
    title: 'Murder in the Cassava Patch (Literature Study Guide)',
    category: 'liberian_literature',
    gradeLevel: 'Grade 9 - 12',
    authorOrSource: 'Bai T. Moore (Adapted by Savina Academic Team)',
    fileFormat: 'Audio Book Notes + Chapter Analysis',
    sizeKb: 340,
    description: 'Literary analysis, character profiles of Gbe and Tene, thematic exploration of tradition vs. modernity in Liberian society.',
    isDownloaded: true,
  },
  {
    id: 'res_04',
    title: 'Liberian Civics, Governance & County Geography Handout',
    category: 'stem_agriculture',
    gradeLevel: 'Grade 7 - 12',
    authorOrSource: 'Center for National Educational Documents',
    fileFormat: 'Illustrated PDF Notes',
    sizeKb: 290,
    description: 'The 1847 Declaration of Independence, the 1986 Constitution, 15 Counties profiles, natural resources, and executive governance structures.',
    isDownloaded: false,
  },
  {
    id: 'res_05',
    title: 'Modern Agronomy: Cassava, Rubber, Oil Palm & Rice Farming in Liberia',
    category: 'stem_agriculture',
    gradeLevel: 'Senior High (Agricultural Science)',
    authorOrSource: 'Central Agricultural Research Institute (CARI - Suakoko, Bong County)',
    fileFormat: 'Practical Agronomy Field Guide',
    sizeKb: 410,
    description: 'Soil management, pest control (Cassava Mosaic Virus), rubber tapping techniques, and lowland rice irrigation best practices.',
    isDownloaded: false,
  },
  {
    id: 'res_06',
    title: 'Kpelle, Bassa, and English Illustrated Early Phonics Storybook',
    category: 'k3_early_reading',
    gradeLevel: 'Kindergarten & Early Primary (K1 - Grade 2)',
    authorOrSource: 'Savina Early Childhood Collaborative',
    fileFormat: 'Color Picture Reader + Audio Pronunciations',
    sizeKb: 220,
    description: 'Phonetic storybook with vibrant illustrations introducing everyday animals, family words, and community life in Liberia.',
    isDownloaded: true,
  },
];

export const MoELibraryPortal: React.FC = () => {
  const [resources, setResources] = useState<LibraryResource[]>(INITIAL_RESOURCES);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const toggleDownload = (id: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newStatus = !r.isDownloaded;
          if (newStatus) {
            setDownloadSuccessToast(`"${r.title}" cached to offline storage!`);
            setTimeout(() => setDownloadSuccessToast(null), 3000);
          }
          return { ...r, isDownloaded: newStatus };
        }
        return r;
      })
    );
  };

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.authorOrSource.toLowerCase().includes(search.toLowerCase()) ||
      r.gradeLevel.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'all' || r.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* MoE Library Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-800/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              National Digital Resource Bank
            </span>
            <span className="text-xs text-slate-300">
              Liberia MoE & WAEC Aligned
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">
            Digital Curriculum & Textbook Library
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Download textbooks, WAEC past questions, and audio storybooks for zero-data offline reading.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-amber-400 font-bold">
            {resources.filter((r) => r.isDownloaded).length} of {resources.length} Downloaded
          </div>
          <div className="text-[10px] text-slate-400">Offline Access Ready</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search syllabus, WAEC past papers, books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              activeCategory === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Resources
          </button>
          <button
            onClick={() => setActiveCategory('wassce_past_papers')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              activeCategory === 'wassce_past_papers'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            WAEC / WASSCE
          </button>
          <button
            onClick={() => setActiveCategory('moe_syllabus')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              activeCategory === 'moe_syllabus'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            MoE Syllabi
          </button>
          <button
            onClick={() => setActiveCategory('liberian_literature')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              activeCategory === 'liberian_literature'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Literature
          </button>
        </div>
      </div>

      {downloadSuccessToast && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  {item.gradeLevel}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.sizeKb} KB
                </span>
              </div>

              <h3 className="font-bold text-white text-sm mt-2 leading-snug">{item.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Source: {item.authorOrSource}</p>
              <p className="text-xs text-slate-300 mt-2 line-clamp-3">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{item.fileFormat}</span>
              <button
                onClick={() => toggleDownload(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  item.isDownloaded
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                {item.isDownloaded ? 'Cached Offline' : 'Save Offline'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
