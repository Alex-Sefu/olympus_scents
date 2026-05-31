-- Run this SQL in Supabase Dashboard → SQL Editor to insert test data

INSERT INTO parfumuri (nume_parfum, brand, creator, tip_parfum, note_varf, note_baza, pret, stoc, anul_lansarii)
VALUES
  ('Phantom', 'Rabanne', 'Quentin Bisch', 'Eau de Toilette', 'Lavandă, Lămâie, Bergamotă', 'Vetiver, Lemn de santal, Muschi', 520.00, 45, 2021),
  ('1 Million', 'Rabanne', 'Christophe Raynaud', 'Eau de Toilette', 'Grepfrut, Mentă, Sânge de portocală', 'Lemn de santal, Patchouli, Piele', 510.00, 30, 2008),
  ('Asad Bourbon', 'Lattafa', 'Lattafa Perfumes', 'Eau de Parfum', 'Bergamotă, Petale de trandafir', 'Oud, Ambră, Vanilie', 150.00, 60, 2022),
  ('Khamrah Qawha', 'Lattafa', 'Lattafa Perfumes', 'Eau de Parfum', 'Cafea, Cardamom, Scorțișoară', 'Oud, Vanilie, Mosc', 180.00, 25, 2023),
  ('French Riviera', 'Mancera', 'Pierre Montale', 'Eau de Parfum', 'Bergamotă, Neroli, Petale de trandafir', 'Mosc alb, Cedru, Ambră', 890.00, 15, 2018),
  ('Le Male EDT', 'Jean Paul Gaultier', 'Francis Kurkdjian', 'Eau de Toilette', 'Mentă, Lavandă, Bergamotă', 'Vanilie, Mosc, Lemn de santal', 400.00, 40, 1995),
  ('Stronger with You', 'Armani', 'Dominique Ropion', 'Eau de Toilette', 'Cardamom, Salvie, Fenicul', 'Vanilie, Chihlimbar, Mosc', 450.00, 20, 2017),
  ('Myself', 'Yves Saint Laurent', 'Dominique Ropion', 'Eau de Parfum', 'Lavandă, Ghimbir, Zedoar', 'Cashmeran, Mosc, Patchouli', 500.00, 18, 2021);

SELECT COUNT(*) as "Total parfumuri" FROM parfumuri;
