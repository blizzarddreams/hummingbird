import { createConnection } from "typeorm";

export default (): void => {
  createConnection()
    .then()
    .catch((e) => console.log(e));
};
