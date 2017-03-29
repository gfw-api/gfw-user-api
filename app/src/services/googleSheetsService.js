'use strict';

var config = require('config');
var logger = require('logger');
var GoogleSpreadsheet = require('google-spreadsheet');

class GoogleSheetsService {
    constructor(){
        this.creds = config.get('googleSheets');
        // this.doc = new GoogleSpreadsheet(this.creds.target_sheet_id);
    }

    * authSheets(creds){
        return new Promise(function(resolve, reject) {
            let creds = {
                private_key : this.creds.private_key.replace(/\\n/g, '\n'),
                client_email: this.creds.client_email
            };
            this.doc.useServiceAccountAuth(creds, function(err, result) {
              if (err) {
                return reject(err);
              }
              resolve(result);
            });
        }.bind(this));
    }

    * updateSheet(user){
        try {
            yield this.authSheets(this.creds);
            const result = yield this.checkRows();
            for ( var i = 0; i < result.length; i++ ) {
              if ( result[i]._value === user.email ) {
                logger.info('User already exists. Updating....');
                yield this.updateCells(result[i], user);
                return;
              }
            }
            return new Promise(function(resolve, reject) {
                const newRow = {
                    'agreed_to_test': 'yes',
                    'Date First Added': this.getDate(),
                    'Email': user.email,
                    'First': user.fullName,
                    'Source': 'My GFW',
                    'Address Location': user.city + ', ' + user.state + ', ' + user.country,
                    'Other How do you use or plan to use GFW': user.howDoYouUse,
                    'Position Primary Responsibilities': user.primaryResponsibilities,
                    'Organization Sector': user.sector
                };
                this.doc.addRow(this.creds.target_sheet_index, newRow, function(err, result) {
                  if (err) {
                    return reject(err);
                  }
                  logger.info('Added row in spreedsheet');
                  resolve(result);
                });
            }.bind(this));
        } catch (err) {
            logger.error(err);
        }
    }

    * updateCells(row, user) {
        try {
            logger.info('Getting user....');
            return new Promise(function(resolve, reject) {
                this.doc.getRows(this.creds.target_sheet_index, {
                    'offset': row.row - 1,
                    'limit': 1
                }, function(err, row) {
                  if (err) {
                    return reject(err);
                  }
                  logger.info('Found user....');
                  row[0].first = user.fullName;
                  row[0].addresslocation = user.city + ', ' + user.state + ', ' + user.country;
                  row[0].organizationsector = user.sector;
                  row[0].positionprimaryresponsibilities = user.primaryResponsibilities;
                  row[0].source = 'My GFW';
                  row[0].otherhowdoyouuseorplantousegfw = user.howDoYouUse;
                  row[0].agreedtotest = user.signUpForTesting === true ? 'yes' : 'no';
                  row[0].save(function(){
                      logger.info('User updated');
                      resolve(row);
                  });
                });
            }.bind(this));
        } catch (err) {
           logger.debug(err);
        }
    }

    * checkRows(){
        try {
            logger.debug('Checking rows....');
            return new Promise(function(resolve, reject) {
                this.doc.getCells(this.creds.target_sheet_index, {
                    'min-col': 5,
                    'max-col': 5
                }, function(err, result) {
                  if (err) {
                    return reject(err);
                  }
                  resolve(result);
                });
            }.bind(this));
        } catch (err) {
           logger.debug(err);
        }
    }

    getDate(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!

        var yyyy = today.getFullYear();
        if( dd < 10 ){
            dd = '0' + dd;
        }
        if( mm < 10 ){
            mm = '0' + mm;
        }
        today = mm + '/' + dd + '/' + yyyy;
        return today;
    }

}

module.exports = new GoogleSheetsService();
