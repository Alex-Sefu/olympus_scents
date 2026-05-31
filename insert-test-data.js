import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testPerfumes = [
  {
    nume_parfum: 'Phantom',
    brand: 'Rabanne',
    creator: 'Quentin Bisch',
    tip_parfum: 'Eau de Toilette',
    note_varf: 'Lavandă, Lămâie, Bergamotă',
    note_baza: 'Vetiver, Lemn de santal, Muschi',
    pret: 520.00,
    stoc: 45,
    anul_lansarii: 2021
  },
  {
    nume_parfum: '1 Million',
    brand: 'Rabanne',
    creator: 'Christophe Raynaud',
    tip_parfum: 'Eau de Toilette',
    note_varf: 'Grepfrut, Mentă, Sânge de portocală',
    note_baza: 'Lemn de santal, Patchouli, Piele',
    pret: 510.00,
    stoc: 30,
    anul_lansarii: 2008
  },
  {
    nume_parfum: 'Asad Bourbon',
    brand: 'Lattafa',
    creator: 'Lattafa Perfumes',
    tip_parfum: 'Eau de Parfum',
    note_varf: 'Bergamotă, Petale de trandafir',
    note_baza: 'Oud, Ambră, Vanilie',
    pret: 150.00,
    stoc: 60,
    anul_lansarii: 2022
  },
  {
    nume_parfum: 'Khamrah Qawha',
    brand: 'Lattafa',
    creator: 'Lattafa Perfumes',
    tip_parfum: 'Eau de Parfum',
    note_varf: 'Cafea, Cardamom, Scorțișoară',
    note_baza: 'Oud, Vanilie, Mosc',
    pret: 180.00,
    stoc: 25,
    anul_lansarii: 2023
  },
  {
    nume_parfum: 'French Riviera',
    brand: 'Mancera',
    creator: 'Pierre Montale',
    tip_parfum: 'Eau de Parfum',
    note_varf: 'Bergamotă, Neroli, Petale de trandafir',
    note_baza: 'Mosc alb, Cedru, Ambră',
    pret: 890.00,
    stoc: 15,
    anul_lansarii: 2018
  },
  {
    nume_parfum: 'Le Male EDT',
    brand: 'Jean Paul Gaultier',
    creator: 'Francis Kurkdjian',
    tip_parfum: 'Eau de Toilette',
    note_varf: 'Mentă, Lavandă, Bergamotă',
    note_baza: 'Vanilie, Mosc, Lemn de santal',
    pret: 400.00,
    stoc: 40,
    anul_lansarii: 1995
  },
  {
    nume_parfum: 'Stronger with You',
    brand: 'Armani',
    creator: 'Dominique Ropion',
    tip_parfum: 'Eau de Toilette',
    note_varf: 'Cardamom, Salvie, Fenicul',
    note_baza: 'Vanilie, Chihlimbar, Mosc',
    pret: 450.00,
    stoc: 20,
    anul_lansarii: 2017
  },
  {
    nume_parfum: 'Myself',
    brand: 'Yves Saint Laurent',
    creator: 'Dominique Ropion',
    tip_parfum: 'Eau de Parfum',
    note_varf: 'Lavandă, Ghimbir, Zedoar',
    note_baza: 'Cashmeran, Mosc, Patchouli',
    pret: 500.00,
    stoc: 18,
    anul_lansarii: 2021
  }
];

async function insertData() {
  console.log('Inserting test perfumes...');
  const { data, error } = await supabase
    .from('parfumuri')
    .insert(testPerfumes);
  
  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log(`✓ Successfully inserted ${testPerfumes.length} perfumes`);
  }
}

insertData();
