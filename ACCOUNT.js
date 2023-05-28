import fs from 'fs';
import path from 'path';

// Relative path to the JSON file that stores the user data
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
  // Load the user data from the JSON file
  const users = loadUsersData();

  // Get the sender's phone number
  const phoneNumber = m.sender.split('@')[0];

  // Search for the registered user by phone number
  const user = Object.values(users).find(user => user.phoneNumbers.includes(phoneNumber));

  if (user) {
    const { nick, phoneNumbers, lastLoginTimestamp, lastLogoutTimestamp, vip, vipExpirationTimestamp } = user;
    const formattedPhoneNumbers = phoneNumbers.map(number => `+${number}`).join(', ');
    const message = `✅ Nick: ${nick}\n📞 Phone numbers: ${formattedPhoneNumbers}\n💡 Status: Registered\n\nℹ️ Last login: ${new Date(lastLoginTimestamp).toLocaleString()}\nℹ️ Last logout: ${new Date(lastLogoutTimestamp).toLocaleString()}\n\n⭐ VIP: ${vip ? 'Yes' : 'No'}\n${vip && vipExpirationTimestamp ? `⏰ VIP expiration: ${new Date(vipExpirationTimestamp).toLocaleString()}` : ''}` : ''}`;

    // Send message with buttons to change password and delete account
    conn.sendButton(m.chat, message, '¿Qué acción deseas realizar?', [
      ['Cambiar Contraseña', '.changepass'],
      ['Borrar Cuenta', '.deleteacc']
    ]);

  } else {
    m.reply(`❌ You are not registered.`);
  }
};

handler.command = /^(cuenta|account|perfil|profile)$/i;
export default handler;
