// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore' // Importa Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyANAieCfnObqRvDCQII3m_WsdEA3xAfOAA',
  authDomain: 'to-do-bechara.firebaseapp.com',
  projectId: 'to-do-bechara',
  storageBucket: 'to-do-bechara.appspot.com',
  messagingSenderId: '456216113918',
  appId: '1:456216113918:web:362d4881ca1614159e2baf',
  measurementId: 'G-DEHM9BRM85',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

// Initialize Firestore
const db = getFirestore(app) // Inicia Firestore

export { db } // Exporta Firestore para usarlo en otros componentes
