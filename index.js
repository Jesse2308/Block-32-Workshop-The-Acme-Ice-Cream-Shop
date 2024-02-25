const pg = require("pg");
const express = require("express");
const path = require("path");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_flavors_db"
);

const app = express();
app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/", (req, res, next) =>
  res.sendFile(path.join(__dirname, "index.html"))
);
app.get("/api/flavors", async (req, res, next) => {
  try {
    res.send((await client.query("SELECT * FROM flavors")).rows);
    const SQL = "SELECT * FROM flavors";
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/flavors", async (req, res, next) => {
  try {
    res.send(
      (
        await client.query("INSERT INTO flavors(name) VALUES($1) RETURNING *", [
          req.body.name,
        ])
      ).rows[0]
    );
    const SQL = "INSERT INTO flavors(name) VALUES($1) RETURNING *";
    const response = await client.query(SQL, [req.body.name]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    res.send(
      (
        await client.query(
          "UPDATE flavors SET name=$1 WHERE id=$2 RETURNING *",
          [req.body.name, req.params.id]
        )
      ).rows[0]
    );
    const SQL = "UPDATE flavors SET name=$1 WHERE id=$2 RETURNING *";
    const response = await client.query(SQL, [req.body.name, req.params.id]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    res.send(
      (
        await client.query("DELETE FROM flavors WHERE id=$1 RETURNING *", [
          req.params.id,
        ])
      ).rows[0]
    );
    const SQL = "DELETE FROM flavors WHERE id=$1 RETURNING *";
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  const SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );
        INSERT INTO flavors(name) VALUES('Vanilla');
        INSERT INTO flavors(name) VALUES('Chocolate');
        INSERT INTO flavors(name) VALUES('Strawberry');
        `;
  await client.query(SQL);
  console.log("DB has been seeded");
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`App listening in port ${PORT}`));
};
init();
