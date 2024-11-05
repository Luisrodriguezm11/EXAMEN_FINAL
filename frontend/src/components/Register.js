// src/components/Register.js
import React, { useState } from 'react';

const Register = ({ onRegisterSuccess, onBackToLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage('Usuario registrado exitosamente');
            onRegisterSuccess();
        } else {
            setError(data.error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Registro</h1>
            <form onSubmit={handleRegister}>
                <div className="mb-3">
                    <label className="form-label">Usuario</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
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
                    />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                <button type="submit" className="btn btn-primary">Registrarse</button>

                {/* Botón para volver a la pantalla de inicio de sesión */}
                <button type="button" className="btn btn-secondary mt-3" onClick={onBackToLogin}>
                    Volver al Inicio de Sesión
                </button>
            </form>
        </div>
    );
};

export default Register;

