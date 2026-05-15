import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, Clock, Languages, Loader2, MapPin, PauseCircle, Save, Tags } from 'lucide-react';
import { API_BASE, authHeaders } from '../api/config';
import { locations } from '../data/dummyData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const languageOptions = ['Kannada', 'Hindi', 'English', 'Tamil', 'Telugu', 'Marathi'];
const serviceAreas = locations.filter(location => location !== 'All Locations');

const WorkerProfileEditor = () => {
  const { user } = useAuth();
  const toast = useToast();
  const worker = user?.worker || {};
  const workerId = user?.worker_id || worker?.id || user?.id;
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(worker.image || worker.image_url || '');
  const [form, setForm] = useState({
    bio: worker.bio || '',
    languages: worker.languages || [],
    specializations: Array.isArray(worker.specializations) ? worker.specializations.join(', ') : (worker.specializations || ''),
    serviceAreas: worker.service_areas || worker.serviceAreas || [],
    startTime: worker.start_time || '09:00',
    endTime: worker.end_time || '18:00',
    availability: worker.availability ?? true,
  });

  const specializationTags = useMemo(
    () => form.specializations.split(',').map(item => item.trim()).filter(Boolean),
    [form.specializations]
  );

  const toggleList = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(item => item !== value) : [...prev[field], value],
    }));
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!workerId) {
      toast.info('Worker profile is not linked to this account yet');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/workers/${workerId}/`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          bio: form.bio,
          languages: form.languages,
          specializations: specializationTags,
          service_areas: form.serviceAreas,
          working_hours: `${form.startTime} - ${form.endTime}`,
          start_time: form.startTime,
          end_time: form.endTime,
          availability: form.availability,
        }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.info(err.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Profile</h2>
          <p className="text-sm text-slate-500 mt-1">Tune how customers see your public partner profile.</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${form.availability ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {form.availability ? 'Available' : 'Taking a Break'}
        </span>
      </div>

      <div className="p-6 grid lg:grid-cols-[260px_1fr] gap-8">
        <div>
          <label className="block cursor-pointer">
            <div className="aspect-square rounded-2xl border border-gray-100 bg-slate-50 overflow-hidden flex items-center justify-center">
              {preview ? <img src={preview} alt="Profile preview" className="w-full h-full object-cover" /> : <Camera className="w-10 h-10 text-slate-300" />}
            </div>
            <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
            <span className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">
              <Camera className="w-4 h-4" />
              Upload Photo
            </span>
          </label>

          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, availability: !prev.availability }))}
            className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${form.availability ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}
          >
            {form.availability ? <CheckCircle2 className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
            {form.availability ? 'Available' : 'Taking a Break'}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Bio</label>
            <textarea
              rows="5"
              maxLength={500}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none text-sm"
              placeholder="Tell customers about your work style, experience, and strengths."
            />
            <p className="text-xs text-slate-400 text-right mt-1">{form.bio.length}/500</p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Languages className="w-4 h-4" /> Languages</p>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map(language => (
                <label key={language} className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${form.languages.includes(language) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200'}`}>
                  <input type="checkbox" className="sr-only" checked={form.languages.includes(language)} onChange={() => toggleList('languages', language)} />
                  {language}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2"><Tags className="w-4 h-4" /> Specializations</label>
            <input
              value={form.specializations}
              onChange={(e) => setForm({ ...form, specializations: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
              placeholder="e.g. Modular kitchen, Pipe repair, Wall finish"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {specializationTags.map(tag => <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">{tag}</span>)}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Service Areas</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {serviceAreas.map(area => (
                <label key={area} className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${form.serviceAreas.includes(area) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-gray-200'}`}>
                  <input type="checkbox" className="sr-only" checked={form.serviceAreas.includes(area)} onChange={() => toggleList('serviceAreas', area)} />
                  {area}
                </label>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm" />
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </div>
    </section>
  );
};

export default WorkerProfileEditor;
