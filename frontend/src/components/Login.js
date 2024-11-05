// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                onLogin();
                navigate('/crud');
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Error de conexión. Inténtalo de nuevo.');
        }
    };

    const goToRegister = () => {
        navigate('/register');
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f0f4f8' }}>
            <div className="card p-4" style={{ width: '350px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <h2 className="text-center mb-4" style={{ color: '#333' }}>Iniciar Sesión</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Usuario</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Introduce tu usuario"
                            style={{ padding: '10px', borderRadius: '5px' }}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Introduce tu contraseña"
                            style={{ padding: '10px', borderRadius: '5px' }}
                        />
                    </div>

                    {error && <div className="alert alert-danger mt-2">{error}</div>}

                    <div className="d-grid gap-2 mt-3">
                        <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#4CAF50', border: 'none', borderRadius: '5px' }}>
                            Iniciar Sesión
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ backgroundColor: '#FF5722', border: 'none', borderRadius: '5px' }} onClick={goToRegister}>
                            Registrarse
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
