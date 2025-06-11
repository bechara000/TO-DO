<script setup>
// Importar los módulos necesarios de Firebase y Firestore
import { ref, onMounted } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore' // Importar deleteDoc
import { db } from '../firebase' // Importa Firestore desde firebase.js

// Lista para almacenar las tareas
const todos = ref([])

// Variable para controlar la visibilidad del formulario
const isFormVisible = ref(false)

// Función para convertir Firestore Timestamp a Date
const convertTimestampToDate = timestamp => {
  const date = new Date(timestamp.seconds * 1000) // Convertir a milisegundos
  return date.toLocaleDateString() // Formato de fecha
}


// Función para escuchar cambios en Firestore
const listenForTodos = () => {
  const todosCollection = collection(db, 'to-do')
  onSnapshot(todosCollection, querySnapshot => {
    todos.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      cliente: doc.data().cliente,
      completado: doc.data().completado,

      fechaLimite: convertTimestampToDate(doc.data().fecha_limite),
      precio: doc.data().precio,
      tarea: doc.data().tarea,
      estado: doc.data().completado ? 'Completado' : 'Pendiente',
    }))

    console.log('Datos obtenidos en tiempo real:', todos.value)
  })
}

// Función para agregar una nueva tarea
const newTask = ref({
  tarea: '',
  cliente: '',
  precio: '',

  fechaLimite: '',
})

const addTask = async event => {
  event.preventDefault() // Evitar que la página se recargue al enviar el formulario
  try {
    await addDoc(collection(db, 'to-do'), {
      tarea: newTask.value.tarea,
      cliente: newTask.value.cliente,
      precio: Number(newTask.value.precio),

      fecha_limite: new Date(newTask.value.fechaLimite),
      completado: false, // Inicialmente, la tarea no está completada
    })
    // Limpiar el formulario
    newTask.value = { tarea: '', cliente: '', precio: '', fechaLimite: '' }
    isFormVisible.value = false // Ocultar el formulario después de enviar
  } catch (error) {
    console.error('Error al agregar la tarea:', error)
  }
}

// Función para actualizar el estado de completado de una tarea
const updateTaskStatus = async todo => {
  try {
    const taskDoc = doc(db, 'to-do', todo.id) // Referencia al documento
    await updateDoc(taskDoc, { completado: todo.completado }) // Actualizar el campo completado
  } catch (error) {
    console.error('Error al actualizar el estado de la tarea:', error)
  }
}

// Función para eliminar una tarea
const deleteTask = async id => {
  try {
    const taskDoc = doc(db, 'to-do', id) // Referencia al documento
    await deleteDoc(taskDoc) // Eliminar el documento
  } catch (error) {
    console.error('Error al eliminar la tarea:', error)
  }
}

// Llamar a listenForTodos cuando el componente se monte
onMounted(listenForTodos)
</script>

<template>
  <h1>3DImpressionSL Lista Trabajos</h1>

  <button @click="isFormVisible = !isFormVisible" class="btn btn-primary mb-3">
    {{ isFormVisible ? 'Cancelar' : 'Agregar Nueva Tarea' }}
  </button>

  <form v-if="isFormVisible" @submit="addTask" class="mb-4">
    <div class="mb-3">
      <input
        type="text"
        v-model="newTask.tarea"
        class="form-control"
        placeholder="Ingrese su tarea"
        required
      />
    </div>
    <div class="mb-3">
      <input
        type="text"
        v-model="newTask.cliente"
        class="form-control"
        placeholder="Ingrese su cliente"
        required
      />
    </div>
    <div class="mb-3">
      <input
        type="number"
        v-model="newTask.precio"
        class="form-control"
        placeholder="Ingrese su precio"
        required
      />
    </div>
    <div class="mb-3">
      <label for="fechaInicio" class="form-label">Fecha de inicio</label>
      <input
        type="date"
        v-model="newTask.fechaInicio"
        class="form-control"
        required
      />
    </div>
    <div class="mb-3">
      <label for="fechaLimite" class="form-label">Fecha límite</label>
      <input
        type="date"
        v-model="newTask.fechaLimite"
        class="form-control"
        required
      />
    </div>
    <input type="submit" class="btn btn-success" value="Enviar" />
  </form>

  <!-- Tabla responsiva para dispositivos pequeños -->
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Completar</th>

          <th>Fecha Limite</th>
          <th>Cliente</th>
          <th>Tarea</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="todo in todos" :key="todo.id">
          <td data-label="Completar">
            <input
              type="checkbox"
              v-model="todo.completado"
              @change="updateTaskStatus(todo)"
            />
          </td>

          <td data-label="Fecha Limite">{{ todo.fechaLimite }}</td>
          <td data-label="Cliente">{{ todo.cliente }}</td>
          <td data-label="Tarea">{{ todo.tarea }}</td>
          <td data-label="Precio">{{ todo.precio }}</td>
          <td data-label="Estado">{{ todo.estado }}</td>
          <td data-label="Acciones">
            <button @click="deleteTask(todo.id)" class="btn btn-danger btn-sm">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
h1 {
  font-size: 3rem;
  color: chocolate;
  font-weight: 800;
  text-align: center;
}
/* Estilo para pantallas pequeñas */
@media (max-width: 768px) {
  table thead {
    display: none; /* Ocultar encabezado de la tabla en pantallas pequeñas */
  }

  table tbody,
  table tr,
  table td {
    display: block; /* Mostrar cada fila y celda como un bloque */
    width: 100%;
  }

  table tbody tr {
    margin-bottom: 1rem;
  }

  table td {
    text-align: right; /* Alinear el texto a la derecha */
    padding-left: 50%;
    position: relative;
  }

  table td::before {
    /* Agregar etiquetas para cada celda */
    content: attr(
      data-label
    ); /* Mostrar el nombre de la columna en cada celda */
    position: absolute;
    left: 0;
    width: 50%;
    padding-left: 10px;
    font-weight: bold;
    text-align: left;
  }

  /* Estilo para los botones */
  table td button {
    width: 100%;
  }
}
</style>
