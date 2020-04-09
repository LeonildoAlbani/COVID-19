(async () => {
    const csvPath = './data';

    try {

        const filesFiltered = await getFilesFromPath(csvPath);
        // console.log(filesFiltered);

        const jsonData = await Promise.all(buildPromisesToReadCsvs(csvPath, filesFiltered));
        // console.log(jsonData);

        const jsonDataSanitized = jsonData.map(sanitizeJson);
        // console.log(jsonDataSanitized);

        console.dir(joinDateAndData(filesFiltered, jsonDataSanitized));
    } catch (e) {
        console.error(e);
    }
})();

function joinDateAndData(files, jsons) {
    let jsonJoined = [];
    for (let i = 0; i < files.length; i++) {
        jsonJoined.push({date: files[i].substring(0, 10), data: jsons[i]})
    }
    return jsonJoined;
}

function sanitizeJson(jsonData) {
    const jsonFiltered = jsonData.filter(row => {
        if (!row.field1 || (!row.field2 && !row.field3) || row.field1 ==='Estado') {
            return false;
        }
        return true;
    });

    return jsonFiltered.map(row => {
        return {estado: row.field1, secretarias: row.field2, ministerio: row.field3}
    })
}

function buildPromisesToReadCsvs(csvPath, files) {
    const csv = require('csvtojson');
    let promises = [];

    files.forEach(fileName => {
        promises.push(csv({
            noheader: true,
        }).fromFile(`${csvPath}/${fileName}`));
    });

    return promises;
}

/**
 * Exclude files that have "total" in the name
 */
async function getFilesFromPath(csvPath) {
    const files = await readdir(csvPath);

    return files.filter(fileName => {return !fileName.includes('total')});
}

function readdir(path) {
    const fs = require('fs');

    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, paths) => {
            if (err) {
                reject(err)
            } else {
                resolve(paths)
            }
        });
    });
}