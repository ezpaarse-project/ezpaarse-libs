# meta-doi
Return metadata from a DOI identifier

## installation
```shell
npm install -g meta-doi 
```


## Usage

### Module usage

```shell
var metadoi = require('meta-doi');
var options = {};

// request for one doi
metadoi.resolve("10.1007/BF02478894", options, function (err, item) {
  if (err) { console.error(err); }
  console.log(item);
});

// request for an array of dois
metadoi.resolve(["10.1016/0735-6757(91)90169-K", "10.1007/BF02478894"], options, function (err, list) {
  if (err) { console.error(err); }
  list.forEach(function (item) {
    console.log(item);
  });
});
```

### Command line usage
Getting help
```shell
meta-doi -h
Enrich a csv with meta information requested from a doi.
  Usage: /home/ubuntu/ezpaarse/build/nvm/bin/latest/meta-doi [-es] [-f file_name
  | -k doi_key_name | --doi doi_string]

Options:
  --doikey, -k     the field name containing doi (default "doi").
  --delimiter, -d  delimiter of the csv file. Defaults to ";".
  --file, -f       A csv file to parse. If absent, will read from standard input
                   .
  --wait, -w       minimum time to wait between queries, in milliseconds.
                   Defaults to 200.
  --doi            A single doi to resolve.
```

CSV file enrichment
```shell
meta-doi -f my_CSV_with_doi_field.csv > my_CSV_doi_enriched.csv
```

Request for a single DOI
```shell
meta-doi --doi "10.1134/S1607672911010121"
```
will return :
```shell
{ 'doi-publication-title': 
   [ 'Dokl Biochem Biophys',
     'Doklady Biochemistry and Biophysics' ],
  'doi-publication-date-year': 2011,
  'doi-publisher': 'Pleiades Publishing Ltd',
  'doi-type': 'journal-article',
  'doi-ISSN': [ '1607-6729', '1608-3091' ],
  'doi-subject': [ 'Chemistry(all)', 'Biochemistry', 'Biophysics' ],
  'doi-DOI': '10.1134/s1607672911010121' }
```
## Documentation

### Methods

#### resolve(doi||dois, options, callback)
Return doi metadata from dois with options.  
The callback is called with a potential error and a result object (see example above).  
**doi** could be a string (one doi) and result is an object  
 or  
**dois** could be an array (many dois) and result is an array of objects.

You can use options ```{ extended: true }``` to obtain license informations about the doi object







