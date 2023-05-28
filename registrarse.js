import fs from 'fs';
import path from 'path';

const dataFilePath = path.resolve('usuarios.json');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Cargar los datos de usuarios desde el archivo JSON (si existe)
  let users = {};
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    if (data) {
      users = JSON.parse(data);
    }
  }

  if (!text) throw "⚠️ Ingresa un formato válido para registrar. Ejemplo: .registrar nick - contraseña";

  const [nick, password] = text.split('-').map(part => part.trim());

  if (!nick || !password) {
    throw "⚠️ Formato de registro inválido. Debes proporcionar un nick y una contraseña separados por un guión. Ejemplo: .registrar nick - contraseña";
  }

  if (password.length < 4) {
    throw "⚠️ La contraseña debe tener al menos 4 dígitos.";
  }

  const phoneNumber = m.sender.split('@')[0];

  const alreadyRegistered = Object.values(users).some(user => user.phoneNumber === phoneNumber);
  if (alreadyRegistered) {
    throw "⚠️ Este número de teléfono ya está registrado.";
  }

  if (users[nick]) {
    throw "⚠️ Este nick ya está registrado. Por favor, elige otro.";
  }

  const registrationTimestamp = Date.now();

  users[nick] = {
    nick,
    password,
    phoneNumber,
    registrationTimestamp,
  };

  fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));

  m.reply(`✅ Registro exitoso para el nick: ${nick}`);
};

handler.command = /^registrar$/i;
export default handler;
