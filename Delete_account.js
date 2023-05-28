import fs from 'fs';
import path from 'path';

// Relative path to the JSON file storing user data
const dataFilePath = path.resolve('users.json');

// Function to load user data from the JSON file
const loadUsersData = () => {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    if (data) {
      return JSON.parse(data);
    }
  }
  return {};
};

// Function to save user data to the JSON file
const saveUsersData = (users) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
};

let handler = async (m, { conn, text }) => {
  if (!text) throw "⚠️ Enter a valid format to delete the account. Example: .deleteacc phone-numbers - password";

  // Extract phone numbers and password from the provided text
  const [phoneNumbersText, password] = text.split('-').map(part => part.trim());

  if (!phoneNumbersText || !password) {
    throw "⚠️ Invalid format. You must provide phone numbers separated by commas and the password separated by a dash. Example: .deleteacc phone-numbers - password";
  }

  // Get the sender's phone number
  const senderPhoneNumber = m.sender.split('@')[0];

  // Verify if the sender's phone number is included in the provided list
  const phoneNumbers = phoneNumbersText.split(',').map(phoneNumber => phoneNumber.trim());
  if (!phoneNumbers.includes(senderPhoneNumber)) {
    throw "❌ You don't have permission to delete this account. You must provide your own phone number.";
  }

  // Load user data
  const users = loadUsersData();

  // Verify if phone numbers and password match to delete the accounts
  const usersToDelete = Object.values(users).filter(user => {
    return user.phoneNumbers.some(phoneNumber => phoneNumbers.includes(phoneNumber)) && user.password === password;
  });

  if (usersToDelete.length > 0) {
    usersToDelete.forEach(user => delete users[user.nick]);

    // Save the updated data to the JSON file
    saveUsersData(users);

    const deletedAccounts = usersToDelete.map(user => user.phoneNumbers.join(', ')).join(', ');
    m.reply(`✅ Accounts associated with phone numbers ${deletedAccounts} have been deleted.`);
  } else {
    throw "❌ No valid accounts found with the provided phone numbers and password.";
  }
};

handler.command = /^deleteacc$/i;
export default handler;
