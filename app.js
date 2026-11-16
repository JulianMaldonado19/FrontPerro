const API_URL = 'https://perro-api.onrender.com/api/v1/perro';

const form = document.getElementById('perro-form');
const formTitle = document.getElementById('form-title');
const perroIdInput = document.getElementById('perro-id');
const nombreInput = document.getElementById('nombre');
const edadInput = document.getElementById('edad');
const tamanoInput = document.getElementById('tamano');
const razaInput = document.getElementById('raza');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tableBody = document.getElementById('perros-table-body');
const statusMessage = document.getElementById('status-message');

// Cargar registros al iniciar
document.addEventListener('DOMContentLoaded', fetchPerros);

// Obtener todos los perros (GET)
async function fetchPerros() {
    try {
        statusMessage.style.color = '#3b82f6';
        statusMessage.textContent = 'Cargando registros...';
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Error HTTP ${response.status} al consultar la API`);
        
        const data = await response.json();
        const perros = Array.isArray(data) ? data : (data.data || data.perros || []);
        
        renderTable(perros);
        statusMessage.textContent = '';
    } catch (error) {
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.style.color = '#ef4444';
    }
}

// Renderizar filas en la tabla
function renderTable(perros) {
    tableBody.innerHTML = '';
    
    if (perros.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay perros registrados.</td></tr>';
        return;
    }

    perros.forEach(perro => {
        const id = perro._id || perro.id;
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><small title="${id}">${String(id).slice(-6)}</small></td>
            <td><strong>${escapeHtml(perro.nombre)}</strong></td>
            <td>${perro.edad ?? ''} años</td>
            <td><span class="badge">${escapeHtml(perro.tamano)}</span></td>
            <td>${escapeHtml(perro.raza)}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editPerro('${id}', '${escapeHtml(perro.nombre)}', ${perro.edad}, '${escapeHtml(perro.tamano)}', '${escapeHtml(perro.raza)}')">Editar</button>
                <button class="btn-delete" onclick="deletePerro('${id}')">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Crear (POST) o Actualizar (PUT)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = perroIdInput.value;
    const payload = {
        nombre: nombreInput.value.trim(),
        edad: Number(edadInput.value),
        tamano: tamanoInput.value,
        raza: razaInput.value.trim()
    };

    try {
        // Nota: Si tu backend usa PATCH en lugar de PUT para actualizar, cambia 'PUT' por 'PATCH'
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || `Error HTTP ${response.status} al guardar`);
        }

        resetForm();
        fetchPerros();
    } catch (error) {
        alert(error.message);
    }
});

// Preparar formulario para edición
window.editPerro = (id, nombre, edad, tamano, raza) => {
    perroIdInput.value = id;
    nombreInput.value = nombre;
    edadInput.value = edad;
    tamanoInput.value = tamano;
    razaInput.value = raza;
    
    formTitle.textContent = 'Editar Perro';
    btnSubmit.textContent = 'Actualizar';
    btnCancel.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Eliminar registro (DELETE)
window.deletePerro = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este perro?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'No se pudo eliminar el registro');
        }
        fetchPerros();
    } catch (error) {
        alert(error.message);
    }
};

// Cancelar edición
btnCancel.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    perroIdInput.value = '';
    formTitle.textContent = 'Nuevo Perro';
    btnSubmit.textContent = 'Guardar';
    btnCancel.classList.add('hidden');
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}