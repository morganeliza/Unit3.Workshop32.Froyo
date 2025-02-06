// imports here for express and pg

const express = require('express');
const app = express();
const pg = require('pg');
const path = require('path');
const client = new pg.Client("postgres://morganmaccarthy:postgres@localhost:5432/acme_froyo_db");
app.use(express.json());
//middleware for printing information + errors:
app.use(require('morgan')('dev'));


// static routes here (you only need these for deployment)
// app.use(express.static(path.join(__dirname, '..client/dist')));

// app routes here
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM flavors WHERE id = $1
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows);

    } catch (ex) {
        next()

    }

})


app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO flavors(name)
            VALUES($1)
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name]);
        res.send(response.rows);

    } catch (ex) {
        next()
    }

});
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
          SELECT * from flavors ORDER BY created_at DESC;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (ex) {
        next(ex)
    }


});
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
          UPDATE flavors
          SET name=$1, is_favorite=$2, updated_at= now()
          WHERE id=$3 RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id])
        res.send(response.rows[0])
    } catch (ex) {
        next(ex)
    }

});
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
          DELETE from flavors
          WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (ex) {
        next(ex)
    }

});

// create your init function
const init = async () => {
    await client.connect();
    let SQL = `  
      DROP TABLE IF EXISTS flavors;
      CREATE TABLE flavors(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      is_favorite BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
      
     
    );
`
    await client.query(SQL);
    console.log('tables created')
    SQL = `
  INSERT INTO flavors(name, is_favorite) VALUES('vanilla', false);
  INSERT INTO flavors(name, is_favorite) VALUES('chocolate', false);
  INSERT INTO flavors(name, is_favorite) VALUES('strawberry', false);
`
    await client.query(SQL);
    console.log('data seeded')
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
}

// init function invocation
init();