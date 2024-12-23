'use client';

import { useState } from 'react';

export default function Page({ note }) {
  const [generation, setGeneration] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <div
        onClick={async () => {
          setIsLoading(true);

          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
                prompt: `Format this following note properly, use simple HTML: ${note}`,
            }),
          }).then(response => {
            response.json().then(json => {
              setGeneration(json.text);
              setIsLoading(false);
            });
          });
        }}
      >
        Generate
      </div>

      {isLoading ? 'Loading...' : generation}
    </div>
  );
}