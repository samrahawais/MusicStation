const ParsingClient = require('sparql-http-client/ParsingClient')

exports.getLinkedDataSongs = async function getLinkedDataSong(sing,callback) {
  const singer=sing
  const records = []
  const endpointUrl = "http://dbtune.org/musicbrainz/sparql"

  const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX mo: <http://purl.org/ontology/mo/>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>

      SELECT  ?trackname 
      WHERE {
          ?x rdf:type mo:MusicArtist ;
          foaf:name "${sing}" ;
          rdfs:label ?artist .
      
          ?y rdf:type mo:Track ;
          foaf:maker ?x ;
          dc:title ?trackname . 
          }
    Limit 20`

const client = new ParsingClient({ endpointUrl })
client.query.select(query).then(bindings => {
    bindings.forEach(row =>
    Object.entries(row).forEach(([key, value]) => {
        records.push({
          trackname: value.value,
          singer
         })
    })
  )
    callback(records)
})
}