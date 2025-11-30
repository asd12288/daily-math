import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6929739f0023a7777f65");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
