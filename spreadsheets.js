async function test (data) {
    const { GoogleSpreadsheet } = require('google-spreadsheet'),
        ID_CASES_BY_STATE_AND_DAY = 99990001;

    // spreadsheet key is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    // console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo(); // loads document properties and worksheets
    // console.log(doc);
    // console.log(doc.title);
    // await doc.updateProperties({ title: 'renamed doc' });

    const oldSheet = doc.sheetsById[ID_CASES_BY_STATE_AND_DAY];
    if (oldSheet) {
        await oldSheet.delete();
    }

    let headerValues = data[0].data.map(item => item.estado);
    headerValues.unshift('date');

    const sheet = await doc.addSheet({ title: 'data by date', sheetId: ID_CASES_BY_STATE_AND_DAY});
    await sheet.resize({ rowCount: data.length + 1, columnCount: headerValues.length });
    await sheet.setHeaderRow(headerValues);

    //cannot be a promise.all because the google-spreadsheet doesnt deal very good with async
    for (const row of data) {
        console.log(row.date);
        const states = {...row.data.reduce((acumulador, item) => {
            acumulador[item.estado] = item.ministerio;
            return acumulador;
            }, {})};
        await sheet.addRow({ date: row.date, ...states});
    }
    console.log("Success!");
}

module.exports = {
    test
};