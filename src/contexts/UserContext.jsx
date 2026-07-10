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

  const value = {
    user, authLoading,
    gender, setGender,
    split, setSplit,
    cycleLength, setCycleLength,
    defaultLocation, setDefaultLocation,
    age, setAge,
    heightCm, setHeightCm,
    weightKg, setWeightKg,
    signIn, signInEmail, signUpEmail, signOut
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
