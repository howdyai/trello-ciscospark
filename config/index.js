
const fs = require('fs')


exports.init = () => {
	if (! fs.existsSync(__dirname + '/config.json')) {
		const config = {
				orgId: '',
				orgName: '',
				token: '',
		}
		try {
			fs.writeFileSync(__dirname + '/config.json', JSON.stringify(config))
		}
		catch (err) {
			throw new Error('Could not write config file to file system: ', err)
		}
		
	}
}

exports.get = () => {
	return new Promise((resolve, reject) => {
		const json = fs.readFileSync(__dirname + '/config.json')

		try {
			const data = JSON.parse(json);
			resolve(data)
		}
		catch (err) {
			reject(err)
		}
	})
}

exports.save = (data) => {
	return new Promise((resolve, reject) => {
		const json = JSON.stringify(data);

		fs.writeFile(__dirname + '/config.json', json, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve(true)
			}
		})	
	})
}
