import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.resolve('usuarios.json');

const loadUsersData = async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    return {};
  }
};

let handler = async (m, { conn, text }) => {
  if (!text) {
    throw "⚠️ Ingresa un número de teléfono válido. Ejemplo: .cerrarnum 573114444444";
  }

  const phoneNumber = text.trim();

  if (!phoneNumber) {
    throw "⚠️ Por favor, proporciona un número de teléfono válido. Ejemplo: .cerrarnum 573114444444";
  }

  let users = await loadUsersData();

  const user = Object.values(users).find(user => user.phoneNumbers.includes(phoneNumber));

  if (!user) {
    throw "❌ No se encontró ningún usuario asociado a ese número de teléfono.";
  }

  if (!user.sessionStarted) {
    throw "❌ El usuario ya ha cerrado la sesión.";
  }

  user.phoneNumbers = user.phoneNumbers.filter(num => num !== phoneNumber);

  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));

  m.reply(`✅ Número de teléfono ${phoneNumber} eliminado de la lista.`);
};

handler.command = /^cerrarnum$/i;
export default handler;
