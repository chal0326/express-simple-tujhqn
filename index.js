const express = require('express');
const app = express();
const port = 3010;
const path = require('path');
const ZoomWeb = require('@zoomus/websdk');

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('pages/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Initialize the Zoom SDK
const zoom = new ZoomWeb();

// Set up a route for issuing multipin
app.get('/issue-multipin/:meetingId/:userId', (req, res) => {
    const meetingId = req.params.meetingId;
    const userId = req.params.userId;
    zoom.issueMultipleMeetingPin({
        meetingId: meetingId,
        participantId: userId
    }).then(response => {
        res.json(response);
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// Register an event listener for detecting when a user raises their hand
zoom.on("handRaiseEvent", (data) => {
    // check if the user who raised their hand has permission to access multipin
    // then call the /issue-multipin route
    if(data.participant.hasPermission){
        app.get('/issue-multipin/' + data.meetingId + '/' + data.participantId);
    }
});

// Start the Express server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
