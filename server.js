const express = require('express')
const app = express()
const moment = require('moment');
const cors = require('cors')
const mongoose = require('mongoose');

require('dotenv').config()
let exerciseModel = require('./models/exercise.model');


app.use(express.json());
app.use(cors())
app.use(express.urlencoded())

const myURI = process.env.ATLAS_URI;
mongoose.connect(myURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const connection = mongoose.connection;
connection.on('open', () => {
	console.log("MongoDB database connection established succesfully");
})


app.use(express.static('public'))
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html')
});



app.post('/api/exercise/new-user', (req, res) => {
	let username = req.body.username;

	exerciseModel.findOne({ username: username }, (err, name) => {
		if (err) return err;

		if (name) res.send('Username already taken')
		else {
			const exerciseData = new exerciseModel({
				username,
				count:0,
				exercise: []
			});

			exerciseData.save()
				.then((data) => {
					res.json({
						username: data.username,
						_id: data._id
					})
				}).catch(err => res.status(400).json('Error' + err));
		}
	});

});

app.get('/api/exercise/users', (req, res) => {

	exerciseModel.find()
		.then((data) => {
			res.send(data);

		});
});




app.post('/api/exercise/add', (req, res) => {
  const exerciseForm = req.body;

  let momentDate = moment().format('ddd MMM DD YYYY').toString()

  if(exerciseForm.date === '') exerciseForm.date = momentDate;
  else exerciseForm.date =  moment(exerciseForm.date).format('ddd MMM DD YYYY').toString();

  const exerciseData = {
    description: exerciseForm.description,
    duration: exerciseForm.duration,
    date: exerciseForm.date
  }

  exerciseModel.updateOne(
    { _id: exerciseForm.userId },
    { $push: { exercise: exerciseData } },
  ).then(()=>{
    exerciseModel.findOne({ _id: exerciseForm.userId },(err, data)=>{
      if(err) res.json(err)

      let bindData = data.exercise[data.exercise.length - 1];

      let bindDataToObject = {
        username:data.username,
        description: bindData.description,
        duration: bindData.duration,
        _id: data._id,
        date: bindData.date
      }
      
      res.json(bindDataToObject);
    })
  })

})





app.get('/api/exercise/log', (req, res) => {
  let { userId } = req.query;
  let limit = Number(req.query.limit);
  let from =  moment(req.query.from).format('ddd MMM DD YYYY').toString();
  let to = moment(req.query.to).format('ddd MMM DD YYYY').toString();

exerciseModel.findOne({_id: userId }, (err, person) => {
  if(err) return err;
  if(person) {

    let userData = {
      _id: person._id,
      username: person.username,
      count: null
    }

    if(from || to){
      userData.log = person.exercise.filter((item, index) => {
          return  Date.parse(item.date) >= Date.parse(from) && Date.parse(item.date) <= Date.parse(to)
        });
      }
    
    if(limit){
      userData.log = person.exercise.slice(0, limit);
    }

    userData.count = userData.log.length
    res.json(userData);

  }
})

});


const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
