import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const ConfirmationEmail = () => {
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Récupère le token depuis l'URL

  const handleConfirm = async () => {
    if (!token) {
      setMessage('Token manquant ou invalide.');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8080/api/users/confirm`, { token });
      setMessage(response.data.message || 'Confirmation réussie !');
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de la confirmation du compte.');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem', textAlign: 'center' }}>
      <h2>Confirmation de votre compte</h2>
      {message && <p>{message}</p>}
      {!message && <button onClick={handleConfirm}>Confirmer mon compte</button>}
    </div>
  );
};

export default ConfirmationEmail;
