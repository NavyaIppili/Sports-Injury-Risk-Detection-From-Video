import { useState } from 'react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './AthleteProfilePage.module.css';

const genderOptions = [
  { value: '', label: 'Select gender', disabled: true },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' },
];

const initialFormState = {
  fullName: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  sport: '',
  playingPosition: '',
  trainingLoad: '',
  previousInjuries: '',
};

export default function AthleteProfilePage({ profileSaved, onSaveProfile, onResetProfile, onCompleteProfile }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [localStatus, setLocalStatus] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setLocalStatus('Form reset locally.');
    onResetProfile();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!formData.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!formData.age.trim()) nextErrors.age = 'Age is required.';
    if (!formData.gender.trim()) nextErrors.gender = 'Gender is required.';
    if (!formData.height.trim()) nextErrors.height = 'Height is required.';
    if (!formData.weight.trim()) nextErrors.weight = 'Weight is required.';
    if (!formData.sport.trim()) nextErrors.sport = 'Sport is required.';
    if (!formData.playingPosition.trim()) nextErrors.playingPosition = 'Playing position is required.';
    if (!formData.trainingLoad.trim()) nextErrors.trainingLoad = 'Training load is required.';
    if (!formData.previousInjuries.trim()) nextErrors.previousInjuries = 'Previous injury history is required.';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setLocalStatus('');
      return;
    }

    setLocalStatus('Profile saved locally. Redirecting to the dashboard.');
    onSaveProfile();
    if (onCompleteProfile) {
      onCompleteProfile();
    }
  };

  return (
    <div className={styles.layout}>
      <section className={styles.content}>
        <div className={styles.headerCard}>
          <div>
            <p className={styles.sectionLabel}>Athlete Profile</p>
            <h2>Complete the athlete details before future injury analysis.</h2>
          </div>
          {profileSaved ? <span className={styles.savedBadge}>Saved locally</span> : null}
        </div>

        <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
          <div className={styles.actionsTop}>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset Form
            </Button>
          </div>

          <div className={styles.formGrid}>
            <Input id="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" error={errors.fullName} />
            <Input id="age" label="Age" type="number" value={formData.age} onChange={handleChange} placeholder="Enter age" error={errors.age} />
            <Input id="gender" label="Gender" as="select" value={formData.gender} onChange={handleChange} error={errors.gender} options={genderOptions} />
            <Input id="height" label="Height" value={formData.height} onChange={handleChange} placeholder="e.g. 178 cm" error={errors.height} />
            <Input id="weight" label="Weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 72 kg" error={errors.weight} />
            <Input id="sport" label="Sport" value={formData.sport} onChange={handleChange} placeholder="e.g. Football" error={errors.sport} />
            <Input id="playingPosition" label="Playing Position" value={formData.playingPosition} onChange={handleChange} placeholder="e.g. Defender" error={errors.playingPosition} />
            <Input id="trainingLoad" label="Weekly Training Load" value={formData.trainingLoad} onChange={handleChange} placeholder="e.g. Medium" error={errors.trainingLoad} />
            
            <label className={styles.field} htmlFor="previousInjuries" style={{ gridColumn: 'span 2' }}>
              <span className={styles.label}>Previous Injury History</span>
              <textarea
                id="previousInjuries"
                name="previousInjuries"
                className={`${styles.textarea} ${errors.previousInjuries ? styles.inputError : ''}`}
                value={formData.previousInjuries}
                onChange={handleChange}
                placeholder="Describe any past injuries or rehabilitation history"
                aria-invalid={Boolean(errors.previousInjuries)}
                aria-describedby={errors.previousInjuries ? 'previousInjuries-error' : undefined}
              />
              {errors.previousInjuries ? (
                <span className={styles.error} id="previousInjuries-error">
                  {errors.previousInjuries}
                </span>
              ) : null}
            </label>
          </div>

          {/* This container handles positioning the button right below the grid */}
          <div className={styles.actionsBottom} style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              className={styles.primaryAction}
              style={{ 
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)', 
                color: '#ffffff', 
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                padding: '0.75rem 2rem'
              }}
            >
              Submit Profile
            </Button>
          </div>

          {localStatus ? <p className={styles.status} style={{ marginTop: '1rem', textAlign: 'right' }}>{localStatus}</p> : null}
        </form>
      </section>
    </div>
  );
}