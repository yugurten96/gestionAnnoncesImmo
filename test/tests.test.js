const EasyGraphQLTester = require('easygraphql-tester');
const fs = require('fs');
const path = require("path")
const { it, test } = require('mocha');


const schema = require("../graphql/schema")

describe('Récupération des utilisateurs', () => {
    let tester;
    before(() => {
        tester = new EasyGraphQLTester(schema)
    })
    describe("Queries", () => {
        test("users", () => {
            const query = `
					{
						users {
							username
							firstname
							lastname
							email
							password
						}
					}`


            tester.test(true, query)
        })

    })

})


