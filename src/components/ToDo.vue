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
      <label class="form-label">Fecha límite</label>
      <input
        type="date"
        v-model="newTask.fechaLimite"
        class="form-control"
        required
      />
    </div>
    <input type="submit" class="btn btn-success" value="Enviar" />
  </form>

  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Completar</th>
          <th>Fecha de inicio</th>
          <th>Fecha límite</th>
          <th>Cliente</th>
          <th>Tarea</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="todo in todos" :key="todo.id">
          <td><input type="checkbox" v-model="todo.completado" @change="updateTaskStatus(todo)" /></td>
          <td>{{ todo.fechaInicio }}</td>
          <td>{{ todo.fechaLimite }}</td>
          <td>{{ todo.cliente }}</td>
          <td>{{ todo.tarea }}</td>
          <td>{{ todo.precio }}</td>
          <td>{{ todo.estado }}</td>
          <td><button @click="deleteTask(todo.id)" class="btn btn-danger btn-sm">Eliminar</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase'

const todos = ref([])
const isFormVisible = ref(false)

const convertTimestampToDate = timestamp => {
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleDateString()
}

const listenForTodos = () => {
  const todosCollection = collection(db, 'to-do')
  onSnapshot(todosCollection, querySnapshot => {
    todos.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      cliente: doc.data().cliente,
      completado: doc.data().completado,
      fechaInicio: convertTimestampToDate(doc.data().fecha_inicio),
      fechaLimite: convertTimestampToDate(doc.data().fecha_limite),
      precio: doc.data().precio,
      tarea: doc.data().tarea,
      estado: doc.data().completado ? 'Completado' : 'Pendiente',
    }))
  })
}

const newTask = ref({
  tarea: '',
  cliente: '',
  precio: '',
  fechaLimite: '',
})

const addTask = async event => {
  event.preventDefault()
  try {
    await addDoc(collection(db, 'to-do'), {
      tarea: newTask.value.tarea,
      cliente: newTask.value.cliente,
      precio: Number(newTask.value.precio),
      fecha_inicio: new Date(), // Fecha actual automática
      fecha_limite: new Date(newTask.value.fechaLimite),
      completado: false,
    })
    newTask.value = { tarea: '', cliente: '', precio: '', fechaLimite: '' }
    isFormVisible.value = false
  } catch (error) {
    console.error('Error al agregar la tarea:', error)
  }
}

const updateTaskStatus = async todo => {
  try {
    const taskDoc = doc(db, 'to-do', todo.id)
    await updateDoc(taskDoc, { completado: todo.completado })
  } catch (error) {
    console.error('Error al actualizar el estado de la tarea:', error)
  }
}

const deleteTask = async id => {
  try {
    const taskDoc = doc(db, 'to-do', id)
    await deleteDoc(taskDoc)
  } catch (error) {
    console.error('Error al eliminar la tarea:', error)
  }
}

onMounted(listenForTodos)
</script>

<style scoped>
h1 {
  font-size: 3rem;
  color: chocolate;
  font-weight: 800;
  text-align: center;
}

@media (max-width: 768px) {
  table thead {
    display: none;
  }

  table tbody,
  table tr,
  table td {
    display: block;
    width: 100%;
  }

  table tbody tr {
    margin-bottom: 1rem;
  }

  table td {
    text-align: right;
    padding-left: 50%;
    position: relative;
  }

  table td::before {
    content: attr(data-label);
    position: absolute;
    left: 0;
    width: 50%;
    padding-left: 10px;
    font-weight: bold;
    text-align: left;
  }

  table td button {
    width: 100%;
  }
}
</style>
