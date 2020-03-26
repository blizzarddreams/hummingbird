import { createConnection } from "typeorm";

export default async (): Promise<void> => {
  await createConnection();
};
