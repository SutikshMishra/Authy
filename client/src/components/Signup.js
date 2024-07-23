import React, { useState } from 'react';
import axios from 'axios';
import styles from './Signup.module.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', { username, email, phoneNumber, password });
      setMessage('Signup successful!');
    } catch (error) {
      setMessage('Signup failed: ' + error.response.data.error);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSignup}>
        <h2>Signup</h2>
        <div className={styles.inputGroup}>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label>Phone Number:</label>
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className={styles.button} type="submit">Signup</button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default Signup;
