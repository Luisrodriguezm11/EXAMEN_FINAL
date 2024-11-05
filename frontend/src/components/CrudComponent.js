// src/components/CrudComponent.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PaymentModal from './PaymentModal';
import './CrudComponent.css';

const CrudComponent = () => {
    const [proyectos, setProyectos] = useState([]);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [completada, setCompletada] = useState(false);
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [prioridad, setPrioridad] = useState('media');
    const [asignadoA, setAsignadoA] = useState('');
    const [categoria, setCategoria] = useState('');
    const [costoProyecto, setCostoProyecto] = useState('');
    const [pagado, setPagado] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario
    const [showPaymentModal, setShowPaymentModal] = useState(false); // Estado para controlar el modal de pago
    const [projectCost, setProjectCost] = useState(0); // Costo del proyecto seleccionado para pago

    const fetchProyectos = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:3000/api/proyectos', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProyectos(response.data);
        } catch (error) {
            console.error('Error fetching proyectos:', error);
        }
    };

    useEffect(() => {
        fetchProyectos();
    }, []);

    const handleShowForm = () => {
        setShowForm(true);
    };

    const handleHideForm = () => {
        setShowForm(false);
        setTitulo('');
        setDescripcion('');
        setCompletada(false);
        setFechaVencimiento('');
        setPrioridad('media');
        setAsignadoA('');
        setCategoria('');
        setCostoProyecto('');
        setPagado(false);
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
    
        const proyectoData = {
            titulo,
            descripcion,
            completada,
            fecha_vencimiento: fechaVencimiento,
            prioridad,
            asignado_a: asignadoA,
            categoria,
            costo_proyecto: parseFloat(costoProyecto),
            pagado,
        };
    
        try {
            if (editId) {
                await axios.put(`http://localhost:3000/api/proyectos/${editId}`, 
                    proyectoData, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEditId(null);
            } else {
                await axios.post('http://localhost:3000/api/proyectos', 
                    proyectoData, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            
            fetchProyectos();
            handleHideForm();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.error('Token inválido o no autorizado');
                localStorage.removeItem('token'); // Limpia el token
                window.location.href = '/login'; // Redirige a inicio de sesión
            } else {
                console.error('Error submitting proyecto:', error);
            }
        }
    };

    const handleEdit = (proyecto) => {
        setTitulo(proyecto.titulo);
        setDescripcion(proyecto.descripcion);
        setCompletada(proyecto.completada);
        setFechaVencimiento(proyecto.fecha_vencimiento);
        setPrioridad(proyecto.prioridad);
        setAsignadoA(proyecto.asignado_a);
        setCategoria(proyecto.categoria);
        setCostoProyecto(proyecto.costo_proyecto);
        setPagado(proyecto.pagado);
        setEditId(proyecto.id);
        setShowForm(true); // Mostrar el formulario al editar
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3000/api/proyectos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProyectos();
        } catch (error) {
            console.error('Error deleting proyecto:', error);
        }
    };

    const handleShowPaymentModal = (cost) => {
        setProjectCost(cost);
        setShowPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Gestión de Proyectos</h2>
            
            {!showForm ? (
                <button onClick={handleShowForm} className="btn btn-primary mb-4">
                    Agregar Proyecto
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Título"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value={asignadoA}
                                onChange={(e) => setAsignadoA(e.target.value)}
                                placeholder="Asignado a"
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción"
                        />
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label>Fecha de Vencimiento</label>
                            <input
                                type="date"
                                className="form-control"
                                value={fechaVencimiento}
                                onChange={(e) => setFechaVencimiento(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label>Prioridad</label>
                            <select
                                className="form-select"
                                value={prioridad}
                                onChange={(e) => setPrioridad(e.target.value)}
                            >
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                placeholder="Categoría"
                            />
                        </div>
                        <div className="col-md-6">
                            <input
                                type="number"
                                className="form-control"
                                value={costoProyecto}
                                onChange={(e) => setCostoProyecto(e.target.value)}
                                placeholder="Costo del Proyecto"
                            />
                        </div>
                    </div>
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={completada}
                            onChange={(e) => setCompletada(e.target.checked)}
                        />
                        <label className="form-check-label">Completada</label>
                    </div>
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={pagado}
                            onChange={(e) => setPagado(e.target.checked)}
                        />
                        <label className="form-check-label">Pagado</label>
                    </div>
                    <div className="d-flex">
                        <button type="submit" className="btn btn-primary w-100 me-2">
                            {editId ? 'Actualizar' : 'Agregar'}
                        </button>
                        <button type="button" onClick={handleHideForm} className="btn btn-secondary">
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            <ul className="list-group">
                {proyectos.map(proyecto => (
                    <li key={proyecto.id} className="list-group-item d-flex justify-content-between align-items-start">
                        <div>
                            <h5>{proyecto.titulo}</h5>
                            <p>{proyecto.descripcion}</p>
                            <p><strong>Completada:</strong> {proyecto.completada ? 'Sí' : 'No'}</p>
                            <p><strong>Fecha de Vencimiento:</strong> {proyecto.fecha_vencimiento}</p>
                            <p><strong>Prioridad:</strong> {proyecto.prioridad}</p>
                            <p><strong>Asignado a:</strong> {proyecto.asignado_a}</p>
                            <p><strong>Categoría:</strong> {proyecto.categoria}</p>
                            <p><strong>Costo del Proyecto:</strong> ${proyecto.costo_proyecto}</p>
                            <p><strong>Pagado:</strong> {proyecto.pagado ? 'Sí' : 'No'}</p>
                        </div>
                        <div>
                            <button onClick={() => handleEdit(proyecto)} className="btn btn-warning btn-sm me-2">Editar</button>
                            <button onClick={() => handleDelete(proyecto.id)} className="btn btn-danger btn-sm me-2">Eliminar</button>
                            <button onClick={() => handleShowPaymentModal(proyecto.costo_proyecto)} className="btn btn-success btn-sm">Pagar</button>
                        </div>
                    </li>
                ))}
            </ul>
            <PaymentModal show={showPaymentModal} onClose={handleClosePaymentModal} projectCost={projectCost} />
        </div>
    );
};

export default CrudComponent;
