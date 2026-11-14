const firebaseConfig = {
  apiKey: "AIzaSyCyI5ZuIrfEMgrJ4f_X3jC-kpqox6Vk5aQ",
  authDomain: "mudanzalimpia-1.firebaseapp.com",
  projectId: "mudanzalimpia-1",
  storageBucket: "mudanzalimpia-1.firebasestorage.app",
  messagingSenderId: "256645156063",
  appId: "1:256645156063:web:b8f0f3d55da8c1347eed6a",
  measurementId: "G-760TWJK49G"
};

// Iniciar Firebase con la configuración de tu proyecto
firebase.initializeApp(firebaseConfig);

// Conectar la base de datos y el inicio de sesión
const db = firebase.firestore();
const auth = firebase.auth();