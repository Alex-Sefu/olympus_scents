export interface Collection {
  id: 'artemis' | 'poseidon' | 'dionysos' | 'zeus';
  god: string;
  season: string;
  emoji: string;
  tagline: string;
  description: string;
  vibe: string;
  color_from: string;
  color_to: string;
  color_accent: string;
  text_color: string;
  parfumuri: string[];
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'artemis',
    god: 'Artemis',
    season: 'Primăvara',
    emoji: '🌸',
    tagline: 'Prospețime modernă și curată',
    description: 'Parfumuri aerate, curate, cu o ușoară dulceață florală sau fructată — perfecte pentru când natura revine la viață.',
    vibe: 'Floral · Fructat · Aerian · Modern',
    color_from: '#F0FDF4',
    color_to: '#DCFCE7',
    color_accent: '#16A34A',
    text_color: '#14532D',
    parfumuri: ['YSL Myself', 'Lattafa Pride Art of Arabia 1', 'Jean Paul Gaultier Le Male EDT'],
  },
  {
    id: 'poseidon',
    god: 'Poseidon',
    season: 'Vara',
    emoji: '☀️',
    tagline: 'Energie acvatică, tropicală și exotică',
    description: 'Parfumuri fresh care emană vibrații de vacanță, fructe exotice și briză de vară — energia pură a mărilor lui Poseidon.',
    vibe: 'Acvatic · Tropical · Fresh · Exotic',
    color_from: '#EFF6FF',
    color_to: '#DBEAFE',
    color_accent: '#1D4ED8',
    text_color: '#1E3A6E',
    parfumuri: ['Jean Paul Gaultier Le Beau Paradise Garden', 'Xerjoff Erba Pura', 'Lattafa Opulent Dubai'],
  },
  {
    id: 'dionysos',
    god: 'Dionysos',
    season: 'Toamna',
    emoji: '🍁',
    tagline: 'Dulceață boemă, mirodenii și licori',
    description: 'Parfumuri gurmande cu note de miere, cafea, scorțișoară și piele întoarsă — energia zeului vinului în toată splendoarea ei.',
    vibe: 'Gurmanд · Mirodenii · Cald · Boem',
    color_from: '#FFF7ED',
    color_to: '#FED7AA',
    color_accent: '#C2410C',
    text_color: '#7C2D12',
    parfumuri: ['Emporio Armani Stronger With You Intensely', 'Lattafa Teriaq', 'Phantom (Paco Rabanne)', 'Lattafa Asad Bourbon'],
  },
  {
    id: 'zeus',
    god: 'Zeus',
    season: 'Iarna',
    emoji: '❄️',
    tagline: 'Autoritate, opulență arabă și putere regală',
    description: 'Parfumuri grele, întunecate, opulente și regale — forța de a străpunge gerul și o aură de lider absolut.',
    vibe: 'Opulent · Lemnos · Regal · Intens',
    color_from: '#F8FAFC',
    color_to: '#E2E8F0',
    color_accent: '#1E3A6E',
    text_color: '#0F172A',
    parfumuri: ['Boss Bottled Absolu', 'Jean Paul Gaultier Le Male Elixir', 'Lattafa Khamrah Qahwa', 'One Million (Paco Rabanne)'],
  },
];
