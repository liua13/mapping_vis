const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var sphereKnn = require("sphere-knn")
var leafletKnn = require("leaflet-knn")

var app = express(); 

app
	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
