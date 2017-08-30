
const fs = require('fs')

const model = {
	orgId: '',//match.orgId,
	orgName: '',//match.name,
	token: ''//message.token
}

exports.get = () => {
	return new Promise((resolve, reject) => {
		const json = fs.readFileSync('./config.json')

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

		fs.writeFile('./config.json', json, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve(true)
			}
		})	
	})
}
