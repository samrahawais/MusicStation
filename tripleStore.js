const csv = require('csv-parser');
//const rdf = require('rdf');
const fs = require('fs');
const rdf = require('rdflib');
const results = [];

var store = rdf.graph();
//prefixes
var RDF = rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var RDFS = rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var FOAF = rdf.Namespace("http://xmlns.com/foaf/0.1/");
var XSD = rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
var DBO = rdf.Namespace("http://dbpedia.org/ontology/");
var DBR = rdf.Namespace("http://dbpedia.org/resource/");
var DBP = rdf.Namespace("http://dbpedia.org/property/");
var VCARD = rdf.Namespace("http://www.w3.org/2006/vcard/ns#");
var OWL = rdf.Namespace("http://dbpedia.org/ontology/");
var MO = rdf.Namespace("http://purl.org/ontology/mo/%22");
var SCHEMA = rdf.Namespace("https://schema.org/");

console.log("IM IN TRIPLE STORE")
fs.createReadStream("top50.csv")
    .pipe(csv({ separator: "," }))
    .on("data", (data) => {
        results.push(data)
        store.add(DBR(data.TrackName.replace(/\s+/g, "-")), RDF("type"), RDFS("Class"));
        store.add(DBR(data.TrackName.replace(/\s+/g, "-")), RDF("type"), DBO("Song"));
        store.add(DBR(data.TrackName.replace(/\s+/g, "-")), FOAF("name"), data.TrackName);
       // store.add(DBR(data.ArtistName.replace(/\s+/g, "-")), RDF("type"), FOAF("person"));
        store.add(DBR(data.TrackName.replace(/\s+/g, "-")), MO("ArtistName"), data.ArtistName);
        store.add(DBR(data.TrackName.replace(/\s+/g, "-")), DBO("Genre"), data.Genre);
        store.add(DBR(data.TrackName.replace(/\s+/g, "-")), MO("bpm"), data.BeatsPerMinute);
        store.add(DBR(data.TrackName.replace(/\s+/g, "-")), MO("duration"), data.Length);
    })
    .on("end", () => {

        console.log("WRITE FILE ")
        fs.writeFile("songs.ttl", rdf.serialize(null, store, 'text/turtle'),
            function (err) {
            if (err) {
                return console.log(err);
            }
            }
        )
        console.log(store.toNT())
    })

function removeSpace(str) {
    return str.replace(/\s+/g, "_")
}
