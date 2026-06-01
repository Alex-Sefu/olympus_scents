import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Parfum } from '../types';
import { COLLECTIONS } from '../data/collections';
import { usePageTitle } from '../hooks/usePageTitle';
import { sanitizeForm } from '../lib/sanitize';
import './AddEditPerfume.css';

const TIP_OPTIONS = ['Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Eau Fraîche'];

interface FormData {
  nume_parfum: string;
  brand: string;
  creator: string;
  tip_parfum: string;
  note_varf: string;
  note_baza: string;
  pret: string;
  stoc: string;
  anul_lansarii: string;
  colectie: string;
}

const EMPTY_FORM: FormData = {
  nume_parfum: '', brand: '', creator: '', tip_parfum: '',
  note_varf: '', note_baza: '', pret: '', stoc: '', anul_lansarii: '',
  colectie: '',
};

export default function AddEditPerfume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEditor } = useAuth();
  const isEditMode = Boolean(id);
  usePageTitle(isEditMode ? 'Editează Parfum' : 'Adaugă Parfum Nou');

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not editor
  useEffect(() => {
    if (!isEditor) navigate('/');
  }, [isEditor, navigate]);

  // Fetch perfume in edit mode
  useEffect(() => {
    if (!isEditMode || !id) return;
    async function fetchParfum() {
      const { data, error } = await supabase
        .from('parfumuri')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        navigate('/editor/dashboard');
        return;
      }

      const p = data as Parfum;
      setForm({
        nume_parfum: p.nume_parfum ?? '',
        brand: p.brand ?? '',
        creator: p.creator ?? '',
        tip_parfum: p.tip_parfum ?? '',
        note_varf: p.note_varf ?? '',
        note_baza: p.note_baza ?? '',
        pret: p.pret?.toString() ?? '',
        stoc: p.stoc?.toString() ?? '',
        anul_lansarii: p.anul_lansarii?.toString() ?? '',
        colectie: p.colectie ?? '',
      });
      if (p.image_url) {
        setExistingImageUrl(p.image_url);
        setImagePreview(p.image_url);
      }
      setFetchLoading(false);
    }
    fetchParfum();
  }, [id, isEditMode, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Fișierul trebuie să fie o imagine (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Imaginea nu poate depăși 5MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMsg(null);
  }

  function validate(): boolean {
    const newErrors: Partial<FormData> = {};
    if (!form.nume_parfum.trim()) newErrors.nume_parfum = 'Câmp obligatoriu';
    if (!form.brand.trim()) newErrors.brand = 'Câmp obligatoriu';
    if (!form.pret || isNaN(Number(form.pret)) || Number(form.pret) < 0) newErrors.pret = 'Preț valid obligatoriu';
    if (!form.stoc || isNaN(Number(form.stoc)) || Number(form.stoc) < 0) newErrors.stoc = 'Stoc valid obligatoriu';
    if (isEditMode && !imagePreview && !existingImageUrl) newErrors.nume_parfum = 'Imaginea este obligatorie';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function uploadImage(parfumId: string): Promise<string | null> {
    if (!imageFile) return existingImageUrl;

    const ext = imageFile.name.split('.').pop();
    const path = `${parfumId}.${ext}`;

    // Delete old image if exists
    if (existingImageUrl) {
      const oldPath = existingImageUrl.split('/parfumuri-images/')[1];
      if (oldPath) await supabase.storage.from('parfumuri-images').remove([oldPath]);
    }

    const { error } = await supabase.storage
      .from('parfumuri-images')
      .upload(path, imageFile, { upsert: true });

    if (error) {
      setErrorMsg('Eroare la upload imagine: ' + error.message);
      return null;
    }

    const { data } = supabase.storage.from('parfumuri-images').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg(null);

    const cleanForm = sanitizeForm(form) as FormData;
    const payload = {
      nume_parfum: cleanForm.nume_parfum.trim(),
      brand: cleanForm.brand.trim(),
      creator: cleanForm.creator.trim() || null,
      tip_parfum: cleanForm.tip_parfum || null,
      note_varf: cleanForm.note_varf.trim() || null,
      note_baza: cleanForm.note_baza.trim() || null,
      pret: Number(cleanForm.pret),
      stoc: Number(cleanForm.stoc),
      anul_lansarii: cleanForm.anul_lansarii ? Number(cleanForm.anul_lansarii) : null,
      created_by: user?.id,
      colectie: cleanForm.colectie || null,
    };

    if (isEditMode && id) {
      // UPDATE
      const imageUrl = await uploadImage(id);
      const { error } = await supabase
        .from('parfumuri')
        .update({ ...payload, image_url: imageUrl || undefined })
        .eq('id', id);

      if (error) {
        setErrorMsg('Eroare la salvare: ' + error.message);
        setLoading(false);
        return;
      }
      setSuccessMsg('Parfumul a fost actualizat cu succes!');
      setTimeout(() => navigate('/editor/dashboard'), 1500);
    } else {
      // INSERT
      const { data, error } = await supabase
        .from('parfumuri')
        .insert([payload])
        .select('id')
        .single();

      if (error || !data) {
        setErrorMsg('Eroare la creare: ' + error?.message);
        setLoading(false);
        return;
      }

      const imageUrl = await uploadImage(data.id);
      if (imageUrl) {
        await supabase.from('parfumuri').update({ image_url: imageUrl }).eq('id', data.id);
      }

      setSuccessMsg('Parfumul a fost adăugat cu succes!');
      setTimeout(() => navigate('/editor/dashboard'), 1500);
    }

    setLoading(false);
  }

  if (fetchLoading) {
    return (
      <div className="aep-loading">
        <div className="aep-spinner"></div>
      </div>
    );
  }

  return (
    <div className="aep-page">
      <div className="aep-header">
        <button className="btn-primary aep-back" onClick={() => navigate('/editor/dashboard')}>
          ← Dashboard editor
        </button>
        <div>
          <h1 className="aep-title">{isEditMode ? 'Editează parfum' : 'Adaugă parfum nou'}</h1>
          <p className="aep-subtitle">
            {isEditMode ? 'Modifică informațiile parfumului selectat.' : 'Completează câmpurile obligatorii marcate cu *.'}
          </p>
        </div>
      </div>

      {successMsg && <div className="aep-alert aep-alert--success">{successMsg}</div>}
      {errorMsg && <div className="aep-alert aep-alert--error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="aep-card">
        {/* Section 1 — Basic info */}
        <div className="aep-section">
          <h3 className="aep-section-title">Informații de bază</h3>
          <div className="aep-grid aep-grid--2">
            <div className="aep-field">
              <label className="aep-label">
                Nume parfum <span className="aep-req">*</span>
              </label>
              <input
                type="text"
                name="nume_parfum"
                value={form.nume_parfum}
                onChange={handleChange}
                className={`aep-input ${errors.nume_parfum ? 'aep-input--error' : ''}`}
                placeholder="ex. Phantom"
              />
              {errors.nume_parfum && <p className="aep-error-msg">{errors.nume_parfum}</p>}
            </div>

            <div className="aep-field">
              <label className="aep-label">
                Brand <span className="aep-req">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className={`aep-input ${errors.brand ? 'aep-input--error' : ''}`}
                placeholder="ex. Rabanne"
              />
              {errors.brand && <p className="aep-error-msg">{errors.brand}</p>}
            </div>

            <div className="aep-field">
              <label className="aep-label">Creator</label>
              <input
                type="text"
                name="creator"
                value={form.creator}
                onChange={handleChange}
                className="aep-input"
                placeholder="ex. Quentin Bisch"
              />
            </div>

            <div className="aep-field">
              <label className="aep-label">Tip parfum</label>
              <select name="tip_parfum" value={form.tip_parfum} onChange={handleChange} className="aep-input">
                <option value="">Selectează tipul</option>
                {TIP_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="aep-field">
              <label className="aep-label">Colecție / Zeu</label>
              <select name="colectie" value={form.colectie} onChange={handleChange} className="aep-input">
                <option value="">Fără colecție</option>
                {COLLECTIONS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.season} — {c.god}
                  </option>
                ))}
              </select>
            </div>

            <div className="aep-field">
              <label className="aep-label">An lansare</label>
              <input
                type="number"
                name="anul_lansarii"
                value={form.anul_lansarii}
                onChange={handleChange}
                className="aep-input"
                placeholder="ex. 2021"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </div>

        {/* Section 2 — Price & stock */}
        <div className="aep-section">
          <h3 className="aep-section-title">Preț și disponibilitate</h3>
          <div className="aep-grid aep-grid--2">
            <div className="aep-field">
              <label className="aep-label">
                Preț (RON) <span className="aep-req">*</span>
              </label>
              <input
                type="number"
                name="pret"
                value={form.pret}
                onChange={handleChange}
                className={`aep-input ${errors.pret ? 'aep-input--error' : ''}`}
                placeholder="ex. 520"
                step="0.01"
                min="0"
              />
              {errors.pret && <p className="aep-error-msg">{errors.pret}</p>}
            </div>

            <div className="aep-field">
              <label className="aep-label">
                Stoc (bucăți) <span className="aep-req">*</span>
              </label>
              <input
                type="number"
                name="stoc"
                value={form.stoc}
                onChange={handleChange}
                className={`aep-input ${errors.stoc ? 'aep-input--error' : ''}`}
                placeholder="ex. 45"
                min="0"
              />
              {errors.stoc && <p className="aep-error-msg">{errors.stoc}</p>}
            </div>
          </div>
        </div>

        {/* Section 3 — Olfactory notes */}
        <div className="aep-section">
          <h3 className="aep-section-title">Note olfactive</h3>
          <p className="aep-section-hint">Introdu notele separate prin virgulă: ex. Lavandă, Lămâie, Bergamotă</p>
          <div className="aep-grid aep-grid--1">
            <div className="aep-field">
              <label className="aep-label">Note de vârf</label>
              <textarea
                name="note_varf"
                value={form.note_varf}
                onChange={handleChange}
                className="aep-input"
                placeholder="Introdu notele separate prin virgulă"
                rows={2}
              />
              {form.note_varf && (
                <div className="aep-pills-preview">
                  {form.note_varf
                    .split(',')
                    .map((n) => n.trim())
                    .filter(Boolean)
                    .map((n) => (
                      <span key={n} className="aep-pill aep-pill--varf">
                        {n}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="aep-field">
              <label className="aep-label">Note de bază</label>
              <textarea
                name="note_baza"
                value={form.note_baza}
                onChange={handleChange}
                className="aep-input"
                placeholder="Introdu notele separate prin virgulă"
                rows={2}
              />
              {form.note_baza && (
                <div className="aep-pills-preview">
                  {form.note_baza
                    .split(',')
                    .map((n) => n.trim())
                    .filter(Boolean)
                    .map((n) => (
                      <span key={n} className="aep-pill aep-pill--baza">
                        {n}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4 — Image */}
        <div className="aep-section">
          <h3 className="aep-section-title">Imagine produs</h3>
          <div className="aep-image-row">
            <div
              className="aep-upload"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const ev = { target: { files: [file] } } as any;
                  handleImageChange(ev);
                }
              }}
            >
              <div className="aep-upload-icon">☁</div>
              <p className="aep-upload-text">Trage imaginea aici sau</p>
              <p className="aep-upload-link">Click pentru a selecta (max 5MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            {imagePreview && (
              <div className="aep-image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="btn-danger aep-image-remove"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setExistingImageUrl(null);
                  }}
                >
                  Elimină imaginea
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="aep-footer">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/editor/dashboard')}
            disabled={loading}
          >
            Anulează
          </button>
          <button
            type="submit"
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Se salvează...' : isEditMode ? 'Actualizează parfumul' : 'Salvează parfumul'}
          </button>
        </div>
      </form>
    </div>
  );
}
