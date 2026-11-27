import { useEdgeBack } from '../hooks/useEdgeBack.js';

export default function SessionAppSurface({ onBack, children }) {
  const ref = useEdgeBack(onBack);
  return <div ref={ref} className="w-full min-h-dvh">{children}</div>;
}
