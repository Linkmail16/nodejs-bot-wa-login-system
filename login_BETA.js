import fs from 'fs';
import path from 'path';

const dataFilePath = path.resolve('usuarios.json');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Cargar los datos de usuarios desde el archivo JSON (si existe)
  let data = {};
  if (fs.existsSync(dataFilePath)) {
    const fileData = fs.readFileSync(dataFilePath, 'utf-8');
    if (fileData) {
      data = JSON.parse(fileData);
    }
  }

  if (!text) throw "⚠️ Ingresa un formato válido para iniciar sesión. Ejemplo: .iniciar nick - contraseña";

  const [nick, password] = text.split('-').map(part => part.trim());

  if (!nick || !password) {
    throw "⚠️ Formato de inicio de sesión inválido. Debes proporcionar un nick y una contraseña separados por un guión. Ejemplo: .iniciar nick - contraseña";
  }

  if (data[nick] && data[nick].password === password) {
    const phoneNumber = m.sender.split('@')[0];

    if (data[nick].sessionStarted) {
      if (data[nick].phoneNumbers && data[nick].phoneNumbers.includes(phoneNumber)) {
        throw "❌ La sesión ya está iniciada para este usuario y número de teléfono.";
      }
    }

    const lastLoginTimestamp = Date.now();

    data[nick].lastLoginTimestamp = lastLoginTimestamp;
    data[nick].sessionStarted = true;

    if (!data[nick].phoneNumbers) {
      data[nick].phoneNumbers = [];
    }
    if (!data[nick].phoneNumbers.includes(phoneNumber)) {
      data[nick].phoneNumbers.push(phoneNumber);
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

    m.reply(`✅ Sesión iniciada para el nick: ${nick}. Números de teléfono asociados a la cuenta: ${data[nick].phoneNumbers.join(", ")}`);
  } else {
    throw "❌ Credenciales de inicio de sesión incorrectas. Verifica el nick y la contraseña.";
  }
};

handler.command = /^login$/i;
export default handler;
