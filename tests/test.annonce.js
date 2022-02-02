
var mongoose = require('mongoose');
var Annonce = require("../models/annonce.js");

describe('Annonce', function() {

    before(async () => {
        await mongoose.connect('mongodb://127.0.0.1/essai');
        done();
    });

    after(async () => {
        await mongoose.connection.close();
        done();
    });

    beforeEach(function(done) {
        var annonce = new Annonce({
          name: 'Appartement',
          description: 'F3 meublé',
          price: 120000,
          type: 'Vente',
          status: 'Disponible',
          publication: 'Publiée',
          location: '64 Rue de Rivoli, 76600 Le Havre',
          image: ["photos/default"],
          author: {username:'Max'},
          messages:[{text: "Dans quelle ville ?"}],
          comments:[{text: "Une très belle maison"}],
          reviews:[{text: "Très beau appartement !"}],
          likes:[{username: "Tailor"}],
          rating:[5]
        });

        annonce.save(function(error) {
            if (error) console.log('error' + error.message);
            else console.log('no error');
            done();
        });
    });


    it('find annonce by name', function(done) {
        Annonce.findOne({ name: 'Appartement' }, function(err, annonce) {
            annonce.name.should.eql('Appartement');
            console.log("Annonce's name: ", annonce.name);
            done();
        });
    });

    afterEach(function(done) {
        Annonce.remove({}, function() {
            done();
        });
    });

});
