import DetailedMuscleMap from "../../components/DetailedMuscleMap.jsx";

export default function MuscleDetailedMap({ exercises, gender, onGroupClick }) {
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
  
  function handlePress(part) {
    if (onGroupClick) onGroupClick(part.slug);
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
       <DetailedMuscleMap 
          exercises={exercises} 
          gender={gender} 
          colors={colors}
          onGroupClick={handlePress}
        />
    </div>
  );
}
