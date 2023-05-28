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

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let users = await loadUsersData();

  const phoneNumber = m.sender.split('@')[0];

  // Buscar el nick del usuario asociado al número de teléfono
  const nick = Object.keys(users).find(
    key =>
      users[key].phoneNumbers &&
      users[key].phoneNumbers.includes(phoneNumber)
  );

  if (!nick) {
    throw "❌ No se encontró ningún usuario asociado a este número de teléfono.";
  }

  if (!users[nick].sessionStarted) {
    throw "❌ La sesión no está iniciada para este usuario.";
  }

  users[nick].phoneNumbers = users[nick].phoneNumbers.filter(
    num => num !== phoneNumber
  );

  if (users[nick].phoneNumbers.length === 0) {
    users[nick].sessionStarted = false;

    // Agregar timestamp de cierre de sesión
    users[nick].lastLogoutTimestamp = Date.now();
  }

  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));

  m.reply(`✅ Sesión cerrada para el nick: ${nick}`);
};

handler.command = /^cerrar$/i;
export default handler;
