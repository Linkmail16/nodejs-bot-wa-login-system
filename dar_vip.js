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

const parseDuration = (input) => {
  const regex = /(\d+)\s*(d|h|m)/i;
  const match = input.match(regex);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (value && unit) {
      let durationInMilliseconds = 0;
      switch (unit) {
        case 'd':
          durationInMilliseconds = value * 24 * 60 * 60 * 1000;
          break;
        case 'h':
          durationInMilliseconds = value * 60 * 60 * 1000;
          break;
        case 'm':
          durationInMilliseconds = value * 60 * 1000;
          break;
      }
      return durationInMilliseconds;
    }
  }
  return 0;
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw "⚠️ Ingresa un número de teléfono o tag válido para otorgar o quitar el estado VIP. Ejemplo: .vip 573114444444 - 1d";
  }

  const [input, durationInput] = text.trim().split('-').map(part => part.trim());

  let users = await loadUsersData();

  // Buscar el usuario por número de teléfono o tag
  const foundUser = Object.keys(users).find(key => {
    const user = users[key];
    return (
      user.phoneNumbers && (
        user.phoneNumbers.includes(input) ||
        m.mentionedJid.includes(user.phoneNumbers.map(number => number + '@'))
      )
    );
  });

  if (!foundUser) {
    throw "❌ No se encontró ningún usuario asociado a ese número de teléfono o tag.";
  }

  if (command === 'vip') {
    // Establecer el estado VIP para el usuario encontrado
    users[foundUser].vip = true;

    // Analizar la duración y obtener el timestamp de expiración
    const durationInMilliseconds = parseDuration(durationInput);
    const expirationTimestamp = Date.now() + durationInMilliseconds;
    users[foundUser].vipExpirationTimestamp = expirationTimestamp;

    await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));

    m.reply(`✅ El usuario ${foundUser} ahora tiene el estado VIP. Duración: ${durationInput}`);
  } else if (command === 'quitarvip') {
    // Quitar el estado VIP para el usuario encontrado
    users[foundUser].vip = false;
    users[foundUser].vipExpirationTimestamp = null;

    await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));

    m.reply(`✅ El usuario ${foundUser} ya no tiene el estado VIP.`);
  }
};

handler.command = /^(vip|quitarvip)$/i;
export default handler;
