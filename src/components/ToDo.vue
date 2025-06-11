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
} from 'firebase/firestore'
import { db } from '../firebase'

// Lista para almacenar las tareas
const todos = ref([])

// Variable para controlar la visibilidad del formulario
const isFormVisible = ref(false)

// Función para convertir Firestore Timestamp a Date
const convertTimestampToDate = timestamp => {
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleDateString()
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

// Definir estructura del formulario
const newTask = ref({
  tarea: '',
  cliente: '',
  precio: '',
  fechaLimite: '',
})

// Agregar tarea nueva a Firestore
const addTask = async event => {
  event.preventDefault()

  try {
    // Crear fecha con hora en 00:00:00 local para evitar desfase de zona horaria
    const fecha = new Date(newTask.value.fechaLimite)
    fecha.setHours(0, 0, 0, 0)

    await addDoc(collection(db, 'to-do'), {
      tarea: newTask.value.tarea,
      cliente: newTask.value.cliente,
      precio: Number(newTask.value.precio),
      fecha_limite: fecha,
      completado: false,
    })

    // Limpiar formulario
    newTask.value = { tarea: '', cliente: '', precio: '', fechaLimite: '' }
    isFormVisible.value = false
  } catch (error) {
    console.error('Error al agregar la tarea:', error)
  }
}

// Actualizar estado de completado
const updateTaskStatus = async todo => {
  try {
    const taskDoc = doc(db, 'to-do', todo.id)
    await updateDoc(taskDoc, { completado: todo.completado })
  } catch (error) {
    console.error('Error al actualizar el estado de la tarea:', error)
  }
}

// Eliminar tarea
const deleteTask = async id => {
  try {
    const taskDoc = doc(db, 'to-do', id)
    await deleteDoc(taskDoc)
  } catch (error) {
    console.error('Error al eliminar la tarea:', error)
  }
}

// Ejecutar escucha al montar el componente
onMounted(listenForTodos)
</script>
