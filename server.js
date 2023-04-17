const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const Data = require('nedb')
const app = express()
const port = 4000


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
    defaultLayout: 'main.hbs',
    helpers: {
        when: (operand_1, operand_2, options) => {
            let func = function (a, b) {
                return a == b;
            }
            if (func(operand_1, operand_2)) {
                return options.fn(this)
            } 
            else {
                return options.inverse(this)
            }
        }
    }
}));

app.use(express.urlencoded({
    extended: true
}))
app.use(express.static('static'))


const cars = new Data({
    filename: 'kolekcja.db',
    autoload: true
})

app.get("/", (_, res) => {
    res.render('index.hbs', {
        onmain: true
    })
})
app.get("/addCar", (_, res) => {
    res.render('add.hbs', {
        onadd: true
    })
})

app.post('/addCar', (req, res) => {
    const data = {
        insured: req.body.a != undefined ? "TAK" : "NIE",
        gas: req.body.b != undefined ? "TAK" : "NIE",
        damage: req.body.c != undefined ? "TAK" : "NIE",
        boost: req.body.d != undefined ? "TAK" : "NIE"
    }

    cars.insert(data, (_, doc) => {
        res.render('add.hbs', {
            onadd: true,
            id: doc._id
        })
    })
})

app.get("/editCars", (req, res) => {
    cars.find({}, (_, doc) => {
        doc.forEach((e) => {
            e.editable = req.query._id === e._id ? true : false
        })

        res.render('edit.hbs', {
            onedit: true,
            docs: doc
        })
    })
})

app.post("/editCars", (req, res) => {
    if (req.body.a == "TAK") {
        var a = "TAK"
    } else if (req.body.a == "NIE") {
        var a = "NIE"
    } else {
        var a = "BRAK"
    }

    if (req.body.b == "TAK") {
        var b = "TAK"
    } else if (req.body.b == "NIE") {
        var b = "NIE"
    } else {
        var b = "BRAK"
    }

    if (req.body.c == "TAK") {
        var c = "TAK"
    } else if (req.body.c == "NIE") {
        var c = "NIE"
    } else {
        var c = "BRAK"
    }

    if (req.body.d == "TAK") {
        var d = "TAK"
    } else if (req.body.d == "NIE") {
        var d = "NIE"
    } else {
        var d = "BRAK"
    }

    cars.update({
        _id: req.body._id
    }, {
        insured: a,
        gas: b,
        damage: c,
        boost: d
    }, (_) => {
        cars.find({}, (_, docs) => {
            res.render('edit.hbs', {
                onedit: true,
                docs: docs
            })
        })
    })
})

app.post("/carsList", (req) => {
    console.log(req.body)
})

app.get("/carsList", (_, res) => {
    cars.find({}, (_, docs) => {
        res.render('list.hbs', {
            onlist: true,
            docs: docs
        })
    })
})

app.get('/carsList&id=:id', (req, res) => {
    const id = req.params.id
    cars.remove({
        _id: id
    }, (_) => {
        cars.find({}, (_, docs) => {
            res.render('list.hbs', {
                onlist: true,
                docs: docs
            })
        })
    })
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})