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

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    throw "⚠️ Ingresa tu contraseña antigua y la nueva contraseña. Ejemplo: .changepass antiguaContraseña nuevaContraseña";
  }

  const [oldPassword, newPassword] = text.trim().split(' ');

  if (!oldPassword || !newPassword) {
    throw "⚠️ Formato de cambio de contraseña inválido. Debes proporcionar la contraseña antigua y la nueva contraseña. Ejemplo: .changepass antiguaContraseña nuevaContraseña";
  }

  let users = await loadUsersData();

  const phoneNumber = m.sender.split('@')[0];

  const user = Object.values(users).find(user => user.phoneNumbers.includes(phoneNumber));

  if (!user) {
    throw "❌ No estás registrado.";
  }

  if (!user.sessionStarted) {
    throw "❌ Debes iniciar sesión para cambiar la contraseña.";
  }

  if (user.password !== oldPassword) {
    throw "❌ La contraseña antigua no coincide.";
  }

  user.password = newPassword;

  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));

  m.reply(`✅ Contraseña cambiada correctamente.`);
};

handler.command = /^changepass$/i;
export default handler;
