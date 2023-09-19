const express = require('express');
const { v4: setId } = require('uuid');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const axios = require('axios');

const env = dotenv.config().parsed;
const PORT = env.PORT || 2020;
const sheetURL = "https://script.google.com/macros/s/AKfycbzkghZhwC4llGBerFX7SzNGR1Ho77k3vkzIVyRNmuXlsuLinva3LsF6Z4z5_Dikd37zsw/exec";

const app = express();

app.use(cors());
app.use(fileUpload()); //позволяет получать formData в запросах
app.use(express.json()); // позволяет читать json в запросах
app.use(express.urlencoded({ extended: true }));

app.post('/send-message', async (req, res) => {
	try {
		const { phone, name, message, id = setId() } = req.body;
		if (!phone || !name) throw new Error("Передайте обязательные ключи <phone> & <name>")

		const sheet_req = await axios({
			method: 'post',
			url: sheetURL,
			params: { phone, name, message, id }
		})

		if (sheet_req.status >= 400) throw new Error("Ошибка таблицы");

		return res.status(200).json({ "message": "Сообщение успешно отправлено", data: { ...sheet_req.data } })
	} catch (error) {
		console.log(error);
		return res.status(404).json(error);
	}
})




// start server
app.listen(PORT, (err) => {
	if (err) return console.log(err);
	console.log('server started')
	console.log(`link: http://localhost:${PORT}`)
})