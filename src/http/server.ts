import { Elysia } from "elysia";
const appPort = 3333;

const app = new Elysia().get('/', ()=> {
    return 'Hello World'
});

app.listen(appPort, () => {
    console.log(`App running on ${appPort}`);
    
});
