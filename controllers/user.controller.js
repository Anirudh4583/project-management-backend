exports.allAccess = (req, res) => {
  res.status(200).send('public Content.')
}

exports.userBoard = (req, res) => {
  res.status(200).send('User Content.')
}

exports.adminBoard = (req, res) => {
  res.status(200).send('Admin Content.')
}

exports.moderatorBoard = (req, res) => {
  console.log('hey mod')
  res.status(200).send('Moderator Content.')
}
