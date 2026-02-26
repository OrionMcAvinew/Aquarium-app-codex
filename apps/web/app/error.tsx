'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong.</h2>
      <button className="rounded bg-cyan-600 px-3 py-1" onClick={() => reset()}>
        Retry
      </button>
    </div>
  );
}
