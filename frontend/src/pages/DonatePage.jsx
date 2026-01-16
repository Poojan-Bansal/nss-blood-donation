import React from 'react';
import Donate from '../components/Donate';

export default function DonatePage({ token }) {
  return (
    <div className="app-wrap">
      <div className="card">
        <h2 className="h2">Donate</h2>
        <Donate token={token} />
      </div>
    </div>
  );
}
