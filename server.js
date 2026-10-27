const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // Vital para que tu página web de Windows Server pueda hablar con esta API

// Esta variable simula la "memoria" temporal donde guardamos el estado del carro
let estadoSistema = {
    modo: "manual",       // Puede ser "manual" o "automatico"
    comando: "detenido",  // Puede ser "avanzando", "retrocediendo", "izquierda", "derecha", "detenido"
    distancia: 0          // Lo que mide el sensor ultrasónico
};

// --- 1. ENDPOINTS PARA EL ESP32 ---
// El ESP32 consulta esto para saber qué orden ejecutar
app.get('/api/dispositivo/estado', (req, res) => {
    res.json({
        success: true,
        data: estadoSistema
    });
});

// El ESP32 envía aquí la distancia que mide el sensor HC-SR04
app.post('/api/dispositivo/distancia', (req, res) => {
    const { distancia } = req.body;
    if (distancia !== undefined) {
        estadoSistema.distancia = distancia;
        res.json({ success: true, message: "Distancia actualizada correctamente" });
    } else {
        res.status(400).json({ success: false, message: "Falta el valor de distancia" });
    }
});

// --- 2. ENDPOINTS PARA LA PÁGINA WEB ---
// Tu página web consulta esto para pintar la distancia en pantalla
app.get('/api/web/estado', (req, res) => {
    res.json({
        success: true,
        data: estadoSistema
    });
});

// Tu página web envía aquí los comandos cuando tocas los botones (Avanzar, Detener, etc.)
app.post('/api/web/control', (req, res) => {
    const { modo, comando } = req.body;
    
    if (modo) estadoSistema.modo = modo;
    if (comando) estadoSistema.comando = comando;

    res.json({
        success: true,
        message: "Comando actualizado por la web",
        data: estadoSistema
    });
});

// Puerto en el que corre la API
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`¡API REST funcionando en el puerto ${PORT}!`);
});