import request from 'supertest'
import {app} from '../app.mjs'

import {dbConnect, dbDisconnect, dbDrop} from './mmsdb.mjs'

// theQuestion = toBe || !toBe; – Coco Apr 2 '19 at 15:15 

// Handles database connection, erasure and disconnection
beforeAll(async () => await dbConnect())
afterEach(async () => await dbDrop())
afterAll(async () => await dbDisconnect())

describe("Test the root path", () => {
    test("There should be a response to the GET method", done => {
        request(app)
            .get('/')
            .expect(200)
            .end(done)
    })
})

describe("Test the goals path", () => {

    // defines the test goals data
    const sampleEndDate = 1639994800000
    const sampleCompletedAt = 1649544800000
    const sampleLtGoalsId = ["61025508432c4c28734a321c"]
    const sampleEventsId = ["61050487cc48c02c70fe466b", "610504ac3b889a2c83beceb1"]

    const sampleRequiredGoal = {
        "title": "My New Goal",
        "description": "Test description",
        "timeframe": ".2 ms",
        "endDate": sampleEndDate,

    }

    const sampleOptionalGoal = {
        "title": "My New Goal",
        "description": "Test description",
        "timeframe": ".2 ms",
        "endDate": sampleEndDate,
        "completedAt": sampleCompletedAt,
        "lTGoalId": sampleLtGoalsId,
        "eventsId": sampleEventsId

    }

    // Start of goal test cases

    test("There should be a response (200 Status) to the GET method", done => {
        request(app)
            .get('/goals')
            .expect(200)
            .end(done)
    })
    test("A POST request without all required fields should be rejected with status 500", done => {
        request(app)
            .post('/goals')
            .send({})
            .expect(500)
            .end(done)
    })
    test("A POST request w/ all required fields should respond with status 200 and return title, description, timeframe & endDate", done => {
        request(app)    
            .post('/goals')
            .send(sampleRequiredGoal)
            .expect(200)
            .then((res) => {
                try {
                    expect(res.body.title).toBe("My New Goal")
                    expect(res.body.description).toBe("Test description")
                    expect(res.body.timeframe).toBe(".2 ms")
                    expect(new Date(res.body.endDate)).toStrictEqual(new Date(sampleEndDate))
                    done()
                } catch (e) {
                    done(e)
                }
            })
    })
    test("Database should automatically create id, createdAt and editedAt", done => {
        request(app)    
            .post('/goals')
            .send(sampleRequiredGoal)
            .expect(200)
            .then((res) => {
                try {
                    expect(res.body.id).toBeDefined()
                    expect(res.body.createdAt).toBeDefined()
                    expect(res.body.editedAt).toBeDefined()
                    done()
                } catch (e) {
                    done(e)
                }
            })
    })

    test("Should be able to post optional fields as well as required and have them returned", done => {
        request(app)    
            .post('/goals')
            .send(sampleOptionalGoal)
            .expect(200)
            .then((res) => {
                try {
                    expect(new Date(res.body.completedAt)).toStrictEqual(new Date(sampleCompletedAt))
                    expect(res.body.lTGoalId).toStrictEqual(sampleLtGoalsId)
                    expect(res.body.eventsId).toStrictEqual(sampleEventsId)
                    done()
                } catch (e) {
                    done(e)
                }
            })
    })

    test("Should be able to GET request /goals/:id, receive 200 status & json data", done => {
        request(app)    
            .post('/goals')
            .send(sampleRequiredGoal)
            .expect(200)
            .then((res) => {
                try {
                    request(app)
                        .get(`/goals/${res.body.id}`)
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(done)
                } catch (e) {
                    done(e)
                }
            })

    })

    test("Invalid goal id should respond with 404 status", done => {
        request(app)    
            .post('/goals')
            .send(sampleRequiredGoal)
            .expect(200)
            .then((res) => {
                try {
                    request(app)
                        .get(`/goals/1`)
                        .expect(404)
                        .end(done)
                } catch (e) {
                    done(e)
                }
            })

    })

    test("Should be able to delete goal entry with id with status 204 confirming deletion)", done => {
        request(app)    
            .post('/goals')
            .send(sampleRequiredGoal)
            .expect(200)
            .then((res) => {
                try {
                    request(app)
                        .delete(`/goals/${res.body.id}`)
                        .expect(204)
                        .end(done)
                } catch (e) {
                    done(e)
                }
            })

    })

    test("Should get 404 when trying to delete goal with invalid id", done => {
        request(app)    
            .post('/goals')
            .send(sampleRequiredGoal)
            .expect(200)
            .then((res) => {
                try {
                    request(app)
                        .delete(`/goals/${res.body.id}`)
                        .expect(204)
                        .end(done)
                } catch (e) {
                    done(e)
                }
            })

    })

    test("PUT request to goals/:id should update existing goal", done => {
        request(app)    
            .post('/goals')
            .send(sampleRequiredGoal)
            .expect(200)
            .then((res) => {
                try {
                    request(app)
                        .put(`/goals/${res.body.id}`)
                        .send({title: "The Title Should Now Be Updated"})
                        .expect(200)
                        .then((res) => {
                            try {
                                expect(res.body.title).toBe("The Title Should Now Be Updated")
                                done()
                            } catch (e) {
                                done(e)
                            }
                        })
                } catch (e) {
                    done(e)
                }
            })

    })
    

})