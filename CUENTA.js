import fs from 'fs';
import path from 'path';

// Ruta relativa al archivo JSON que almacena los datos de los usuarios
const dataFilePath = path.resolve('usuarios.json');

const loadUsersData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    return {};
  }
};

let handler = async (m, { conn, usedPrefix }) => {
  // Cargar los datos de usuarios desde el archivo JSON
  const users = loadUsersData();

  // Obtener el número de teléfono del remitente
  const phoneNumber = m.sender.split('@')[0];

  // Buscar al usuario registrado por el número de teléfono
  const user = Object.values(users).find(user => user.phoneNumbers.includes(phoneNumber));

  if (user) {
    const { nick, phoneNumbers, lastLoginTimestamp, lastLogoutTimestamp, vip, vipExpirationTimestamp } = user;
    const formattedPhoneNumbers = phoneNumbers.map(number => `+${number}`).join(', ');
    const message = `✅ Nick: ${nick}\n📞 Números: ${formattedPhoneNumbers}\n💡 Estado: Registrado\n\nℹ️ Último inicio de sesión: ${new Date(lastLoginTimestamp).toLocaleString()}\nℹ️ Último cierre de sesión: ${new Date(lastLogoutTimestamp).toLocaleString()}\n\n⭐ VIP: ${vip ? 'Sí' : 'No'}\n${vip && vipExpirationTimestamp ? `⏰ Expiración VIP: ${new Date(vipExpirationTimestamp).toLocaleString()}` : ''}`;

    // Enviar mensaje con botones para cambiar contraseña y borrar cuenta
    conn.sendButton(m.chat, message, '¿Qué acción deseas realizar?', [
      ['Cambiar Contraseña', '.changepass'],
      ['Borrar Cuenta', '.deleteacc']
    ]);

  } else {
    m.reply(`❌ No estás registrado.`);
  }
};

handler.command = /^(cuenta|account|perfil)$/i;
export default handler;
