const UserModel = require("./models/User");

async function addInitialUsers() {
  const users = [
    { email: "qwertyme336@gmail.com", password: "adminPWDacc1", role: "Admin" },
    { email: "eval1@gmail.com", password: "evalPWDacc1", role: "Evaluator" }
  ];

  for (const user of users) {
    const existingUser = await UserModel.findOne({ email: user.email });
    if (!existingUser) {
      await UserModel.create(user);
      console.log(`Added user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }
}

addInitialUsers();
