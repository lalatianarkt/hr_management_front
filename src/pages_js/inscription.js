try {
  const response = await axios.post('http://localhost:8080/api/users', newUser);
  setMessage('Inscription réussie ! Un email de confirmation a été envoyé.');
  // Reset du formulaire
  setEmail('');
  setPassword('');
  setSelectedTypeUser('');
  setMatricule('');
} catch (error) {
  console.error(error);
  setMessage('Erreur lors de l\'inscription.');
}
