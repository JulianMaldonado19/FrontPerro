// CAMBIA ESTA URL POR LA RUTA REAL DE TU ENDPOINT
const API_URL = 'https://perro-api.onrender.com/api/v1';

const form = document.getElementById('item-form');
const formTitle = document.getElementById('form-title');
const itemIdInput = document.getElementById('item-id');
const nombreInput = document.getElementById('nombre');
const descripcionInput = document.getElementById('descripcion');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tableBody = document.getElementById('items-table-body');
const statusMessage = document.getElementById('status-message');

// Cargar registros al iniciar
document.addEventListener('DOMContentLoaded', fetchItems);

// Obtener todos los registros (GET)
async function fetchItems() {
    try {
        statusMessage.textContent = 'Cargando datos...';
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al conectar con la API');
        
        const data = await response.json();
        // Si tu API devuelve { data: [...] } usa data.data; si devuelve el array directo usa data
        const items = Array.isArray(data) ? data : (data.data || []);
        
        renderTable(items);
        statusMessage.textContent = '';
    } catch (error) {
        statusMessage.textContent = `Error: ${error.message}. Verifica que el servidor esté encendido y la ruta sea correcta.`;
        statusMessage.style.color = '#ef4444';
    }
}

// Renderizar filas en la tabla
function renderTable(items) {
    tableBody.innerHTML = '';
    
    if (items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay registros disponibles.</td></tr>';
        return;
    }

    items.forEach(item => {
        // Soporta _id de MongoDB o id estándar
        const id = item._id || item.id;
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><small>${id}</small></td>
            <td>${item.nombre || ''}</td>
            <td>${item.descripcion || ''}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editItem('${id}', '${escapeHtml(item.nombre)}', '${escapeHtml(item.descripcion)}')">Editar</button>
                <button class="btn-delete" onclick="deleteItem('${id}')">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Crear (POST) o Actualizar (PUT)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = itemIdInput.value;
    const payload = {
        nombre: nombreInput.value.trim(),
        descripcion: descripcionInput.value.trim()
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Error al guardar el registro');
        }

        resetForm();
        fetchItems();
    } catch (error) {
        alert(error.message);
    }
});

// Preparar formulario para edición
window.editItem = (id, nombre, descripcion) => {
    itemIdInput.value = id;
    nombreInput.value = nombre;
    descripcionInput.value = descripcion;
    
    formTitle.textContent = 'Editar Registro';
    btnSubmit.textContent = 'Actualizar';
    btnCancel.classList.remove('hidden');
};

// Eliminar registro (DELETE)
window.deleteItem = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('No se pudo eliminar el registro');
        fetchItems();
    } catch (error) {
        alert(error.message);
    }
};

// Cancelar edición
btnCancel.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    itemIdInput.value = '';
    formTitle.textContent = 'Nuevo Registro';
    btnSubmit.textContent = 'Guardar';
    btnCancel.classList.add('hidden');
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}