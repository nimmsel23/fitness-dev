import { createContext, useContext, useState, useEffect } from 'react';
import { watchAuth, signIn, signInEmail, signUpEmail, signOut, getUserProfile } from '@db';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // User Stammdaten
  const [gender, setGender] = useState(() => localStorage.getItem('fitness-gender') || 'male');
  const [split, setSplit] = useState(() => localStorage.getItem('fitness-split') || 'PPL');
  const [cycleLength, setCycleLength] = useState(() => parseInt(localStorage.getItem('fitness-cycleLength') || '4', 10));
  const [defaultLocation, setDefaultLocation] = useState(() => localStorage.getItem('fitness-defaultLocation') || 'Home');

  // Körperprofil Daten
  const [age, setAge] = useState(() => parseInt(localStorage.getItem('fitness-age') || '30', 10));
  const [heightCm, setHeightCm] = useState(() => parseInt(localStorage.getItem('fitness-heightCm') || '180', 10));
  const [weightKg, setWeightKg] = useState(() => parseFloat(localStorage.getItem('fitness-weightKg') || '75.0'));

  // Trainingsanamnese (aktueller Stand, kein Verlauf)
  const [trainingExperience, setTrainingExperience] = useState(() => localStorage.getItem('fitness-trainingExperience') || '');
  const [trainingFrequency, setTrainingFrequency] = useState(() => localStorage.getItem('fitness-trainingFrequency') || '');
  const [trainingType, setTrainingType] = useState(() => localStorage.getItem('fitness-trainingType') || '');
  const [activityLevel, setActivityLevel] = useState(() => localStorage.getItem('fitness-activityLevel') || '');
  const [fitnessGoal, setFitnessGoal] = useState(() => localStorage.getItem('fitness-fitnessGoal') || '');
  const [secondaryGoal, setSecondaryGoal] = useState(() => localStorage.getItem('fitness-secondaryGoal') || '');
  const [energyLevel, setEnergyLevel] = useState(() => localStorage.getItem('fitness-energyLevel') || '');
  const [recoveryQuality, setRecoveryQuality] = useState(() => localStorage.getItem('fitness-recoveryQuality') || '');
  const [painNotes, setPainNotes] = useState(() => localStorage.getItem('fitness-painNotes') || '');
  const [mobilityNotes, setMobilityNotes] = useState(() => localStorage.getItem('fitness-mobilityNotes') || '');
  const [chronicConditions, setChronicConditions] = useState(() => localStorage.getItem('fitness-chronicConditions') || '');
  const [injuries, setInjuries] = useState(() => localStorage.getItem('fitness-injuries') || '');
  const [medications, setMedications] = useState(() => localStorage.getItem('fitness-medications') || '');
  const [medicalClearanceNotes, setMedicalClearanceNotes] = useState(() => localStorage.getItem('fitness-medicalClearanceNotes') || '');
  const [trainingWorking, setTrainingWorking] = useState(() => localStorage.getItem('fitness-trainingWorking') || '');
  const [trainingNotWorking, setTrainingNotWorking] = useState(() => localStorage.getItem('fitness-trainingNotWorking') || '');

  // Auth Listener
  useEffect(() => watchAuth((u) => {
    setUser(u);
    setAuthLoading(false);
  }), []);

  // Firebase Hydration (Holt die Daten aus der Cloud, wenn eingeloggt)
  useEffect(() => {
    async function fetchProfile() {
      if (!user || !user.uid) return;
      try {
        const data = await getUserProfile(user.uid);
        if (data) {
          if (data.gender) setGender(data.gender);
          if (data.split) setSplit(data.split);
          if (data.cycleLength) setCycleLength(data.cycleLength);
          if (data.defaultLocation) setDefaultLocation(data.defaultLocation);
          if (data.age) setAge(data.age);
          if (data.heightCm) setHeightCm(data.heightCm);
          if (data.weightKg) setWeightKg(data.weightKg);
          if (data.trainingExperience) setTrainingExperience(data.trainingExperience);
          if (data.trainingFrequency) setTrainingFrequency(data.trainingFrequency);
          if (data.trainingType) setTrainingType(data.trainingType);
          if (data.activityLevel) setActivityLevel(data.activityLevel);
          if (data.fitnessGoal) setFitnessGoal(data.fitnessGoal);
          if (data.secondaryGoal) setSecondaryGoal(data.secondaryGoal);
          if (data.energyLevel) setEnergyLevel(data.energyLevel);
          if (data.recoveryQuality) setRecoveryQuality(data.recoveryQuality);
          if (data.painNotes) setPainNotes(data.painNotes);
          if (data.mobilityNotes) setMobilityNotes(data.mobilityNotes);
          if (data.chronicConditions) setChronicConditions(data.chronicConditions);
          if (data.injuries) setInjuries(data.injuries);
          if (data.medications) setMedications(data.medications);
          if (data.medicalClearanceNotes) setMedicalClearanceNotes(data.medicalClearanceNotes);
          if (data.trainingWorking) setTrainingWorking(data.trainingWorking);
          if (data.trainingNotWorking) setTrainingNotWorking(data.trainingNotWorking);
        }
      } catch (err) {
        console.error("Fehler bei Hydration:", err);
      }
    }
    fetchProfile();
  }, [user]);

  // Lokale Persistenz (Fallback)
  useEffect(() => { localStorage.setItem('fitness-gender', gender) }, [gender]);
  useEffect(() => { localStorage.setItem('fitness-split', split) }, [split]);
  useEffect(() => { localStorage.setItem('fitness-cycleLength', cycleLength) }, [cycleLength]);
  useEffect(() => { localStorage.setItem('fitness-defaultLocation', defaultLocation) }, [defaultLocation]);
  useEffect(() => { localStorage.setItem('fitness-age', age) }, [age]);
  useEffect(() => { localStorage.setItem('fitness-heightCm', heightCm) }, [heightCm]);
  useEffect(() => { localStorage.setItem('fitness-weightKg', weightKg) }, [weightKg]);
  useEffect(() => { localStorage.setItem('fitness-trainingExperience', trainingExperience) }, [trainingExperience]);
  useEffect(() => { localStorage.setItem('fitness-trainingFrequency', trainingFrequency) }, [trainingFrequency]);
  useEffect(() => { localStorage.setItem('fitness-trainingType', trainingType) }, [trainingType]);
  useEffect(() => { localStorage.setItem('fitness-activityLevel', activityLevel) }, [activityLevel]);
  useEffect(() => { localStorage.setItem('fitness-fitnessGoal', fitnessGoal) }, [fitnessGoal]);
  useEffect(() => { localStorage.setItem('fitness-secondaryGoal', secondaryGoal) }, [secondaryGoal]);
  useEffect(() => { localStorage.setItem('fitness-energyLevel', energyLevel) }, [energyLevel]);
  useEffect(() => { localStorage.setItem('fitness-recoveryQuality', recoveryQuality) }, [recoveryQuality]);
  useEffect(() => { localStorage.setItem('fitness-painNotes', painNotes) }, [painNotes]);
  useEffect(() => { localStorage.setItem('fitness-mobilityNotes', mobilityNotes) }, [mobilityNotes]);
  useEffect(() => { localStorage.setItem('fitness-chronicConditions', chronicConditions) }, [chronicConditions]);
  useEffect(() => { localStorage.setItem('fitness-injuries', injuries) }, [injuries]);
  useEffect(() => { localStorage.setItem('fitness-medications', medications) }, [medications]);
  useEffect(() => { localStorage.setItem('fitness-medicalClearanceNotes', medicalClearanceNotes) }, [medicalClearanceNotes]);
  useEffect(() => { localStorage.setItem('fitness-trainingWorking', trainingWorking) }, [trainingWorking]);
  useEffect(() => { localStorage.setItem('fitness-trainingNotWorking', trainingNotWorking) }, [trainingNotWorking]);

  const value = {
    user, authLoading,
    gender, setGender,
    split, setSplit,
    cycleLength, setCycleLength,
    defaultLocation, setDefaultLocation,
    age, setAge,
    heightCm, setHeightCm,
    weightKg, setWeightKg,
    trainingExperience, setTrainingExperience,
    trainingFrequency, setTrainingFrequency,
    trainingType, setTrainingType,
    activityLevel, setActivityLevel,
    fitnessGoal, setFitnessGoal,
    secondaryGoal, setSecondaryGoal,
    energyLevel, setEnergyLevel,
    recoveryQuality, setRecoveryQuality,
    painNotes, setPainNotes,
    mobilityNotes, setMobilityNotes,
    chronicConditions, setChronicConditions,
    injuries, setInjuries,
    medications, setMedications,
    medicalClearanceNotes, setMedicalClearanceNotes,
    trainingWorking, setTrainingWorking,
    trainingNotWorking, setTrainingNotWorking,
    signIn, signInEmail, signUpEmail, signOut
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
