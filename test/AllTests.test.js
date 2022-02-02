const EasyGraphQLTester = require('easygraphql-tester');
const { it, test } = require('mocha');
const schema = require('../graphql/schema');


const tester = new EasyGraphQLTester(schema)

describe('Test Graphql', () => {
    describe('users', () => {
        it('Récuperer les utilsateurs', () => {
                    const query =  (`
			{
				users {
				  	id
				  	firstname
					lastname
					email
					password
				} 
			}`)

            tester.test(false, query)
        })

            it('Récuperer un seul utilisateur avec le ID', () => {
                const query = `
			{
				user(id:"61ab7fbf35c761c8ec14f035") {
				  	id
				  	firstname
					lastname
					email
					password
				} 
			}`

                tester.test(true, query)
            })

        it('Récupérer les annonces', () => {
            const query = `
			{
				annonces {
				  	name
				  	price
				  	type 
				  	status
				  	publication
				  	location
				  	description
					author {
					    id
					    username
					    }
					    
				} 
			}`

            tester.test(true, query)
        })

        it('Récupérer une seul annonce', () => {
            const query = `
			{
				annonce(id:"61acf1fc90281ddeec98b647") {
				  	name
				  	price
				  	type 
				  	status
				  	publication
				  	location
				  	description
					author {
					    id
					    username
					    }
					    
				} 
			}`

            tester.test(true, query)
        })


    })
})
