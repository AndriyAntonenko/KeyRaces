const Text = require("../models/text.model");

exports.addText = async (req, res, next) => {
  const { text } = req.body;

  try {
    await Text.create({ text });
    res.status(200).json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

exports.getRandomText = async (req, res, next) => {
  try {
    let raceNumber = +req.params.raceNumber;
    const count = await Text.count();
    if (raceNumber >= count) {
      raceNumber %= count;
    }

    const text = await Text.find({})
      .skip(raceNumber)
      .limit(1);

    res.status(200).json({
      success: true,
      data: {
        text: text[0].text
      }
    });
  } catch (error) {
    next(error);
  }
};
