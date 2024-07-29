import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      setMessage('Login successful!');
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      setMessage('Login failed: ' + error.response.data.error);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className={styles.inputGroup}>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className={styles.button} type="submit">Login</button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default Login;