import { Elysia, t } from "elysia";
import { registerRestaurant } from "./routes/register-restaurant";
import { sendAuthLink } from "./routes/send-auth-link";
import { authenticateFromLink } from "./routes/authenticate-from-link";
import { signOut } from "./routes/sign-out";
import { getProfile } from "./routes/get-profile";
import { getManagedRestaurant } from "./routes/get-managed-restaurant";
const appPort = 3333;

const app = new Elysia()
    .use(registerRestaurant)
    .use(signOut)
    .use(sendAuthLink)
    .use(authenticateFromLink)
    .use(getManagedRestaurant)
    .use(getProfile);

app.listen(appPort, () => {
    console.log(`App running on ${appPort}`);
});
