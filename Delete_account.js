import fs from 'fs';
import path from 'path';

// Ruta relativa al archivo JSON que almacena los datos de los usuarios
const dataFilePath = path.resolve('usuarios.json');

// Función para cargar los datos de usuarios desde el archivo JSON
const loadUsersData = () => {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    if (data) {
      return JSON.parse(data);
    }
  }
  return {};
};

// Función para guardar los datos de usuarios en el archivo JSON
const saveUsersData = (users) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
};

let handler = async (m, { conn, text }) => {
  if (!text) throw "⚠️ Ingresa un formato válido para borrar la cuenta. Ejemplo: .deleteacc número-de-teléfonos - contraseña";

  // Extraer los números de teléfono y la contraseña del texto proporcionado
  const [phoneNumbersText, password] = text.split('-').map(part => part.trim());

  if (!phoneNumbersText || !password) {
    throw "⚠️ Formato inválido. Debes proporcionar los números de teléfono separados por comas y la contraseña separados por un guión. Ejemplo: .deleteacc número-de-teléfonos - contraseña";
  }

  // Obtener el número de teléfono del remitente
  const senderPhoneNumber = m.sender.split('@')[0];

  // Verificar si el número de teléfono del remitente está incluido en la lista proporcionada
  const phoneNumbers = phoneNumbersText.split(',').map(phoneNumber => phoneNumber.trim());
  if (!phoneNumbers.includes(senderPhoneNumber)) {
    throw "❌ No tienes permiso para eliminar esta cuenta. Debes proporcionar tu propio número de teléfono.";
  }

  // Cargar los datos de usuarios
  const users = loadUsersData();

  // Verificar si los números de teléfono y la contraseña coinciden para eliminar las cuentas
  const usersToDelete = Object.values(users).filter(user => {
    return user.phoneNumbers.some(phoneNumber => phoneNumbers.includes(phoneNumber)) && user.password === password;
  });

  if (usersToDelete.length > 0) {
    usersToDelete.forEach(user => delete users[user.nick]);

    // Guardar los datos actualizados en el archivo JSON
    saveUsersData(users);

    const deletedAccounts = usersToDelete.map(user => user.phoneNumbers.join(', ')).join(', ');
    m.reply(`✅ Las cuentas asociadas a los números de teléfono ${deletedAccounts} han sido eliminadas.`);
  } else {
    throw "❌ No se encontraron cuentas válidas con los números de teléfono y contraseña proporcionados.";
  }
};

handler.command = /^deleteacc$/i;
export default handler;
