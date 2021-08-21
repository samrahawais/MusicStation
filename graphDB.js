const { EnapsoGraphDBClient } = require('@innotrade/enapso-graphdb-client');

const GRAPHDB_BASE_URL = 'http://localhost:7200',
  GRAPHDB_REPOSITORY = 'SAM',
  GRAPHDB_USERNAME = 'Test',
  GRAPHDB_PASSWORD = 'Test',
  GRAPHDB_CONTEXT_TEST = 'http://www.openrdf.org/schema/sesame#nil';

const DEFAULT_PREFIXES = [
  EnapsoGraphDBClient.PREFIX_OWL,
  EnapsoGraphDBClient.PREFIX_RDF,
  EnapsoGraphDBClient.PREFIX_RDFS,
  EnapsoGraphDBClient.PREFIX_XSD,
  EnapsoGraphDBClient.PREFIX_PROTONS,
  {
    prefix: 'entest',
    iri: 'http://ont.enapso.com/test#'
  },
  {
    prefix: "schema",
    iri: "https://schema.org/",
  },
  {
    prefix: 'owl',
    iri: 'http://www.w3.org/2002/07/owl#'
  },
  {
    prefix: 'rdf',
    iri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  },
  {
    prefix: 'rdfs',
    iri: 'http://www.w3.org/2000/01/rdf-schema#'
  },
  {
    prefix: "foaf",
    iri: "http://xmlns.com/foaf/0.1/",
  },
  {
    prefix: "dbo",
    iri: "http://dbpedia.org/ontology/",
  },
  {
    prefix: "mo",
    iri: "http://purl.org/ontology/mo/%22",
  }
];

let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
  baseURL: GRAPHDB_BASE_URL,
  repository: GRAPHDB_REPOSITORY,
  prefixes: DEFAULT_PREFIXES,
  transform: 'toJSON'
});

graphDBEndpoint.login(GRAPHDB_USERNAME, GRAPHDB_PASSWORD)
  .then((result) => {
   })
  .catch((err) => {
    console.log(err);
  });

//Query
exports.getGenre = function (callback) {
  
  graphDBEndpoint.query(
      ` SELECT DISTINCT ?genre 
        WHERE { 
            ?x rdf:type rdfs:Class ;
           mo:ArtistName ?artist ;
           foaf:name ?name ;
		   dbo:genre ?genre .
          } ORDER BY ?genre`
          )

    .then((result) => {
        callback(null, result.records)
    })
    .catch((err) => {
      console.log(err);
      })
}
//---------------------------------------------
exports.getSongs = function (callback) {
  
  graphDBEndpoint.query(
      ` SELECT  ?name ?genre ?artist
        WHERE { 
            ?x rdf:type rdfs:Class ;
           mo:ArtistName ?artist ;
           foaf:name ?name ;
		   dbo:genre ?genre .
          } ORDER BY ?artist`
    )
    .then((result) => {
      callback(null, result.records)
    })
    .catch((err) => {
      console.log(err);
    })
}

//---------------------------------------------
exports.getGenreSongs = function (genre,callback) {
  graphDBEndpoint.query(
      `  SELECT DISTINCT ?artist ?name ?genre 
      WHERE { 
          ?x rdf:type rdfs:Class ;
         mo:ArtistName ?artist ;
         foaf:name ?name ;
     dbo:genre ?genre;
     dbo:genre "${genre}".
        }  `
    )
    .then((result) => {
        callback(null, result.records)
    })
    .catch((err) => {
      console.log(err);
      })
  }

//------------------------------------------------
  exports.getArtistSongs = function (singer,callback) {
    
    graphDBEndpoint.query(
        ` SELECT  ?name ?genre ?artist
          WHERE { 
              ?x rdf:type rdfs:Class ;
             mo:ArtistName ?artist ;
             mo:ArtistName "${singer}";
         dbo:genre ?genre .
            }`
      )
      .then((result) => {
          callback(null, result.records)
      })
      .catch((err) => {
        console.log(err);
      })
  }