export default function (req, res, { params, location, route }) {


  console.log('test');
  (params, location, route);
  res.send('I only run on the server!');
}
