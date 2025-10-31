const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Function to extract seat number from seat label (e.g., "A1" -> 1, "C20" -> 20)
function getSeatNumber(seat) {
  const match = seat.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Function to generate boarding sequence
function generateBoardingSequence(bookings) {
  // Calculate max seat distance for each booking
  const bookingsWithMaxDistance = bookings.map(booking => ({
    ...booking,
    maxDistance: Math.max(...booking.Seats.map(seat => getSeatNumber(seat)))
  }));

  // Sort: descending by maxDistance, then ascending by Booking_ID
  bookingsWithMaxDistance.sort((a, b) => {
    if (b.maxDistance !== a.maxDistance) {
      return b.maxDistance - a.maxDistance;
    }
    return a.Booking_ID - b.Booking_ID;
  });

  // Return sequence with Seq numbers
  return bookingsWithMaxDistance.map((booking, index) => ({
    Seq: index + 1,
    Booking_ID: booking.Booking_ID
  }));
}

// Endpoint to handle file upload or JSON data
app.post('/api/boarding-sequence', upload.single('file'), (req, res) => {
  let bookings = [];

  if (req.file) {
    // Parse CSV file
    const csvData = req.file.buffer.toString('utf-8');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    bookings = parsed.data.map(row => ({
      Booking_ID: parseInt(row.Booking_ID, 10),
      Seats: row.Seats.split('|')
    }));
  } else if (req.body.bookings) {
    // Use JSON data from request body
    bookings = req.body.bookings;
  } else {
    return res.status(400).json({ error: 'No file or bookings data provided' });
  }

  if (!bookings.length) {
    return res.status(400).json({ error: 'No valid bookings data' });
  }

  const sequence = generateBoardingSequence(bookings);
  res.json(sequence);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
