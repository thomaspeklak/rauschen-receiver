request = require "supertest"
app = require "../server.js"

describe "Frontend", ->
  it "should serve static files", (done) ->
    request(app)
      .get("/client.js")
      .set("Accept", "application/javascript")
      .expect("Content-Type", "application/javascript")
      .expect("200")
      .expect(/Rauschen/, ->
        done();
      )

