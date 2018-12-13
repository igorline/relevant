const Tagparent = require('./tagParent.model');

function handleError(res, statusCode) {
  const status = statusCode || 500;
  return (err) => {
    console.log('tag error ', err);
    res.status(status).send(err);
  };
}

// exports.create = (req, res) => {
//   let testObj = {
//     name: 'Test'
//   };

//   let newTagparent = new Tagparent(testObj);

//   newTagparent.save((err, tagparent) => {
//     if (err) return handleError(err);
//     return res.status(200).json(tagparent);
//   });
// };


exports.index = (req, res) => {
  Tagparent.find((err, tagparents) => {
    if (err) return handleError(err);
    return res.status(200).json(tagparents);
  });
};

