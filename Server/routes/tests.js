const express = require('express');
const router = express.Router();
const { TestModel } = require("../models/users");

router.get('/pose/:date', async(req, res) => {
    try{
        console.log(req.params.date);
        let pose = await TestModel.findOne();
        console.log(data);
            res.status(200).json(
                {data: data, time: data.date_time});
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message,
        })
    }
});

router.post('/pose', async (req, res) => {
    if (!req.body) res.status(404).json('missing req body');
    else {
        console.log(req.body);
        try {
            //push something to db 
            let data = await TestModel.create(req.body);
            console.log(data);
            res.status(200).json(data);
        }
        catch (err) {
            res.status(500).json({
                status: 500,
                message: err.message,
            })
        }
    }
});

router.delete('/pose', async(req, res) => {
    try{
        let data = await TestModel.deleteMany();
        res.status(200).json("deleted all");
    }catch(err){
        res.status(500).json({
            status: 500,
            message: err.message,
        })
    }
})

module.exports = router;