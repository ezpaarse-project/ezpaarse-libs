# meta-doi
Return metadata from a DOI identifier

## Usage

require('meta-doi');

....

## Command line usage
CSV file enrichment
```shell
meta-doi -f my_CSV_file_with_doi_field.csv > my_CSV_file_doi_enrich.csv
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
  'doi-subject': [ 'Chemistry(all)', 'Biochemistry', 'Biophysics' ] }
```





