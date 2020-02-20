/* eslint-disable consistent-return,no-unused-vars,no-underscore-dangle,class-methods-use-this,no-shadow */
const config = require('config');
const logger = require('logger');
const GoogleSpreadsheet = require('google-spreadsheet');

/**
 * TODO: This whole class is untested, as a comment on the constructor line below prevents it from working
 * Pending info from PM: should it be fixed and updated (and tested) or removed.
 */

class GoogleSheetsService {

    constructor() {
        this.creds = config.get('googleSheets');
        // this.doc = new GoogleSpreadsheet(this.creds.target_sheet_id);
    }

    async authSheets(creds) {
        return new Promise(((resolve, reject) => {
            const creds = {
                private_key: this.creds.private_key.replace(/\\n/g, '\n'),
                client_email: this.creds.client_email
            };
            this.doc.useServiceAccountAuth(creds, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        }));
    }

    async updateSheet(user) {
        try {
            await this.authSheets(this.creds);
            const result = await this.checkRows();
            for (let i = 0; i < result.length; i++) {
                if (result[i]._value === user.email) {
                    logger.info('User already exists. Updating....');
                    await this.updateCells(result[i], user);
                    return;
                }
            }
            return new Promise(((resolve, reject) => {
                const newRow = {
                    agreed_to_test: 'yes',
                    'Date First Added': this.getDate(),
                    Email: user.email,
                    First: user.fullName,
                    Source: 'My GFW',
                    'Address Location': `${user.city}, ${user.state}, ${user.country}`,
                    'Other How do you use or plan to use GFW': user.howDoYouUse,
                    'Position Primary Responsibilities': user.primaryResponsibilities,
                    'Organization Sector': user.sector
                };
                this.doc.addRow(this.creds.target_sheet_index, newRow, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    logger.info('Added row in spreedsheet');
                    resolve(result);
                });
            }));
        } catch (err) {
            logger.error(err);
        }
    }

    async updateCells(row, user) {
        try {
            logger.info('Getting user....');
            return new Promise(((resolve, reject) => {
                this.doc.getRows(this.creds.target_sheet_index, {
                    offset: row.row - 1,
                    limit: 1
                }, (err, row) => {
                    if (err) {
                        return reject(err);
                    }
                    logger.info('Found user....');
                    row[0].first = user.fullName;
                    row[0].addresslocation = `${user.city}, ${user.state}, ${user.country}`;
                    row[0].organizationsector = user.sector;
                    row[0].positionprimaryresponsibilities = user.primaryResponsibilities;
                    row[0].source = 'My GFW';
                    row[0].otherhowdoyouuseorplantousegfw = user.howDoYouUse;
                    row[0].agreedtotest = user.signUpForTesting === true ? 'yes' : 'no';
                    row[0].save(() => {
                        logger.info('User updated');
                        resolve(row);
                    });
                });
            }));
        } catch (err) {
            logger.debug(err);
        }
    }

    async checkRows() {
        try {
            logger.debug('Checking rows....');
            return new Promise(((resolve, reject) => {
                this.doc.getCells(this.creds.target_sheet_index, {
                    'min-col': 5,
                    'max-col': 5
                }, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            }));
        } catch (err) {
            logger.debug(err);
        }
    }

    getDate() {
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1; // January is 0!

        const yyyy = today.getFullYear();
        if (dd < 10) {
            dd = `0${dd}`;
        }
        if (mm < 10) {
            mm = `0${mm}`;
        }
        today = `${mm}/${dd}/${yyyy}`;
        return today;
    }

}

module.exports = new GoogleSheetsService();
